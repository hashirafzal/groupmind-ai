import type { AIOutput, ProviderId } from './providers/interface'
import { generateWithFallback, getLastProvider } from './providers/router'
import { getPersonaById } from './personas'

export async function orchestrateDiscussion(
  prompt: string,
  personaIds: string[],
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [],
  preferredProvider?: ProviderId
): Promise<AIOutput[]> {
  const activePersonas = personaIds
    .map(id => getPersonaById(id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined)

  if (activePersonas.length === 0) {
    throw new Error('No valid personas selected')
  }

  const summaryPrompt = `Summarize the following discussion in 80 words or less: "${prompt}"`
  const summaryPersona = {
    id: 'summarizer',
    name: 'Summary',
    systemPrompt: 'You are a concise summarizer. Provide brief summaries under 80 words.',
    temperature: 0.3,
  }

  try {
    const summaryResult = await generateWithFallback(
      { prompt: summaryPrompt, persona: summaryPersona, conversationHistory: [] },
      preferredProvider
    )
    console.log(`[AI] Summary generated using provider: ${summaryResult.provider}`)
  } catch {
    console.log('[AI] Summary generation failed, continuing with agents')
  }

  const promises = activePersonas.map(persona =>
    generateWithFallback(
      {
        prompt,
        persona,
        conversationHistory: conversationHistory.slice(-4),
      },
      preferredProvider
    ).then(result => {
      console.log(`[AI] Agent ${persona.id} generated using provider: ${result.provider}`)
      return result.output
    })
  )

  const results = await Promise.allSettled(promises)
  const responses: AIOutput[] = []

  for (const result of results) {
    if (result.status === 'fulfilled') {
      responses.push(result.value)
    }
  }

  return responses
}

export { getLastProvider }
