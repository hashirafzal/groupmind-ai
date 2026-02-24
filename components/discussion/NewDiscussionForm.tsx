'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Loader2, Sparkles, Lock, Check } from 'lucide-react'
import { personas, getMaxPersonas, isPersonaLocked } from '@/lib/ai/personas'
import type { SubscriptionTier } from '@prisma/client'

interface NewDiscussionFormProps {
  tier?: SubscriptionTier
}

export default function NewDiscussionForm({ tier = 'FREE' }: NewDiscussionFormProps): React.JSX.Element {
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>(['strategist', 'simplifier', 'mentor'])
  const [loading, setLoading] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [lockedPersonaName, setLockedPersonaName] = useState('')

  const maxPersonas = getMaxPersonas(tier)

  const togglePersona = (personaId: string) => {
    const persona = personas.find(p => p.id === personaId)
    if (!persona) return

    const locked = isPersonaLocked(persona, tier)
    if (locked) {
      setLockedPersonaName(persona.displayName)
      setShowUpgradeModal(true)
      return
    }

    setSelectedPersonas(prev => 
      prev.includes(personaId) 
        ? prev.filter(id => id !== personaId)
        : prev.length < maxPersonas
          ? [...prev, personaId]
          : prev
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || selectedPersonas.length === 0) return

    setLoading(true)
    try {
      const response = await fetch('/api/ai/discuss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, personas: selectedPersonas }),
      })

      const data = await response.json()

      if (data.conversationId) {
        router.push(`/discuss/${data.conversationId}`)
      } else {
        console.error('Failed to create discussion:', data.error)
      }
    } catch (error) {
      console.error('Error creating discussion:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="prompt" className="mb-2 block text-sm font-medium text-foreground">
            What would you like to discuss?
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your question, idea, or topic..."
            className="min-h-[150px] w-full rounded-xl border border-white/10 bg-white/5 p-4 text-foreground placeholder:text-muted-foreground focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple"
            required
          />
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              Select AI Personas
            </label>
            <span className="text-xs text-muted-foreground">
              {selectedPersonas.length}/{maxPersonas} selected
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {personas.map((persona) => {
              const locked = isPersonaLocked(persona, tier)
              const selected = selectedPersonas.includes(persona.id)

              return (
                <button
                  key={persona.id}
                  type="button"
                  onClick={() => togglePersona(persona.id)}
                  className={`relative rounded-xl border p-4 text-left transition-all ${
                    selected
                      ? 'border-brand-purple bg-brand-purple/10'
                      : locked
                      ? 'border-white/10 bg-white/5 opacity-70'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  {selected && (
                    <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-purple">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                  {locked && (
                    <div className="absolute right-2 top-2">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-2 w-2 rounded-full" 
                      style={{ backgroundColor: persona.color }} 
                    />
                    <span className="font-medium text-foreground">{persona.displayName}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{persona.description}</p>
                  {locked && (
                    <span className="mt-2 inline-block rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-400">
                      {persona.requiredTier}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !prompt.trim() || selectedPersonas.length === 0}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-purple px-6 py-3 font-medium text-white transition-colors hover:bg-brand-purple/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Creating Discussion...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Start Discussion
            </>
          )}
        </button>
      </form>

      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 rounded-2xl border border-white/10 bg-[#0A0A0F] p-6 shadow-2xl">
            <h3 className="mb-2 text-lg font-bold text-foreground">
              {lockedPersonaName} Requires Upgrade
            </h3>
            <p className="mb-6 text-muted-foreground">
              This persona is available on higher tier plans. Upgrade to access all 10 personas and get more discussions per month.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-white/5"
              >
                Maybe Later
              </button>
              <button
                onClick={() => {
                  setShowUpgradeModal(false)
                  window.location.href = '/pricing'
                }}
                className="flex-1 rounded-xl bg-brand-purple px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-purple/90"
              >
                Upgrade Now →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
