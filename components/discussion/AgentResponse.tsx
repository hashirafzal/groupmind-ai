'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { SubscriptionTier } from '@prisma/client'

interface AgentResponseProps {
  personaId: string
  displayName: string
  content: string
  tier: SubscriptionTier
  expanded?: boolean
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

export default function AgentResponse({
  personaId,
  displayName,
  content,
  tier,
  expanded = false,
}: AgentResponseProps): React.JSX.Element {
  const avatarColor = personaColors[personaId] || '#8B5CF6'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <div className="flex flex-col">
      <div className="mb-3 flex items-center gap-3">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: avatarColor }}
        >
          {initial}
        </div>
        <div>
          <span className="font-semibold text-foreground">{displayName}</span>
        </div>
      </div>

      <div
        className={`prose prose-invert max-w-none ${
          expanded ? 'max-h-[500px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10' : 'line-clamp-6'
        }`}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className="mb-3 mt-4 text-2xl font-bold text-brand-purple">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="mb-2 mt-3 text-xl font-bold text-brand-purple">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="mb-2 mt-2 text-lg font-semibold text-brand-purple">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="mb-3 text-foreground/90">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="mb-3 ml-4 list-disc space-y-1">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="mb-3 ml-4 list-decimal space-y-1">{children}</ol>
            ),
            li: ({ children }) => (
              <li className="text-foreground/90">{children}</li>
            ),
            code: ({ children, className }) => {
              const isInline = !className
              if (isInline) {
                return (
                  <code className="rounded bg-[#1a1a2e] px-1.5 py-0.5 font-mono text-sm text-brand-cyan">
                    {children}
                  </code>
                )
              }
              return (
                <div className="my-4 overflow-x-auto rounded-lg bg-[#1a1a2e] p-4">
                  <code className="font-mono text-sm text-foreground">
                    {children}
                  </code>
                </div>
              )
            },
            strong: ({ children }) => (
              <strong className="text-brand-cyan">{children}</strong>
            ),
            a: ({ children, href }) => (
              <a
                href={href}
                className="text-brand-cyan underline hover:text-brand-purple"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-brand-purple pl-4 italic text-muted-foreground">
                {children}
              </blockquote>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  )
}
