import { GoogleGenerativeAI } from '@google/generative-ai'
import type { AIProvider, AIInput, AIOutput } from './interface'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '')

export class GeminiProvider implements AIProvider {
  id = 'google' as const

  async generate(input: AIInput): Promise<AIOutput> {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: input.persona.systemPrompt,
      generationConfig: {
        temperature: input.persona.temperature,
        maxOutputTokens: 2048,
      },
    })

    const history = input.conversationHistory
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n')

    const prompt = history
      ? `${history}\n\nUser: ${input.prompt}`
      : input.prompt

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()
    const tokensUsed = Math.ceil(text.split(/\s+/).length * 1.3)

    return {
      agentId: input.persona.id,
      content: text,
      tokensUsed,
    }
  }

  async generateText(prompt: string, options?: { temperature?: number; maxTokens?: number; systemPrompt?: string }): Promise<string> {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: options?.systemPrompt || 'You are a helpful assistant.',
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.maxTokens ?? 120,
      },
    })

    const result = await model.generateContent(prompt)
    return result.response.text()
  }
}

export const geminiProvider = new GeminiProvider()
