'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowLeftRight, Loader2 } from 'lucide-react'
import PersonaSelector from '@/components/discussion/PersonaSelector'
import RoundtableGrid from '@/components/discussion/RoundtableGrid'
import CompareMode from '@/components/discussion/CompareMode'
import PromptInput from '@/components/discussion/PromptInput'
import { personas, getPersonaById } from '@/lib/ai/personas'
import type { SubscriptionTier } from '@prisma/client'

interface PersonaResponse {
  personaId: string
  content: string
  reasoning?: string
  isLoading: boolean
}

interface DiscussionClientProps {
  user: {
    id: string
    subscriptionTier: SubscriptionTier
  }
  conversation: {
    id: string
    title: string
    messages: Array<{
      id: string
      role: string
      agentId: string | null
      content: string
    }>
  }
}

export default function DiscussionClient({ user, conversation }: DiscussionClientProps): React.JSX.Element {
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>(['strategist', 'simplifier', 'mentor'])
  const [responses, setResponses] = useState<PersonaResponse[]>([])
  const [compareMode, setCompareMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [limitExceeded, setLimitExceeded] = useState(false)
  const [currentUsage, setCurrentUsage] = useState(0)
  const [limit, setLimit] = useState(10)
  const [resetDate, setResetDate] = useState<string>()

  useEffect(() => {
    async function init() {
      // Load previous responses if any
      const agentMessages = conversation.messages.filter((m) => m.role === 'AGENT')
      if (agentMessages.length > 0) {
        const loadedResponses: PersonaResponse[] = agentMessages.map((msg) => ({
          personaId: msg.agentId || 'strategist',
          content: msg.content,
          isLoading: false,
        }))
        setResponses(loadedResponses)
      }

      // Check usage limits via API
      try {
        const usageRes = await fetch('/api/usage/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usageType: 'discussion' }),
        })
        const usageResult = await usageRes.json()
        setLimitExceeded(!usageResult.allowed)
        setCurrentUsage(usageResult.currentUsage || 0)
        setLimit(usageResult.limit || 10)
        setResetDate(usageResult.resetDate)
      } catch (e) {
        console.error('Failed to check usage:', e)
      }

      setIsLoading(false)
    }

    init()
  }, [conversation.messages])

  const handlePersonaToggle = (personaId: string) => {
    setSelectedPersonas((prev) =>
      prev.includes(personaId)
        ? prev.filter((id) => id !== personaId)
        : [...prev, personaId]
    )
  }

  const handleSubmit = async (prompt: string) => {
    if (!user || limitExceeded) return

    // Record usage
    await recordUsage(user.id, 'discussion')

    // Add user message
    await fetch('/api/ai/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationId: conversation.id,
        content: prompt,
        role: 'USER',
      }),
    })

    // Set loading states for selected personas
    const newResponses: PersonaResponse[] = selectedPersonas.map((id) => ({
      personaId: id,
      content: '',
      isLoading: true,
    }))
    setResponses(newResponses)

    // Call API for each persona
    const results = await Promise.all(
      selectedPersonas.map(async (personaId) => {
        const persona = getPersonaById(personaId)
        if (!persona) return { personaId, content: '', isLoading: false }

        try {
          const response = await fetch('/api/ai/discuss', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt,
              personas: [personaId],
              conversationId: conversation.id,
            }),
          })

          const data = await response.json()
          
          if (data.messages) {
            const lastMessage = data.messages[data.messages.length - 1]
            return {
              personaId,
              content: lastMessage?.content || '',
              isLoading: false,
            }
          }

          return { personaId, content: 'Failed to generate response', isLoading: false }
        } catch (error) {
          console.error('Error generating response:', error)
          return { personaId, content: 'Error generating response', isLoading: false }
        }
      })
    )

    setResponses(results)
    setCurrentUsage((prev) => prev + 1)

    // Refresh usage check
    const usageResult = await checkUsageLimit(user.id, 'discussion')
    setLimitExceeded(!usageResult.allowed)
    setResetDate(usageResult.resetDate)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0F]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
      </div>
    )
  }

  const tier = user.subscriptionTier as SubscriptionTier

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 p-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link
            href="/dashboard/discussions"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Discussions
          </Link>

          <h1 className="text-xl font-bold text-foreground">{conversation.title}</h1>

          <div className="flex items-center gap-3">
            {tier === 'PRO' || tier === 'ENTERPRISE' ? (
              <button
                onClick={() => setCompareMode(true)}
                disabled={responses.length < 2}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-white/10 disabled:opacity-50"
              >
                <ArrowLeftRight className="h-4 w-4" />
                Compare Mode
              </button>
            ) : (
              <Link
                href="/pricing"
                className="rounded-lg border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-300"
              >
                Upgrade to Compare
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Persona Selector */}
      <div className="border-b border-white/10 bg-white/5 p-6">
        <div className="mx-auto max-w-7xl">
          <PersonaSelector
            selectedPersonas={selectedPersonas}
            onPersonaToggle={handlePersonaToggle}
            tier={tier}
          />
        </div>
      </div>

      {/* Main Content - Roundtable Grid */}
      <div className="mx-auto max-w-7xl p-6">
        <RoundtableGrid
          responses={responses}
          personas={personas}
          tier={tier}
        />
      </div>

      {/* Prompt Input */}
      <PromptInput
        onSubmit={handleSubmit}
        disabled={selectedPersonas.length === 0}
        limitExceeded={limitExceeded}
        currentUsage={currentUsage}
        limit={limit}
        resetDate={resetDate}
      />

      {/* Compare Mode Modal */}
      {compareMode && (
        <CompareMode
          selectedResponses={responses
            .filter((r) => !r.isLoading)
            .map((r) => ({
              personaId: r.personaId,
              content: r.content,
            }))}
          personas={personas}
          tier={tier}
          onClose={() => setCompareMode(false)}
        />
      )}
    </div>
  )
}
