export interface AgentPersona {
  id: string
  name: string
  systemPrompt: string
  temperature: number
}

export interface AIInput {
  prompt: string
  persona: AgentPersona
  conversationHistory: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
}

export interface AIOutput {
  agentId: string
  content: string
  reasoning?: string
  tokensUsed: number
}

export interface AIProvider {
  id: string
  generate(input: AIInput): Promise<AIOutput>
  generateText(prompt: string, options?: { temperature?: number; maxTokens?: number; systemPrompt?: string }): Promise<string>
}

export type ProviderId = 'groq' | 'google' | 'openrouter' | 'huggingface' | 'aimlapi'

export interface ProviderConfig {
  id: ProviderId
  name: string
  apiKey?: string
  baseUrl?: string
  model?: string
}

export const PROVIDER_PRIORITY: ProviderId[] = ['groq', 'google', 'openrouter', 'huggingface', 'aimlapi']
