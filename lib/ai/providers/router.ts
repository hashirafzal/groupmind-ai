import type { AIProvider, AIInput, AIOutput, ProviderId } from './interface'
import { groqProvider } from './groq'
import { geminiProvider } from './gemini'
import { openRouterProvider } from './openrouter'
import { huggingFaceProvider } from './huggingface'
import { aimlapiProvider } from './aimlapi'

const TIMEOUT_MS = 15000

const providerMap: Record<ProviderId, AIProvider> = {
  groq: groqProvider,
  google: geminiProvider,
  openrouter: openRouterProvider,
  huggingface: huggingFaceProvider,
  aimlapi: aimlapiProvider,
}

const priorityOrder: ProviderId[] = ['groq', 'google', 'openrouter', 'huggingface', 'aimlapi']

interface CacheEntry {
  content: string
  timestamp: number
}

const responseCache = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 5 * 60 * 1000

function getCacheKey(prompt: string, providerId: string): string {
  return `${providerId}:${prompt.slice(0, 100)}`
}

function getCachedResponse(key: string): string | null {
  const entry = responseCache.get(key)
  if (entry && Date.now() - entry.timestamp < CACHE_TTL_MS) {
    return entry.content
  }
  responseCache.delete(key)
  return null
}

function setCachedResponse(key: string, content: string): void {
  if (responseCache.size > 100) {
    const oldestKey = responseCache.keys().next().value
    if (oldestKey) responseCache.delete(oldestKey)
  }
  responseCache.set(key, { content, timestamp: Date.now() })
}

function isRetriableError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    return (
      message.includes('timeout') ||
      message.includes('429') ||
      message.includes('rate limit') ||
      message.includes('network') ||
      message.includes('ECONNREFUSED') ||
      message.includes('ETIMEDOUT') ||
      message.includes('empty')
    )
  }
  return false
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), ms)
    ),
  ])
}

let lastUsedProvider: ProviderId | null = null

export function getLastProvider(): ProviderId | null {
  return lastUsedProvider
}

export async function generateWithFallback(
  input: AIInput,
  preferredProvider?: ProviderId
): Promise<{ output: AIOutput; provider: ProviderId }> {
  const triedProviders = new Set<ProviderId>()

  let providersToTry = [...priorityOrder]
  if (preferredProvider && !triedProviders.has(preferredProvider)) {
    providersToTry = [preferredProvider, ...providersToTry.filter(p => p !== preferredProvider)]
  }

  let lastError: unknown = new Error('No providers available')

  for (const providerId of providersToTry) {
    if (triedProviders.has(providerId)) continue
    triedProviders.add(providerId)

    const provider = providerMap[providerId]
    const cacheKey = getCacheKey(input.prompt, providerId)
    const cached = getCachedResponse(cacheKey)

    if (cached) {
      lastUsedProvider = providerId
      return {
        output: {
          agentId: input.persona.id,
          content: cached,
          tokensUsed: Math.ceil(cached.split(/\s+/).length * 1.3),
        },
        provider: providerId,
      }
    }

    try {
      const output = await withTimeout(provider.generate(input), TIMEOUT_MS)

      if (!output.content || output.content.trim() === '') {
        throw new Error('Empty response')
      }

      setCachedResponse(cacheKey, output.content)
      lastUsedProvider = providerId

      return { output, provider: providerId }
    } catch (error) {
      lastError = error
      if (!isRetriableError(error)) {
        break
      }
    }
  }

  throw new Error('AI services temporarily unavailable.')
}

export async function generateTextWithFallback(
  prompt: string,
  options?: {
    temperature?: number
    maxTokens?: number
    systemPrompt?: string
    provider?: ProviderId
  }
): Promise<{ text: string; provider: ProviderId }> {
  const triedProviders = new Set<ProviderId>()

  let providersToTry = [...priorityOrder]
  const preferredProvider = options?.provider
  if (preferredProvider && !triedProviders.has(preferredProvider)) {
    providersToTry = [preferredProvider, ...providersToTry.filter(p => p !== preferredProvider)]
  }

  for (const providerId of providersToTry) {
    if (triedProviders.has(providerId)) continue
    triedProviders.add(providerId)

    const provider = providerMap[providerId]
    const cacheKey = getCacheKey(prompt, providerId)
    const cached = getCachedResponse(cacheKey)

    if (cached) {
      lastUsedProvider = providerId
      return { text: cached, provider: providerId }
    }

    try {
      const text = await withTimeout(
        provider.generateText(prompt, {
          temperature: options?.temperature ?? 0.7,
          maxTokens: options?.maxTokens ?? 120,
          systemPrompt: options?.systemPrompt,
        }),
        TIMEOUT_MS
      )

      if (!text || text.trim() === '') {
        throw new Error('Empty response')
      }

      setCachedResponse(cacheKey, text)
      lastUsedProvider = providerId

      return { text, provider: providerId }
    } catch (error) {
      if (!isRetriableError(error)) {
        break
      }
    }
  }

  throw new Error('AI services temporarily unavailable.')
}

export function clearCache(): void {
  responseCache.clear()
}
