'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

interface PromptInputProps {
  onSubmit: (prompt: string) => Promise<void>
  onStop?: () => void
  disabled?: boolean
  limitExceeded?: boolean
  _currentUsage?: number
  limit?: number
  resetDate?: string
}

export default function PromptInput({
  onSubmit,
  onStop,
  disabled = false,
  limitExceeded = false,
  _currentUsage = 0,
  limit = 10,
  resetDate,
}: PromptInputProps): React.JSX.Element {
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const maxChars = 2000
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'
  }, [prompt])

  const handleSubmit = async () => {
    if (!prompt.trim() || isLoading || disabled || limitExceeded) return

    const currentPrompt = prompt
    setPrompt('') // Clear immediately
    setIsLoading(true)
    
    try {
      await onSubmit(currentPrompt)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStop = () => {
    if (onStop) {
      onStop()
    }
    setIsLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const formatResetDate = (date?: string) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="flex-shrink-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F] to-transparent pb-6 pt-10">
      {limitExceeded && (
        <div className="mx-auto max-w-3xl px-4 pb-2">
          <div className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-sm font-medium text-amber-200">
                  You have reached your {limit} discussion limit for the Free plan.
                  {resetDate && ` Your limit resets on ${formatResetDate(resetDate)}.`}
                </p>
              </div>
            </div>
            <Link
              href="/pricing"
              className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-amber-400"
            >
              Upgrade Now →
            </Link>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-3xl px-4">
        <div className="relative flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 transition-all focus-within:border-white/20 focus-within:bg-white/[0.08] shadow-2xl">
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value.slice(0, maxChars))}
              onKeyDown={handleKeyDown}
              placeholder={isLoading ? "Thinking..." : "Ask a question or share an idea..."}
              disabled={disabled || limitExceeded || isLoading}
              rows={1}
              className="min-h-[44px] max-h-[200px] w-full resize-none overflow-y-auto bg-transparent p-3 text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-track]:bg-transparent"
            />

            {isLoading ? (
              <button
                onClick={handleStop}
                className="mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500 text-white transition-all hover:bg-red-600 shadow-lg shadow-red-500/20"
                title="Stop generating"
              >
                <div className="h-3 w-3 bg-white rounded-sm" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!prompt.trim() || disabled || limitExceeded}
                className={`mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all ${
                  prompt.trim() 
                    ? 'bg-white text-black hover:bg-white/90' 
                    : 'bg-white/5 text-white/20'
                } disabled:cursor-not-allowed`}
              >
                <Send className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between px-3 pb-1">
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-white/30">
                Press Enter to send · Shift+Enter for new line
              </p>
              {isLoading && (
                <div className="flex gap-1 animate-pulse">
                  <div className="h-1 w-1 bg-brand-purple rounded-full" />
                  <div className="h-1 w-1 bg-brand-purple rounded-full delay-75" />
                  <div className="h-1 w-1 bg-brand-purple rounded-full delay-150" />
                </div>
              )}
            </div>
            <span className="text-[10px] text-white/30">
              {prompt.length}/{maxChars}
            </span>
          </div>
        </div>

        <p className="mt-3 text-center text-xs text-white/20">
          GroupMind AI can make mistakes. Always verify important information.
        </p>
      </div>
    </div>
  )
}
