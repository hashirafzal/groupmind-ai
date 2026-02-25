import { CheckCircle2, MessageSquare, Sparkles, TrendingUp } from 'lucide-react'

interface Step {
  number: string
  icon: React.ReactNode
  title: string
  description: string
}

const steps: Step[] = [
  {
    number: '01',
    icon: <MessageSquare className="h-6 w-6 text-brand-purple" />,
    title: 'Submit a prompt',
    description:
      'Type or speak your question, decision, or challenge. No special formatting required — just natural language.',
  },
  {
    number: '02',
    icon: <Sparkles className="h-6 w-6 text-brand-cyan" />,
    title: 'AI agents respond in parallel',
    description:
      'The orchestration engine dispatches your prompt to multiple AI personas simultaneously. Each agent reasons independently, producing genuinely distinct perspectives.',
  },
  {
    number: '03',
    icon: <TrendingUp className="h-6 w-6 text-violet-400" />,
    title: 'Explore, expand, and decide',
    description:
      'Drill into any agent\'s reasoning thread for a deeper dive. Reference conversation history, compare responses, and reach better decisions faster.',
  },
]

const proofPoints: string[] = [
  'Multi-agent AI orchestration — not a chatbot',
  'Every response persisted and searchable',
  'Voice input and output (PRO+)',
  'Team-scoped conversation history',
  'Usage metered and subscription-aware',
  'Provider-agnostic AI backend',
]

export default function SalesPitch(): React.JSX.Element {
  return (
    <section id="how-it-works" className="px-6 py-32">
      <div className="mx-auto max-w-7xl reveal-on-scroll">
        <div className="grid items-start gap-16 lg:grid-cols-2">
          <div className="reveal-on-scroll">
            <h2 className="mb-6 text-4xl font-bold text-foreground md:text-5xl">
              Not another AI chat.{' '}
              <span className="bg-gradient-to-r from-brand-purple to-brand-cyan bg-clip-text text-transparent">
                A thinking system.
              </span>
            </h2>
            <p className="mb-10 text-lg text-muted-foreground">
              Most AI tools give you one perspective. GroupMind AI gives you a
              structured debate — multiple independent agents with distinct
              reasoning styles, responding in parallel, so your team gets
              richer signal, faster.
            </p>

            <ul className="space-y-3">
              {proofPoints.map((point) => (
                <li key={point} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-cyan" />
                  <span className="text-sm text-foreground">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6 reveal-on-scroll reveal-delay-2">
            {steps.map((step, index) => (
              <div key={step.number} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/4">
                    {step.icon}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="mt-3 h-full w-px bg-gradient-to-b from-white/10 to-transparent" />
                  )}
                </div>
                <div className="pb-6">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">
                      {step.number}
                    </span>
                    <h3 className="text-lg font-semibold text-foreground">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
