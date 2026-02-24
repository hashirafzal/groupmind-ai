'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Loader2, Sparkles } from 'lucide-react'

interface Persona {
  id: string
  name: string
  description: string
  color: string
}

const personas: Persona[] = [
  { id: 'analyst', name: 'The Analyst', description: 'Data-driven, logical analysis', color: 'brand-purple' },
  { id: 'devils-advocate', name: "Devil's Advocate", description: 'Challenges assumptions, finds flaws', color: 'brand-cyan' },
  { id: 'pragmatist', name: 'The Pragmatist', description: 'Practical, action-oriented focus', color: 'green' },
]

export default function NewDiscussionForm(): React.JSX.Element {
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>(['analyst', 'devils-advocate', 'pragmatist'])
  const [loading, setLoading] = useState(false)

  const togglePersona = (personaId: string) => {
    setSelectedPersonas(prev => 
      prev.includes(personaId) 
        ? prev.filter(id => id !== personaId)
        : [...prev, personaId]
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
        <label className="mb-3 block text-sm font-medium text-foreground">
          Select AI Personas
        </label>
        <div className="grid gap-3 sm:grid-cols-3">
          {personas.map((persona) => (
            <button
              key={persona.id}
              type="button"
              onClick={() => togglePersona(persona.id)}
              className={`rounded-xl border p-4 text-left transition-all ${
                selectedPersonas.includes(persona.id)
                  ? 'border-brand-purple bg-brand-purple/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${
                  persona.color === 'brand-purple' ? 'bg-brand-purple' :
                  persona.color === 'brand-cyan' ? 'bg-brand-cyan' : 'bg-green-400'
                }`} />
                <span className="font-medium text-foreground">{persona.name}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{persona.description}</p>
            </button>
          ))}
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
  )
}
