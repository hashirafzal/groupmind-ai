import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PRICE_IDS, getStripeCustomerId, createCheckoutSession } from '@/lib/stripe'
import { createCheckoutSchema } from '@/lib/validations/stripe'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { prisma } = await import('@/lib/prisma')
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = createCheckoutSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { tier } = parsed.data
    const priceId = PRICE_IDS[tier]

    if (!priceId) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let customerId = user.stripeCustomerId

    if (!customerId) {
      customerId = await getStripeCustomerId(user.email!, user.id)
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      })
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const checkoutSession = await createCheckoutSession(
      customerId,
      priceId,
      user.id,
      `${baseUrl}/dashboard?success=true`,
      `${baseUrl}/pricing?canceled=true`
    )

    return NextResponse.json({ url: checkoutSession.url }, { status: 200 })
  } catch (error) {
    console.error('[STRIPE_CHECKOUT]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
