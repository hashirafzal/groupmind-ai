import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createBillingPortalSession } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function POST(_req: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No active subscription' },
        { status: 400 }
      )
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const portalSession = await createBillingPortalSession(
      user.stripeCustomerId,
      `${baseUrl}/dashboard`
    )

    return NextResponse.json({ url: portalSession.url }, { status: 200 })
  } catch (error) {
    console.error('[STRIPE_PORTAL]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
