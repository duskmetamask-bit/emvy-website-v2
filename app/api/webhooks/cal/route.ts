import { NextRequest, NextResponse } from 'next/server'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'

function getConvex() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL
  if (!url) throw new Error('NEXT_PUBLIC_CONVEX_URL is not set')
  return new ConvexHttpClient(url)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Cal.com sends: { event, payload: { ... } }
    const { event, payload } = body

    if (!event) {
      return NextResponse.json({ error: 'Missing event type' }, { status: 400 })
    }

    const result = await getConvex().mutation(api.webhooks.cal.handleBooking, {
      event,
      payload: {
        eventTypeName: payload.eventTypeName,
        startTime: payload.startTime,
        endTime: payload.endTime,
        title: payload.title,
        name: payload.name,
        email: payload.email,
        location: payload.location,
        // Paid-booking fields (Cal.com doesn't always send these — defensive).
        // Booking-level payment info goes in BOOKING_PAID events; some Cal.com
        // setups include the price on BOOKING_CREATED for paid event types.
        price: payload.price,
        currency: payload.currency,
        paymentId: payload.paymentId,
      },
    })

    return NextResponse.json(result)
  } catch (err) {
    console.error('Cal.com webhook error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
