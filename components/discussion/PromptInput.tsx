'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Mic, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

interface PromptInputProps {
  onSubmit: (prompt: string) => Promise<void>
  disabled?: boolean
  limitExceeded?: boolean
  currentUsage?: number
  limit?: number
  resetDate?: string
}

export default function PromptInput({
  onSubmit,
  disabled = false,
  limitExceeded = false,
  currentUsage = 0,
  limit = 10,
  resetDate,
}: PromptInputProps): React.JSX.Element {
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [charCount, setCharCount] = useState(0)
  const maxChars = 500
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [prompt])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || isLoading || disabled || limitExceeded) return

    setIsLoading(true)
    try {
      await onSubmit(prompt)
      setPrompt('')
      setCharCount(0)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit(e)
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
    <div className="fixed bottom-0 left-0 right-0">
      {limitExceeded && (
        <div className="mx-auto max-w-4xl px-4 pb-2">
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

      <div className="border-t border-white/10 bg-[#0A0A0F]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl p-4">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <button
              type="button"
              disabled={true}
              className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-muted-foreground transition-colors hover:bg-white/10 disabled:opacity-50"
              title="Voice available on Pro"
            >
              <Mic className="h-5 w-5" />
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-white/10 px-2 py-1 text-xs text-foreground opacity-0 transition-opacity">
                Voice available on Pro
              </span>
            </button>

            <div className="relative flex-1">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value.slice(0, maxChars))
                  setCharCount(e.target.value.length)
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question or share an idea..."
                disabled={disabled || limitExceeded}
                rows={1}
                className="max-h-[120px] w-full resize-none rounded-xl border border-white/10 bg-white/5 p-4 pr-16 text-foreground placeholder:text-muted-foreground focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple disabled:cursor-not-allowed disabled:opacity-50"
              />
              <span className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                {charCount}/{maxChars}
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading || !prompt.trim() || disabled || limitExceeded}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </form>

          <p className="mt-2 text-center text-xs text-muted-foreground">
            Press <kbd className="rounded bg-white/10 px-1.5 py-0.5">⌘</kbd> +{' '}
            <kbd className="rounded bg-white/10 px-1.5 py-0.5">Enter</kbd> to submit
          </p>
        </div>
      </div>
    </div>
  )
}
