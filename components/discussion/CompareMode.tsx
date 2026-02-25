'use client'

import { useState } from 'react'
import { ArrowLeftRight, Loader2, Download } from 'lucide-react'
import AgentResponse from './AgentResponse'
import type { Persona } from '@/lib/ai/personas'
import type { SubscriptionTier } from '@prisma/client'

interface CompareModeProps {
  selectedResponses: Array<{
    personaId: string
    content: string
  }>
  personas: Persona[]
  tier: SubscriptionTier
  onClose: () => void
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

export default function CompareMode({
  selectedResponses,
  personas,
  tier,
  onClose,
}: CompareModeProps): React.JSX.Element {
  const [isComparing, setIsComparing] = useState(false)
  const [differences, setDifferences] = useState<string[]>([])

  const getPersona = (personaId: string): Persona | undefined => {
    return personas.find((p) => p.id === personaId)
  }

  const handleCompare = async () => {
    setIsComparing(true)
    try {
      const responseContents = selectedResponses.map((r) => r.content)
      const response = await fetch('/api/ai/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responseA: responseContents[0],
          responseB: responseContents[1],
          responseC: responseContents[2] || undefined,
        }),
      })

      const data = await response.json()
      if (data.differences) {
        setDifferences(data.differences)
      }
    } catch (error) {
      console.error('Failed to compare:', error)
    } finally {
      setIsComparing(false)
    }
  }

  const handleExport = () => {
    const content = selectedResponses
      .map((r) => {
        const persona = getPersona(r.personaId)
        return `# ${persona?.displayName}\n\n${r.content}`
      })
      .join('\n\n---\n\n')

    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'groupmind-comparison.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0A0A0F]">
      <div className="flex items-center justify-between border-b border-white/10 p-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-white/5 hover:text-foreground"
          >
            <ArrowLeftRight className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-bold text-foreground">Compare Responses</h2>
          <span className="text-sm text-muted-foreground">
            ({selectedResponses.length} selected)
          </span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCompare}
            disabled={isComparing || selectedResponses.length < 2}
            className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-white/5 disabled:opacity-50"
          >
            {isComparing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Highlight Differences'
            )}
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-xl bg-brand-purple px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-purple/90"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div
          className={`flex gap-4 overflow-x-auto p-6 ${
            selectedResponses.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
          } ${selectedResponses.length === 2 ? 'grid' : ''}`}
          style={{
            gridTemplateColumns:
              selectedResponses.length === 2 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
          }}
        >
          {selectedResponses.map((response) => {
            const persona = getPersona(response.personaId)
            if (!persona) return null

            const color = personaColors[response.personaId] || '#8B5CF6'

            return (
              <div
                key={response.personaId}
                className="flex flex-col rounded-xl border border-white/10 bg-white/5"
                style={{ borderTopColor: color, borderTopWidth: '3px' }}
              >
                <div
                  className="flex items-center gap-3 border-b border-white/10 p-4"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: color }}
                  >
                    {persona.displayName.charAt(0)}
                  </div>
                  <span className="font-semibold text-foreground">
                    {persona.displayName}
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <AgentResponse
                    personaId={response.personaId}
                    displayName={persona.displayName}
                    content={response.content}
                    _tier={tier}
                    expanded={true}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {differences.length > 0 && (
        <div className="border-t border-white/10 bg-white/5 p-6">
          <h3 className="mb-4 text-lg font-bold text-foreground">Key Differences</h3>
          <ul className="space-y-2">
            {differences.map((diff, index) => (
              <li key={index} className="flex items-start gap-2 text-foreground/90">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-cyan" />
                {diff}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
