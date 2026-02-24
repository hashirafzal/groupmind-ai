import {
  Brain,
  GitBranch,
  Layers,
  Mic2,
  ShieldCheck,
  Users,
  Zap,
} from 'lucide-react'

interface Feature {
  icon: React.ReactNode
  title: string
  description: string
  accent: string
}

const features: Feature[] = [
  {
    icon: <Zap className="h-6 w-6" />,
    title: 'Parallel AI Agents',
    description:
      'Submit one prompt and receive independent responses from multiple AI personas simultaneously — no waiting, no sequential bottlenecks.',
    accent: 'text-brand-purple',
  },
  {
    icon: <Brain className="h-6 w-6" />,
    title: 'Distinct AI Personas',
    description:
      'The Analyst, Devil\'s Advocate, Pragmatist, and more. Each agent has its own reasoning style, system prompt, and temperature — genuinely diverse perspectives.',
    accent: 'text-brand-cyan',
  },
  {
    icon: <Layers className="h-6 w-6" />,
    title: 'Expandable Reasoning Threads',
    description:
      'Drill into any agent response for a full reasoning deep-dive. Every thread is persisted and reconstructable from your conversation history.',
    accent: 'text-violet-400',
  },
  {
    icon: <Mic2 className="h-6 w-6" />,
    title: 'Voice-to-Voice Mode',
    description:
      'Speak your prompt, hear AI responses. Real-time STT → orchestration → TTS pipeline, all processed server-side for maximum security.',
    accent: 'text-cyan-400',
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Team Collaboration',
    description:
      'Share discussion threads with your team. Every conversation is team-scoped, searchable, and preserved — your collective AI reasoning history.',
    accent: 'text-emerald-400',
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: 'Secure by Design',
    description:
      'API keys never leave the server. Usage metered per tier. Every action validated, every session verified. Enterprise-grade from day one.',
    accent: 'text-orange-400',
  },
  {
    icon: <GitBranch className="h-6 w-6" />,
    title: 'Structured History',
    description:
      'Full conversation history with threaded context. Resume any discussion, reference past reasoning, and build on prior AI analysis.',
    accent: 'text-pink-400',
  },
]

export default function Features(): React.JSX.Element {
  return (
    <section id="features" className="px-6 py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
            Everything your team needs to{' '}
            <span className="bg-gradient-to-r from-brand-purple to-brand-cyan bg-clip-text text-transparent">
              think better
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Built for production from day one. No toy demos — a real AI
            orchestration platform with the security and scalability your team
            demands.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.slice(0, 6).map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-white/5 bg-white/2 p-6 transition-all hover:border-white/10 hover:bg-white/4"
            >
              <div
                className={`mb-4 inline-flex rounded-xl border border-white/8 bg-white/4 p-3 ${feature.accent}`}
              >
                {feature.icon}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
