'use client'

import Link from 'next/link'
import { ArrowRight, Zap } from 'lucide-react'
import { useSession } from 'next-auth/react'

export default function Hero(): React.JSX.Element {
  const { data: session } = useSession()
  const tier = session?.user?.subscriptionTier || 'FREE'
  const isPaid = tier !== 'FREE'

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute left-1/2 top-1/4 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-purple/10 blur-[120px]" />
        <div className="absolute right-1/4 top-3/4 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-brand-cyan/8 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(124,58,237,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.3) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-5xl text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-purple/30 bg-brand-purple/10 px-4 py-1.5 animate-in fade-in zoom-in duration-700 delay-300 fill-mode-both">
          <Zap className="h-3.5 w-3.5 text-brand-cyan" />
          <span className="text-xs font-medium text-brand-cyan">
            Multi-Agent AI Platform
          </span>
        </div>

        <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight text-foreground md:text-7xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 fill-mode-both">
          Your Team&apos;s{' '}
          <span className="bg-gradient-to-r from-brand-purple to-brand-cyan bg-clip-text text-transparent">
            AI Think Tank
          </span>
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700 fill-mode-both">
          Submit one prompt. Get independent perspectives from multiple AI agents
          simultaneously. Explore deeper reasoning on demand. Built for teams who
          think at the speed of AI.
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-1000 fill-mode-both">
          <Link
            href={isPaid ? '/discuss/new' : '/sign-up'}
            className="flex items-center gap-2 rounded-xl bg-brand-purple px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-purple/25 transition-all hover:bg-brand-purple/90 hover:shadow-brand-purple/40"
          >
            {isPaid ? 'Start Discussion' : 'Start for Free'}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={isPaid ? '/dashboard' : '#how-it-works'}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-3.5 text-base font-semibold text-foreground transition-all hover:bg-white/10"
          >
            {isPaid ? 'View Dashboard' : 'See How It Works'}
          </Link>
        </div>

        <p className="mt-6 text-sm text-muted-foreground animate-in fade-in duration-1000 delay-[1200ms] fill-mode-both">
          {isPaid 
            ? `Active Plan: ${tier} · Ready to collaborate`
            : 'Free tier available · No credit card required'
          }
        </p>

        <div className="mx-auto mt-20 max-w-4xl">
          <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/3 p-1 shadow-2xl shadow-black/50 backdrop-blur-sm">
            <div className="rounded-xl bg-[#0D0D14] p-6">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500/70" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
                <div className="h-3 w-3 rounded-full bg-green-500/70" />
                <span className="ml-3 text-xs text-muted-foreground">
                  GroupMind AI — Active Discussion
                </span>
              </div>

              <div className="mb-4 rounded-lg border border-brand-purple/20 bg-brand-purple/5 p-3">
                <p className="text-sm text-muted-foreground">User prompt</p>
                <p className="mt-1 text-sm text-foreground">
                  Should we build our MVP in a monorepo or separate repos?
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {[
                  {
                    agent: 'The Analyst',
                    color: 'brand-purple',
                    response:
                      'Monorepo wins for early-stage MVPs. Shared types, atomic commits, single CI pipeline...',
                  },
                  {
                    agent: "Devil's Advocate",
                    color: 'brand-cyan',
                    response:
                      'Consider the hidden costs: tooling complexity, longer clone times, blast radius of breaking changes...',
                  },
                  {
                    agent: 'The Pragmatist',
                    color: 'green',
                    response:
                      'Start monorepo. You can always split later. The reverse migration is painful...',
                  },
                ].map((item) => (
                  <div
                    key={item.agent}
                    className="rounded-lg border border-white/5 bg-white/2 p-3"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${item.color === 'brand-purple' ? 'bg-brand-purple' : item.color === 'brand-cyan' ? 'bg-brand-cyan' : 'bg-green-400'}`}
                      />
                      <span className="text-xs font-medium text-foreground">
                        {item.agent}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {item.response}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
