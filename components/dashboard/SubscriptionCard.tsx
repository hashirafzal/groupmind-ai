'use client'

import { useState } from 'react'
import { Check, X, Crown, Zap } from 'lucide-react'
import Link from 'next/link'

interface SubscriptionCardProps {
  tier: string
  status: string | null
}

const tierFeatures: Record<string, { limit: number; voice: boolean; team: boolean }> = {
  FREE: { limit: 10, voice: false, team: false },
  STARTER: { limit: 100, voice: false, team: true },
  PRO: { limit: 1000, voice: true, team: true },
  ENTERPRISE: { limit: 999999, voice: true, team: true },
}

export default function SubscriptionCard({ tier, status }: SubscriptionCardProps): React.JSX.Element {
  const [loading, setLoading] = useState(false)
  const features = tierFeatures[tier] || tierFeatures.FREE

  const handleManage = async (): Promise<void> => {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Portal error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-white/8 bg-white/2 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Your Plan</h3>
        {tier === 'PRO' || tier === 'ENTERPRISE' ? (
          <Crown className="h-5 w-5 text-yellow-500" />
        ) : (
          <Zap className="h-5 w-5 text-brand-purple" />
        )}
      </div>

      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-foreground">{tier}</span>
          {status && (
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                status === 'ACTIVE'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}
            >
              {status}
            </span>
          )}
        </div>
      </div>

      <ul className="mb-6 space-y-2">
        <li className="flex items-center gap-2 text-sm text-muted-foreground">
          {features.limit >= 999999 ? (
            <>
              <Check className="h-4 w-4 text-brand-cyan" />
              Unlimited AI discussions
            </>
          ) : (
            <>
              <Check className="h-4 w-4 text-brand-cyan" />
              {features.limit} AI discussions/month
            </>
          )}
        </li>
        <li className="flex items-center gap-2 text-sm text-muted-foreground">
          {features.voice ? (
            <Check className="h-4 w-4 text-brand-cyan" />
          ) : (
            <X className="h-4 w-4 text-muted-foreground/40" />
          )}
          Voice mode
        </li>
        <li className="flex items-center gap-2 text-sm text-muted-foreground">
          {features.team ? (
            <Check className="h-4 w-4 text-brand-cyan" />
          ) : (
            <X className="h-4 w-4 text-muted-foreground/40" />
          )}
          Team collaboration
        </li>
      </ul>

      {tier === 'FREE' ? (
        <Link
          href="/pricing"
          className="block w-full rounded-xl bg-brand-purple px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-purple/90"
        >
          Upgrade Plan
        </Link>
      ) : (
        <button
          onClick={handleManage}
          disabled={loading}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-white/10 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Manage Subscription'}
        </button>
      )}
    </div>
  )
}
