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

  const promises = activePersonas.map(persona =>
    generateWithFallback(
      {
        prompt,
        persona: {
          id: persona.id,
          name: persona.displayName,
          systemPrompt: persona.systemPrompt,
          temperature: persona.temperature,
        },
        conversationHistory: conversationHistory,
      },
      preferredProvider
    ).then(result => {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log(`[AI] Agent ${persona.id} generated using provider: ${result.provider}`)
      }
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
