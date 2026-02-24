import Link from 'next/link'
import { Check, Mic2, Zap } from 'lucide-react'
import PricingButton from './PricingButton'

interface PricingFeature {
  text: string
  included: boolean
  badge?: string
}

interface PricingTier {
  name: string
  price: string
  period: string
  description: string
  features: PricingFeature[]
  cta: string
  href: string
  priceId?: string
  highlighted: boolean
  badge?: string
}

interface PricingProps {
  isLoggedIn?: boolean
}

function getTiers(isLoggedIn: boolean): PricingTier[] {
  return [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for individuals exploring AI-assisted thinking.',
      features: [
        { text: '3 personas (Strategist, Simplifier, Mentor)', included: true },
        { text: '10 discussions per month', included: true },
        { text: 'Full conversation history', included: true },
        { text: 'Expandable reasoning threads', included: true },
        { text: 'Markdown formatted responses', included: true },
        { text: 'Downloadable conversation export', included: true },
      ],
      cta: 'Get Started Free',
      href: isLoggedIn ? '/dashboard' : '/sign-up',
      highlighted: false,
    },
    {
      name: 'Starter',
      price: '$19',
      period: 'per month',
      description: 'For professionals who need more volume and team access.',
      features: [
        { text: '5 personas unlocked', included: true },
        { text: '100 discussions per month', included: true },
        { text: 'Full conversation history', included: true },
        { text: 'Expandable reasoning threads', included: true },
        { text: 'Markdown formatted responses', included: true },
        { text: 'Downloadable conversation export', included: true },
      ],
      cta: 'Start with Starter',
      href: isLoggedIn ? '/api/stripe/checkout?price=starter' : '/sign-up',
      priceId: 'starter',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: '$49',
      period: 'per month',
      description: 'For power users who need voice and high-volume AI access.',
      features: [
        { text: 'All 10 personas unlocked', included: true },
        { text: '1000 discussions per month', included: true },
        { text: 'Full conversation history', included: true },
        { text: 'Expandable reasoning threads', included: true },
        { text: 'Markdown formatted responses', included: true },
        { text: 'Downloadable conversation export', included: true },
        { text: 'Compare Mode', included: true },
        { text: 'Voice input', included: true, badge: 'Coming Soon' },
        { text: 'Team collaboration', included: true, badge: 'Coming Soon' },
      ],
      cta: 'Start Pro',
      href: isLoggedIn ? '/api/stripe/checkout?price=pro' : '/sign-up',
      priceId: 'pro',
      highlighted: true,
      badge: 'Most Popular',
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'contact us',
      description: 'Unlimited AI discussions with dedicated support and SLAs.',
      features: [
        { text: 'All 10 personas + custom persona tuning', included: true },
        { text: 'Unlimited discussions', included: true },
        { text: 'Full conversation history', included: true },
        { text: 'Expandable reasoning threads', included: true },
        { text: 'Markdown formatted responses', included: true },
        { text: 'Downloadable conversation export', included: true },
        { text: 'Compare Mode', included: true },
        { text: 'Everything in Pro', included: true },
        { text: 'SSO + admin controls', included: true },
        { text: 'Dedicated account manager', included: true },
      ],
      cta: 'Contact Sales',
      href: 'mailto:sales@groupmind.ai',
      highlighted: false,
    },
  ]
}

export default function Pricing({ isLoggedIn = false }: PricingProps): React.JSX.Element {
  const tiers = getTiers(isLoggedIn)

  return (
    <section id="pricing" className="px-6 py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
            Simple,{' '}
            <span className="bg-gradient-to-r from-brand-purple to-brand-cyan bg-clip-text text-transparent">
              transparent
            </span>{' '}
            pricing
          </h2>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            Start free. Scale as your team grows. No hidden fees, no surprise
            overage charges.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative flex flex-col rounded-2xl border p-6 transition-all ${
                tier.highlighted
                  ? 'border-brand-purple/50 bg-brand-purple/8 shadow-2xl shadow-brand-purple/10'
                  : 'border-white/8 bg-white/2 hover:border-white/12 hover:bg-white/4'
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1.5 rounded-full bg-brand-purple px-3 py-1 text-xs font-semibold text-white">
                    <Zap className="h-3 w-3" />
                    {tier.badge}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="mb-1 text-lg font-bold text-foreground">
                  {tier.name}
                </h3>
                <div className="mb-3 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-foreground">
                    {tier.price}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    /{tier.period}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {tier.description}
                </p>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {tier.features.map((feature) => (
                  <li
                    key={feature.text}
                    className="flex items-start gap-2.5 text-sm"
                  >
                    {feature.included ? (
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-cyan" />
                    ) : (
                      <div className="mt-0.5 h-4 w-4 shrink-0 rounded-full border border-muted-foreground/20" />
                    )}
                    <span
                      className={
                        feature.included
                          ? 'text-foreground'
                          : 'text-muted-foreground/50'
                      }
                    >
                      {feature.text}
                      {feature.badge && feature.included && (
                        <span className="ml-1.5 inline-flex items-center rounded-full bg-white/10 px-1.5 py-0.5 text-xs text-muted-foreground">
                          {feature.badge}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>

              {tier.priceId ? (
                <PricingButton
                  tier={tier.priceId as 'starter' | 'pro' | 'enterprise'}
                  highlighted={tier.highlighted}
                >
                  {tier.cta}
                </PricingButton>
              ) : (
                <Link
                  href={tier.href}
                  className={`block rounded-xl px-4 py-3 text-center text-sm font-semibold transition-all ${
                    tier.highlighted
                      ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/30 hover:bg-brand-purple/90'
                      : 'border border-white/10 bg-white/5 text-foreground hover:bg-white/10'
                  }`}
                >
                  {tier.cta}
                </Link>
              )}
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          All plans include full conversation history, expandable reasoning threads,
          markdown formatted responses, and downloadable conversation export.
          Billing via Stripe — cancel anytime.
        </p>
      </div>
    </section>
  )
}
