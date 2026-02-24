import type { Message } from '@prisma/client'

export interface AIInput {
  prompt: string
  persona: AgentPersonaConfig
  conversationHistory: Message[]
}

export interface AIOutput {
  agentId: string
  content: string
  reasoning?: string
  tokensUsed: number
}

export interface AIProvider {
  generate(input: AIInput): Promise<AIOutput>
}

export interface AgentPersonaConfig {
  id: string
  name: string
  description: string
  systemPrompt: string
  reasoningStyle: string
  temperature: number
}
