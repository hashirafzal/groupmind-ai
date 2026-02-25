import { prisma } from '@/lib/prisma'
import { generateWithFallback } from './providers/router'


interface BuildContextResult {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
  shouldGenerateSummary: boolean
}

export async function buildContextWindow(
  conversationId: string,
  newMessage: string
): Promise<BuildContextResult> {
  // Fetch last 6 messages (3 user + 3 assistant)
  const recentMessages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'desc' },
    take: 6,
  })

  const totalMessageCount = await prisma.message.count({
    where: { conversationId },
  })

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { contextSummary: true },
  })

  // Reverse to get chronological order
  const recentMessagesChrono = recentMessages.reverse()

  // If more than 6 messages and no summary, we need to generate one
  if (totalMessageCount > 6 && !conversation?.contextSummary) {
    return {
      messages: [
        { role: 'user', content: newMessage },
      ],
      shouldGenerateSummary: true,
    }
  }

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = []

  // Add summary if exists
  if (conversation?.contextSummary) {
    messages.push({
      role: 'system',
      content: `Previous context: ${conversation.contextSummary}`,
    })
  }

  // Add recent messages
  for (const msg of recentMessagesChrono) {
    messages.push({
      role: msg.role === 'USER' ? 'user' : 'assistant',
      content: msg.content,
    })
  }

  // Add new message
  messages.push({ role: 'user', content: newMessage })

  return {
    messages,
    shouldGenerateSummary: false,
  }
}

export async function generateAndStoreSummary(conversationId: string): Promise<string> {
  // Get all messages except the most recent 6
  const allMessages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    take: -6, // Skip last 6, get older ones
  })

  if (allMessages.length === 0) {
    return ''
  }

  const contentForSummary = allMessages
    .map((m) => `${m.role === 'USER' ? 'User' : 'AI'}: ${m.content}`)
    .join('\n\n')

  const summaryPersona = {
    id: 'summarizer',
    name: 'Summary',
    systemPrompt: `You are a concise summarizer. Summarize conversations in 3-4 sentences preserving key decisions, conclusions and context.`,
    temperature: 0.3,
  }

  try {
    const result = await generateWithFallback(
      {
        prompt: `Summarize this conversation in 3-4 sentences preserving key decisions, conclusions and context:\n\n${contentForSummary}`,
        persona: summaryPersona,
        conversationHistory: [],
      }
    )

    const summary = result.output.content

    // Store in database
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { contextSummary: summary },
    })

    return summary
  } catch (error) {
    console.error('Failed to generate summary:', error)
    return ''
  }
}

export function formatContextForAI(
  conversationId: string,
  newMessage: string
): Promise<Array<{ role: 'system' | 'user' | 'assistant'; content: string }>> {
  return buildContextWindow(conversationId, newMessage).then((result) => result.messages)
}
