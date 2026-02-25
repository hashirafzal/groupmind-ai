import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { z } from 'zod'
import type { UsageType } from '@prisma/client'

export const runtime = 'nodejs'

const checkSchema = z.object({
  usageType: z.string(),
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

    const body = await req.json()
    const parsed = checkSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const { usageType } = parsed.data
    const TIER_LIMITS = { FREE: 10, STARTER: 100, PRO: 1000, ENTERPRISE: -1 }

    const tier = user.subscriptionTier as keyof typeof TIER_LIMITS
    const limit = TIER_LIMITS[tier]

    if (limit === -1) {
      return NextResponse.json({ allowed: true, limit: -1 })
    }

    const currentMonth = new Date().toISOString().slice(0, 7)
    const usageTypeMap: Record<string, UsageType> = {
      discussion: 'AI_DISCUSSION',
    }

    const count = await prisma.usageRecord.count({
      where: {
        userId: user.id,
        type: usageTypeMap[usageType] || 'AI_DISCUSSION',
        createdAt: {
          gte: new Date(`${currentMonth}-01`),
        },
      },
    })

    const remaining = limit - count

    if (remaining <= 0) {
      const nextMonth = new Date()
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      const resetDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1).toISOString()

      return NextResponse.json({
        allowed: false,
        limitExceeded: true,
        currentUsage: count,
        limit,
        resetDate,
      })
    }

    return NextResponse.json({
      allowed: true,
      currentUsage: count,
      limit,
    })
  } catch (error) {
    console.error('[USAGE_CHECK]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
