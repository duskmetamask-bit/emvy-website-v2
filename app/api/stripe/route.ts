import { NextRequest, NextResponse } from 'next/server'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'
import Stripe from 'stripe'

// Lazy-init the SDKs inside the handler. Module-load init breaks
// `next build` because Next loads every API route module to collect page
// data — the Stripe SDK throws `Neither apiKey nor config.authenticator
// provided` if STRIPE_SECRET_KEY is not in the build env. The same pattern
// is already used in `app/api/hermes/*/route.ts`.
function getConvex(): ConvexHttpClient {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL
  if (!url) throw new Error('NEXT_PUBLIC_CONVEX_URL is not set')
  return new ConvexHttpClient(url)
}

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
  return new Stripe(key)
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Map Stripe event to our format
  const typeMap: Record<string, string> = {
    'payment_intent.succeeded': 'payment_intent.succeeded',
    'payment_intent.payment_failed': 'payment_intent.payment_failed',
    'payment_intent.canceled': 'payment_intent.canceled',
    'charge.refunded': 'charge.refunded',
  }

  const mappedType = typeMap[event.type] || event.type

  try {
    const result = await getConvex().mutation(api.webhooks.stripe.handlePaymentEvent, {
      type: mappedType,
      data: {
        object: {
          id: (event.data.object as Stripe.PaymentIntent).id,
          amount: (event.data.object as Stripe.PaymentIntent).amount,
          currency: (event.data.object as Stripe.PaymentIntent).currency,
          status: (event.data.object as Stripe.PaymentIntent).status,
          description: (event.data.object as Stripe.PaymentIntent).description ?? undefined,
          metadata: (event.data.object as Stripe.PaymentIntent).metadata,
        },
      },
    })

    return NextResponse.json(result)
  } catch (err) {
    console.error('Error processing webhook:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
