import type { AIProvider, AIInput, AIOutput } from './interface'

export class GroqProvider implements AIProvider {
  id = 'groq' as const
  private baseUrl = 'https://api.groq.com/openai/v1'
  private model = 'llama-3.3-70b-versatile'

  private async callApi(messages: Array<{ role: string; content: string }>, temperature: number, maxTokens: number): Promise<string> {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) throw new Error('GROQ_API_KEY not configured')

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Groq API error: ${response.status} - ${err}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || ''
  }

  async generate(input: AIInput): Promise<AIOutput> {
    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: input.persona.systemPrompt },
      ...input.conversationHistory.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: input.prompt },
    ]

    const text = await this.callApi(messages, input.persona.temperature, 120)
    const tokensUsed = Math.ceil(text.split(/\s+/).length * 1.3)

    return {
      agentId: input.persona.id,
      content: text,
      tokensUsed,
    }
  }

  async generateText(prompt: string, options?: { temperature?: number; maxTokens?: number; systemPrompt?: string }): Promise<string> {
    const messages = [
      { role: 'system', content: options?.systemPrompt || 'You are a helpful assistant.' },
      { role: 'user', content: prompt },
    ]
    return this.callApi(messages, options?.temperature ?? 0.7, options?.maxTokens ?? 120)
  }
}

export const groqProvider = new GroqProvider()
