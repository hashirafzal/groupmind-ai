'use client'

import { Activity } from 'lucide-react'

interface UsageMeterProps {
  used: number
  limit: number
  tier: string
}

export default function UsageMeter({ used, limit, tier }: UsageMeterProps): React.JSX.Element {
  const percentage = Math.min((used / limit) * 100, 100)
  const isNearLimit = percentage > 80

  return (
    <div className="rounded-2xl border border-white/8 bg-white/2 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Usage This Month</h3>
        <Activity className={`h-5 w-5 ${isNearLimit ? 'text-yellow-500' : 'text-brand-cyan'}`} />
      </div>

      <div className="mb-2 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-foreground">{used}</span>
        <span className="text-muted-foreground">/ {limit}</span>
      </div>

      <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full transition-all ${
            isNearLimit ? 'bg-yellow-500' : 'bg-brand-cyan'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="text-sm text-muted-foreground">
        {limit - used > 0
          ? `${limit - used} AI discussions remaining this month`
          : 'Limit reached. Upgrade for more.'}
      </p>

      {tier === 'FREE' && (
        <a
          href="/pricing"
          className="mt-4 block w-full rounded-xl border border-brand-purple/30 bg-brand-purple/10 px-4 py-2.5 text-center text-sm font-semibold text-brand-purple transition-colors hover:bg-brand-purple/20"
        >
          Upgrade for More
        </a>
      )}
    </div>
  )
}
