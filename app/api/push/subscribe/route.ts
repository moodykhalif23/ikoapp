import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { PushSubscription } from '@/lib/models'
import { getVapidPublicKey } from '@/lib/push-utils'

export const runtime = 'nodejs'

// POST /api/push/subscribe - Register or update a push subscription
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    const body = await request.json()
    const { userId, roles, subscription, userAgent } = body

    if (!userId || !subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json({ error: 'Invalid subscription payload' }, { status: 400 })
    }

    await PushSubscription.updateOne(
      { endpoint: subscription.endpoint },
      {
        $set: {
          userId,
          roles: Array.isArray(roles) ? roles : [],
          endpoint: subscription.endpoint,
          keys: subscription.keys,
          userAgent
        }
      },
      { upsert: true }
    )

    return NextResponse.json({ success: true, vapidPublicKey: getVapidPublicKey() })
  } catch (error) {
    console.error('Error saving push subscription:', error)
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 })
  }
}
