'use client'

import { useState } from 'react'
import { ChevronDown, Loader2 } from 'lucide-react'
import AgentResponse from './AgentResponse'
import type { Persona } from '@/lib/ai/personas'
import type { SubscriptionTier } from '@prisma/client'

interface PersonaResponse {
  personaId: string
  content: string
  reasoning?: string
  isLoading: boolean
}

interface RoundtableGridProps {
  responses: PersonaResponse[]
  personas: Persona[]
  tier: SubscriptionTier
  onExpand?: (personaId: string) => void
}

const personaColors: Record<string, string> = {
  strategist: '#8B5CF6',
  simplifier: '#10B981',
  mentor: '#3B82F6',
  engineer: '#F59E0B',
  analyst: '#6366F1',
  creative: '#EC4899',
  critic: '#EF4444',
  researcher: '#14B8A6',
  operator: '#F97316',
  visionary: '#A855F7',
}

function ThinkingSkeleton({ personaName, color }: { personaName: string; color: string }) {
  return (
    <div className="animate-pulse space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-sm font-medium" style={{ color }}>
          {personaName} is thinking...
        </span>
      </div>
      <div className="space-y-2">
        <div className="h-4 w-3/4 rounded bg-white/10" />
        <div className="h-4 w-1/2 rounded bg-white/10" />
        <div className="h-4 w-5/6 rounded bg-white/10" />
      </div>
    </div>
  )
}

export default function RoundtableGrid({
  responses,
  personas,
  tier,
  onExpand,
}: RoundtableGridProps): React.JSX.Element {
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  const getPersona = (personaId: string): Persona | undefined => {
    return personas.find((p) => p.id === personaId)
  }

  const toggleExpand = (personaId: string) => {
    if (expandedCard === personaId) {
      setExpandedCard(null)
    } else {
      setExpandedCard(personaId)
      if (onExpand) {
        onExpand(personaId)
      }
    }
  }

  if (responses.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">
          Select personas and enter a prompt to start the discussion
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {responses.map((response) => {
        const persona = getPersona(response.personaId)
        if (!persona) return null

        const color = personaColors[response.personaId] || '#8B5CF6'
        const isExpanded = expandedCard === response.personaId

        return (
          <div
            key={response.personaId}
            className="group relative flex flex-col rounded-xl border border-white/10 bg-white/5 transition-all hover:border-white/20"
            style={{ borderTopColor: color, borderTopWidth: '3px' }}
          >
            <div className="flex-1 p-4">
              {response.isLoading ? (
                <ThinkingSkeleton personaName={persona.displayName} color={color} />
              ) : (
                <AgentResponse
                  personaId={response.personaId}
                  displayName={persona.displayName}
                  content={response.content}
                  tier={tier}
                  expanded={isExpanded}
                />
              )}
            </div>

            {!response.isLoading && (
              <button
                onClick={() => toggleExpand(response.personaId)}
                className="flex w-full items-center justify-center gap-1 border-t border-white/10 p-3 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
              >
                {isExpanded ? 'Show Less' : 'Dive Deeper →'}
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
