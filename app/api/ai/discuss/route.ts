import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { z } from 'zod'
import { orchestrateDiscussion } from '@/lib/ai/orchestrator'
import { recordUsage } from '@/lib/usage/enforce'
import { buildContextWindow, generateAndStoreSummary } from '@/lib/ai/context'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const discussSchema = z.object({
  prompt: z.string().min(1).max(2000),
  personas: z.array(z.string()).min(1),
  conversationId: z.string().optional(),
  provider: z.enum(['groq', 'google', 'openrouter', 'huggingface', 'aimlapi']).optional(),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { prisma } = await import('@/lib/prisma')
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = discussSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { prompt, personas, provider, conversationId } = parsed.data

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Record usage
    await recordUsage(user.id, 'discussion')

    let conversation;
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId }
      })
      
      if (!conversation || conversation.createdById !== user.id) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
      }
    } else {
      conversation = await prisma.conversation.create({
        data: {
          title: prompt.slice(0, 100),
          createdById: user.id,
        },
      })
    }

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'USER',
        content: prompt,
      },
    })

    const { messages: history, shouldGenerateSummary } = await buildContextWindow(conversation.id, prompt)

    const aiResponses = await orchestrateDiscussion(
      prompt,
      personas,
      history.map(h => ({ role: h.role === 'assistant' ? 'assistant' : 'user', content: h.content })),
      provider
    )

    for (const response of aiResponses) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          role: 'AGENT',
          agentId: response.agentId,
          content: response.content,
        },
      })
    }

    if (shouldGenerateSummary) {
      generateAndStoreSummary(conversation.id).catch(err => console.error('[SUMMARY_GEN]', err))
    }

    return NextResponse.json(
      { conversationId: conversation.id, messages: aiResponses.map(r => ({ role: 'AGENT', agentId: r.agentId, content: r.content })) },
      { status: 201 }
    )
  } catch (error) {
    console.error('[AI_DISCUSS]', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    if (message.includes('temporarily unavailable')) {
      return NextResponse.json({ error: message }, { status: 503 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
