import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { z } from 'zod'
import { generateWithFallback } from '@/lib/ai/providers/router'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const compareSchema = z.object({
  responseA: z.string().min(1),
  responseB: z.string().min(1),
  responseC: z.string().optional(),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { prisma } = await import('@/lib/prisma')
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user has PRO or ENTERPRISE tier
    if (user.subscriptionTier !== 'PRO' && user.subscriptionTier !== 'ENTERPRISE') {
      return NextResponse.json(
        { error: 'Compare mode is available on Pro and Enterprise plans' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const parsed = compareSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { responseA, responseB, responseC } = parsed.data

    const comparisonPersona = {
      id: 'comparator',
      name: 'Comparison',
      systemPrompt: `You are an expert at comparing and contrasting different perspectives. 
Analyze the given responses and identify key differences in approach, conclusions, and insights.
Respond with a JSON array of strings, where each string is a key difference between the responses.
Focus on meaningful differences that would help a user understand how the perspectives differ.
Do not include any preamble or explanation - just the JSON array.`,
      temperature: 0.3,
    }

    let comparisonPrompt = `Compare these two AI persona responses and identify key differences:

Response A:
${responseA}

Response B:
${responseB}`

    if (responseC) {
      comparisonPrompt += `

Response C:
${responseC}`
    }

    comparisonPrompt += `\n\nRespond as a JSON array of strings, where each string is a key difference. Example: ["The Strategist focuses on ROI while the Mentor emphasizes personal growth", "The Analyst uses data-driven reasoning while the Creative relies on storytelling"]`

    const result = await generateWithFallback({
      prompt: comparisonPrompt,
      persona: comparisonPersona,
      conversationHistory: [],
    })

    let differences: string[] = []
    try {
      const parsedContent = JSON.parse(result.output.content)
      if (Array.isArray(parsedContent)) {
        differences = parsedContent
      }
    } catch {
      // If parsing fails, split by newlines or use the raw content
      differences = result.output.content
        .split('\n')
        .filter((line) => line.trim().length > 0)
        .slice(0, 5)
    }

    return NextResponse.json({ differences })
  } catch (error) {
    console.error('[AI_COMPARE]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
