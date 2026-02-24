import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import SubscriptionCard from '@/components/dashboard/SubscriptionCard'
import UsageMeter from '@/components/dashboard/UsageMeter'
import Link from 'next/link'
import { Plus, MessageSquare, Users } from 'lucide-react'

export default async function DashboardPage(): Promise<React.JSX.Element> {
  const session = await auth()
  if (!session?.user?.email) {
    return <div>Please sign in</div>
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      usageRecords: {
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      },
    },
  })

  if (!user) {
    return <div>User not found</div>
  }

  const usageCount = user.usageRecords.filter((r) => r.type === 'AI_DISCUSSION').length

  const limits: Record<string, number> = {
    FREE: 10,
    STARTER: 100,
    PRO: 1000,
    ENTERPRISE: 999999,
  }

  const limit = limits[user.subscriptionTier] || 10

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user.name || 'there'}!</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <SubscriptionCard
          tier={user.subscriptionTier}
          status={user.subscriptionStatus}
        />

        <UsageMeter used={usageCount} limit={limit} tier={user.subscriptionTier} />

        <div className="rounded-2xl border border-white/8 bg-white/2 p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              href="/discuss/new"
              className="flex items-center gap-3 rounded-xl bg-brand-purple px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-purple/90"
            >
              <Plus className="h-4 w-4" />
              New Discussion
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-white/10"
            >
              <MessageSquare className="h-4 w-4" />
              View History
            </Link>
            <Link
              href="/pricing"
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-white/10"
            >
              <Users className="h-4 w-4" />
              Upgrade Plan
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
