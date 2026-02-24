import type { AIProvider, AIInput, AIOutput } from './interface'

export class HuggingFaceProvider implements AIProvider {
  id = 'huggingface' as const
  private baseUrl = 'https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-3B-Instruct'
  private model = 'meta-llama/Llama-3.2-3B-Instruct'

  private async callApi(prompt: string, temperature: number, maxTokens: number): Promise<string> {
    const apiKey = process.env.HUGGINGFACE_API_KEY
    if (!apiKey) throw new Error('HUGGINGFACE_API_KEY not configured')

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          temperature,
          max_new_tokens: maxTokens,
          return_full_text: false,
        },
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`HuggingFace API error: ${response.status} - ${err}`)
    }

    const data = await response.json()
    if (Array.isArray(data) && data[0]?.generated_text) {
      return data[0].generated_text
    }
    return ''
  }

  async generate(input: AIInput): Promise<AIOutput> {
    const history = input.conversationHistory
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n')
    const prompt = history
      ? `${history}\n\nUser: ${input.prompt}\n\nAssistant:`
      : `User: ${input.prompt}\n\nAssistant:`

    const text = await this.callApi(prompt, input.persona.temperature, 80)
    const tokensUsed = Math.ceil(text.split(/\s+/).length * 1.3)

    return {
      agentId: input.persona.id,
      content: text,
      tokensUsed,
    }
  }

  async generateText(prompt: string, options?: { temperature?: number; maxTokens?: number; systemPrompt?: string }): Promise<string> {
    const fullPrompt = options?.systemPrompt
      ? `${options.systemPrompt}\n\nUser: ${prompt}\n\nAssistant:`
      : `User: ${prompt}\n\nAssistant:`
    return this.callApi(fullPrompt, options?.temperature ?? 0.7, options?.maxTokens ?? 80)
  }
}

export const huggingFaceProvider = new HuggingFaceProvider()
