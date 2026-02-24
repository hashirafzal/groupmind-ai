import { prisma } from '@/lib/prisma'
import type { SubscriptionTier, UsageType } from '@prisma/client'

const TIER_LIMITS: Record<SubscriptionTier, number> = {
  FREE: 10,
  STARTER: 100,
  PRO: 1000,
  ENTERPRISE: -1, // unlimited
}

const USAGE_TYPE_MAP: Record<string, UsageType> = {
  discussion: 'AI_DISCUSSION',
}

export interface UsageLimitResult {
  allowed: boolean
  limitExceeded?: boolean
  currentUsage?: number
  limit?: number
  upgradeUrl?: string
  resetDate?: string
}

export async function checkUsageLimit(
  userId: string,
  usageType: string
): Promise<UsageLimitResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true },
  })

  if (!user) {
    return { allowed: false }
  }

  const tier = user.subscriptionTier as SubscriptionTier
  const limit = TIER_LIMITS[tier]

  // Enterprise has unlimited
  if (limit === -1) {
    return { allowed: true }
  }

  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format

  const usageCount = await prisma.usageRecord.count({
    where: {
      userId,
      type: USAGE_TYPE_MAP[usageType] || 'AI_DISCUSSION',
      createdAt: {
        gte: new Date(`${currentMonth}-01`),
      },
    },
  })

  const remaining = limit - usageCount

  if (remaining <= 0) {
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    const resetDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1).toISOString()

    return {
      allowed: false,
      limitExceeded: true,
      currentUsage: usageCount,
      limit,
      upgradeUrl: '/pricing',
      resetDate,
    }
  }

  return {
    allowed: true,
    currentUsage: usageCount,
    limit,
  }
}

export async function recordUsage(
  userId: string,
  usageType: string,
  metadata?: Record<string, any>
): Promise<void> {
  const usageTypeEnum = USAGE_TYPE_MAP[usageType] || 'AI_DISCUSSION'

  await prisma.usageRecord.create({
    data: {
      userId,
      type: usageTypeEnum,
      metadata: (metadata || null) as any,
    },
  })
}

export async function getCurrentUsage(userId: string, usageType: string): Promise<number> {
  const currentMonth = new Date().toISOString().slice(0, 7)

  return prisma.usageRecord.count({
    where: {
      userId,
      type: USAGE_TYPE_MAP[usageType] || 'AI_DISCUSSION',
      createdAt: {
        gte: new Date(`${currentMonth}-01`),
      },
    },
  })
}

export function getUsageLimit(tier: SubscriptionTier): number {
  return TIER_LIMITS[tier]
}
