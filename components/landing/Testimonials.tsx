'use client'

interface Testimonial {
  name: string
  role: string
  company: string
  text: string
  initials: string
  color: string
  stars: number
}

const testimonials: Testimonial[] = [
  {
    name: 'Sarah Chen',
    role: 'Co-founder',
    company: 'Loop Analytics',
    initials: 'SC',
    color: 'bg-purple-500',
    stars: 5,
    text: "I used to spend hours going back and forth with my co-founder before making product decisions. GroupMind replaced that entire process. I submit one prompt and get the Strategist pushing me on market fit, the Critic tearing apart my assumptions, and the Engineer telling me what's actually buildable. We shipped 40% faster last quarter.",
  },
  {
    name: 'Marcus Webb',
    role: 'Senior Product Manager',
    company: 'Finova',
    initials: 'MW',
    color: 'bg-cyan-500',
    stars: 5,
    text: "The Analyst and Researcher personas together are genuinely better than most consultants I've worked with. I ran our pricing strategy through GroupMind before our Series A pitch and the Critic caught three weak points our team had completely missed. Investors noticed the depth of our thinking.",
  },
  {
    name: 'Priya Nair',
    role: 'Founder',
    company: 'Learnly',
    initials: 'PN',
    color: 'bg-emerald-500',
    stars: 5,
    text: "As a solo founder, I don't have a team to bounce ideas off. GroupMind is the closest thing I have to a brain trust. The Mentor keeps me grounded when I spiral, the Visionary pushes me to think bigger, and the Operator brings me back to what's actually executable this week. It's become part of my daily workflow.",
  },
  {
    name: 'James Okafor',
    role: 'CTO',
    company: 'Stackbridge',
    initials: 'JO',
    color: 'bg-orange-500',
    stars: 5,
    text: "We used it to architect a major infrastructure decision. Ran the problem through the Engineer and Researcher first, then stress-tested it with the Critic. The depth of technical reasoning was impressive — it caught an async bottleneck in our proposed design that would have cost us weeks in production.",
  },
  {
    name: 'Lena Hoffman',
    role: 'Marketing Director',
    company: 'Brandhaus Berlin',
    initials: 'LH',
    color: 'bg-pink-500',
    stars: 5,
    text: "Compare Mode is where it gets magical. I put the same campaign brief to the Creative, the Strategist, and the Simplifier side by side. Seeing three completely different framings of the same idea in one view has transformed how our team does creative briefs. We adopted it agency-wide.",
  },
  {
    name: 'David Park',
    role: 'Independent Consultant',
    company: '',
    initials: 'DP',
    color: 'bg-indigo-500',
    stars: 5,
    text: "I charged a client $8,000 for a strategic analysis that I built using GroupMind's Analyst and Researcher personas as my thinking partners. The output quality was genuinely at the level of a senior strategy consultant. The ROI on my Pro subscription is absurd.",
  },
]

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className={`h-5 w-5 ${filled ? 'text-yellow-500' : 'text-gray-600'}`}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  )
}

export default function Testimonials(): React.JSX.Element {
  return (
    <section className="px-6 py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
            Trusted by{' '}
            <span className="bg-gradient-to-r from-brand-purple to-brand-cyan bg-clip-text text-transparent">
              founders, builders, and strategists
            </span>
          </h2>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            Real results from real teams
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="group relative flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-white/20"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white ${testimonial.color}`}
                  >
                    {testimonial.initials}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                      {testimonial.company && `, ${testimonial.company}`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-4 flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon key={i} filled={i < testimonial.stars} />
                ))}
              </div>

              <p className="flex-1 text-foreground/80">{testimonial.text}</p>

              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-brand-purple/5 to-brand-cyan/5 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
