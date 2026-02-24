'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface PricingButtonProps {
  tier: 'starter' | 'pro' | 'enterprise'
  children: React.ReactNode
  className?: string
  highlighted?: boolean
}

export default function PricingButton({ 
  tier, 
  children, 
  className = '',
  highlighted = false 
}: PricingButtonProps): React.JSX.Element {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      })

      const data = await response.json()

      if (data.url) {
        router.push(data.url)
      } else {
        console.error('Checkout failed:', data.error)
        router.push('/pricing?error=checkout_failed')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      router.push('/pricing?error=checkout_failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`block w-full rounded-xl px-4 py-3 text-center text-sm font-semibold transition-all disabled:opacity-50 ${
        highlighted
          ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/30 hover:bg-brand-purple/90'
          : 'border border-white/10 bg-white/5 text-foreground hover:bg-white/10'
      } ${className}`}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing...
        </span>
      ) : (
        children
      )}
    </button>
  )
}
