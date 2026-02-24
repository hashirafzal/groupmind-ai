import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { orchestrateDiscussion } from '@/lib/ai/orchestrator'

const discussSchema = z.object({
  prompt: z.string().min(1).max(500),
  personas: z.array(z.string()).min(1),
  provider: z.enum(['groq', 'google', 'openrouter', 'huggingface', 'aimlapi']).optional(),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
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

    const { prompt, personas, provider } = parsed.data

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const conversation = await prisma.conversation.create({
      data: {
        title: prompt.slice(0, 100),
        createdById: user.id,
      },
    })

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'USER',
        content: prompt,
      },
    })

    const aiResponses = await orchestrateDiscussion(prompt, personas, [], provider)

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

    return NextResponse.json(
      { conversationId: conversation.id, message: 'Discussion created' },
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
