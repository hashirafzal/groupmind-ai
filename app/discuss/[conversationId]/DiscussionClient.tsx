'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowLeftRight, Loader2, Brain } from 'lucide-react'
import PersonaSelector from '@/components/discussion/PersonaSelector'
import RoundtableGrid from '@/components/discussion/RoundtableGrid'
import CompareMode from '@/components/discussion/CompareMode'
import PromptInput from '@/components/discussion/PromptInput'
import { personas } from '@/lib/ai/personas'
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

interface DiscussionRound {
  id: string
  prompt: string
  responses: PersonaResponse[]
}

export default function DiscussionClient({ user, conversation }: DiscussionClientProps): React.JSX.Element {
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>(['strategist', 'simplifier', 'mentor'])
  const [rounds, setRounds] = useState<DiscussionRound[]>([])
  const [compareMode, setCompareMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [limitExceeded, setLimitExceeded] = useState(false)
  const [currentUsage, setCurrentUsage] = useState(0)
  const [limit, setLimit] = useState(10)
  const [resetDate, setResetDate] = useState<string>()
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    async function init() {
      // Group historical messages into rounds
      const messages = conversation.messages
      const historicalRounds: DiscussionRound[] = []
      
      let currentPrompt = ''
      let currentResponses: PersonaResponse[] = []

      messages.forEach((msg) => {
        if (msg.role === 'USER') {
          if (currentPrompt) {
            historicalRounds.push({
              id: Math.random().toString(),
              prompt: currentPrompt,
              responses: currentResponses,
            })
          }
          currentPrompt = msg.content
          currentResponses = []
        } else if (msg.role === 'AGENT') {
          currentResponses.push({
            personaId: msg.agentId || 'strategist',
            content: msg.content,
            isLoading: false,
          })
        }
      })

      if (currentPrompt) {
        historicalRounds.push({
          id: Math.random().toString(),
          prompt: currentPrompt,
          responses: currentResponses,
        })
      }

      setRounds(historicalRounds)

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

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      
      setRounds(prev => {
        const newRounds = [...prev]
        if (newRounds.length > 0) {
          const lastRound = newRounds[newRounds.length - 1]
          lastRound.responses = lastRound.responses.map(r => {
             if (r.isLoading) {
               return { ...r, isLoading: false, content: r.content || 'Interrupted.' }
             }
             return r
          })
        }
        return newRounds
      })
    }
  }

  const handleSubmit = async (prompt: string) => {
    if (!user || limitExceeded) return

    const roundId = Math.random().toString()
    const newRound: DiscussionRound = {
      id: roundId,
      prompt,
      responses: selectedPersonas.map((id) => ({
        personaId: id,
        content: '',
        isLoading: true,
      }))
    }

    setRounds(prev => [...prev, newRound])
    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch('/api/ai/discuss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          personas: selectedPersonas,
          conversationId: conversation.id,
        }),
        signal: abortControllerRef.current.signal
      })

      const data = await response.json()
      
      if (data.messages) {
        setRounds(prev => prev.map(r => {
          if (r.id === roundId) {
            return {
              ...r,
              responses: data.messages.map((msg: any) => ({
                personaId: msg.agentId,
                content: msg.content,
                isLoading: false,
              }))
            }
          }
          return r
        }))
      } else {
        throw new Error(data.error || 'Failed to generate response')
      }

      setCurrentUsage((prev) => prev + 1)

      const usageRes = await fetch('/api/usage/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usageType: 'discussion' }),
      })
      const usageResult = await usageRes.json()
      setLimitExceeded(!usageResult.allowed)
      setResetDate(usageResult.resetDate)
    } catch (error: any) {
      if (error.name === 'AbortError') return
      
      console.error('Error generating response:', error)
      setRounds(prev => prev.map(r => {
        if (r.id === roundId) {
          return {
            ...r,
            responses: selectedPersonas.map(id => ({
              personaId: id,
              content: 'Error generating response. Please try again.',
              isLoading: false
            }))
          }
        }
        return r
      }))
    } finally {
      abortControllerRef.current = null
    }
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
    <div className="flex h-screen flex-col overflow-hidden bg-[#0A0A0F]">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-white/10 bg-white/5 p-4">
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
                disabled={rounds.length === 0}
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
      <div className="flex-shrink-0 border-b border-white/10 bg-white/5 p-6">
        <div className="mx-auto max-w-7xl">
          <PersonaSelector
            selectedPersonas={selectedPersonas}
            onPersonaToggle={handlePersonaToggle}
            tier={tier}
          />
        </div>
      </div>

      {/* Main Content - Roundtable Grid */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-track]:bg-transparent">
        <div className="mx-auto max-w-6xl px-4 py-10 space-y-20">
          {rounds.map((round) => (
            <div key={round.id} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl bg-white/5 border border-white/10 px-6 py-4 shadow-xl">
                  <p className="text-foreground">{round.prompt}</p>
                </div>
              </div>
              
              <RoundtableGrid
                responses={round.responses}
                personas={personas}
                tier={tier}
              />
            </div>
          ))}

          {rounds.length === 0 && (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-full bg-white/5 p-4">
                <Brain className="h-10 w-10 text-brand-purple" />
              </div>
              <h3 className="text-lg font-medium text-foreground">Ready to Think?</h3>
              <p className="max-w-xs text-sm text-muted-foreground mt-2">
                Select your personas and send a prompt to start the roundtable discussion.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Prompt Input */}
      <div className="flex-shrink-0">
        <PromptInput
          onSubmit={handleSubmit}
          onStop={handleStop}
          disabled={selectedPersonas.length === 0}
          limitExceeded={limitExceeded}
          _currentUsage={currentUsage}
          limit={limit}
          resetDate={resetDate}
        />
      </div>

      {/* Compare Mode Modal */}
      {compareMode && (
        <CompareMode
          selectedResponses={rounds[rounds.length - 1]?.responses
            .filter((r) => !r.isLoading)
            .map((r) => ({
              personaId: r.personaId,
              content: r.content,
            })) || []}
          personas={personas}
          tier={tier}
          onClose={() => setCompareMode(false)}
        />
      )}
    </div>
  )
}
