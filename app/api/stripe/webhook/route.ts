import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

function getTierFromPriceId(priceId: string): 'STARTER' | 'PRO' | 'ENTERPRISE' | 'FREE' {
  if (priceId.includes('starter')) return 'STARTER'
  if (priceId.includes('pro')) return 'PRO'
  if (priceId.includes('enterprise')) return 'ENTERPRISE'
  return 'FREE'
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('[STRIPE_WEBHOOK_SIGNATURE]', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId

        if (userId && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )
          const priceId = subscription.items.data[0]?.price.id
          const tier = getTierFromPriceId(priceId)

          await prisma.user.update({
            where: { id: userId },
            data: {
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: subscription.id,
              subscriptionTier: tier,
              subscriptionStatus: 'ACTIVE',
            },
          })
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const statusMap: Record<string, 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'TRIALING'> = {
          active: 'ACTIVE',
          canceled: 'CANCELED',
          past_due: 'PAST_DUE',
          trialing: 'TRIALING',
          incomplete: 'PAST_DUE',
          incomplete_expired: 'CANCELED',
          unpaid: 'PAST_DUE',
        }

        const priceId = subscription.items.data[0]?.price.id
        const tier = getTierFromPriceId(priceId)
        const status = statusMap[subscription.status] || 'ACTIVE'

        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            subscriptionTier: tier,
            subscriptionStatus: status,
          },
        })
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            subscriptionTier: 'FREE',
            subscriptionStatus: 'CANCELED',
            stripeSubscriptionId: null,
          },
        })
        break
      }
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('[STRIPE_WEBHOOK_HANDLER]', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
