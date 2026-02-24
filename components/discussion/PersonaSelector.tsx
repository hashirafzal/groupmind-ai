'use client'

import { useState } from 'react'
import { Lock, Check } from 'lucide-react'
import { personas, getMaxPersonas, isPersonaLocked, type Persona } from '@/lib/ai/personas'
import type { SubscriptionTier } from '@prisma/client'

interface PersonaSelectorProps {
  selectedPersonas: string[]
  onPersonaToggle: (personaId: string) => void
  tier: SubscriptionTier
  onUpgradeClick?: () => void
}

const tierBadges: Record<string, { label: string; color: string }> = {
  FREE: { label: 'Free', color: 'bg-green-500/20 text-green-400' },
  STARTER: { label: 'Starter', color: 'bg-blue-500/20 text-blue-400' },
  PRO: { label: 'Pro', color: 'bg-purple-500/20 text-purple-400' },
  ENTERPRISE: { label: 'Enterprise', color: 'bg-amber-500/20 text-amber-400' },
}

export default function PersonaSelector({
  selectedPersonas,
  onPersonaToggle,
  tier,
  onUpgradeClick,
}: PersonaSelectorProps): React.JSX.Element {
  const maxPersonas = getMaxPersonas(tier)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [lockedPersona, setLockedPersona] = useState<Persona | null>(null)
  const [isVisible, setIsVisible] = useState(true)

  const handlePersonaClick = (persona: Persona) => {
    const locked = isPersonaLocked(persona, tier)

    if (locked) {
      setLockedPersona(persona)
      setShowUpgradeModal(true)
      if (onUpgradeClick) {
        onUpgradeClick()
      }
      return
    }

    // Check if max selected
    if (!selectedPersonas.includes(persona.id) && selectedPersonas.length >= maxPersonas) {
      return
    }

    onPersonaToggle(persona.id)
  }

  const closeModal = () => {
    setShowUpgradeModal(false)
    setLockedPersona(null)
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {selectedPersonas.length} of {personas.length} personas selected
          </span>
          <span className="text-sm text-muted-foreground">
            Max: {maxPersonas}
          </span>
        </div>
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="text-xs font-medium text-white/50 transition-colors hover:text-white"
        >
          {isVisible ? 'Hide Personas ▲' : 'Show Personas ▼'}
        </button>
      </div>

      <div
        className={`transition-all duration-300 ease-in-out ${
          isVisible
            ? 'max-h-[500px] opacity-100'
            : 'pointer-events-none max-h-0 overflow-hidden opacity-0'
        }`}
      >
        <div className="flex gap-3 overflow-x-auto pb-4 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-track]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-white/40">
          {personas.map((persona) => {
            const locked = isPersonaLocked(persona, tier)
            const selected = selectedPersonas.includes(persona.id)
            const tierBadge = tierBadges[persona.requiredTier]

            return (
              <button
                key={persona.id}
                onClick={() => handlePersonaClick(persona)}
                className={`relative flex min-w-[160px] flex-col rounded-xl border p-4 text-left transition-all ${
                  selected
                    ? 'border-brand-purple bg-brand-purple/10 shadow-lg shadow-brand-purple/20'
                    : locked
                    ? 'border-amber-500/30 bg-amber-500/5'
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

                <div
                  className="mb-2 flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold text-white"
                  style={{ backgroundColor: persona.color }}
                >
                  {persona.displayName.charAt(0)}
                </div>

                <span className="font-medium text-foreground">{persona.displayName}</span>

                <span className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {persona.description}
                </span>

                <span
                  className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs ${
                    tierBadge.color
                  }`}
                >
                  {tierBadge.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {showUpgradeModal && lockedPersona && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 rounded-2xl border border-white/10 bg-[#0A0A0F] p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold text-white"
                style={{ backgroundColor: lockedPersona.color }}
              >
                {lockedPersona.displayName.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {lockedPersona.displayName} is a Pro Feature
                </h3>
                <p className="text-sm text-muted-foreground">
                  Upgrade to unlock this persona
                </p>
              </div>
            </div>

            <p className="mb-6 text-muted-foreground">
              The {lockedPersona.displayName} persona requires a{' '}
              <span className="text-brand-purple">{lockedPersona.requiredTier}</span> subscription
              or higher. Upgrade now to access all 10 personas and get 1000 discussions/month.
            </p>

            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-white/5"
              >
                Maybe Later
              </button>
              <button
                onClick={() => {
                  closeModal()
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
