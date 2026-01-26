import webpush from 'web-push'
import connectToDatabase from '@/lib/mongodb'
import { PushSubscription } from '@/lib/models'

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@example.com'

const pushEnabled = Boolean(vapidPublicKey && vapidPrivateKey)

if (pushEnabled) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey as string, vapidPrivateKey as string)
}

type PushPayload = {
  title: string
  body: string
  data?: Record<string, unknown>
}

export function isPushConfigured() {
  return pushEnabled
}

export function getVapidPublicKey() {
  return vapidPublicKey || ''
}

export async function sendPushToRoles(roles: string[], payload: PushPayload) {
  if (!pushEnabled) {
    return
  }

  await connectToDatabase()

  const subscriptions = await PushSubscription.find({
    roles: { $in: roles }
  }).lean()

  const uniqueByEndpoint = new Map<string, typeof subscriptions[number]>()
  subscriptions.forEach((sub) => {
    if (sub.endpoint) {
      uniqueByEndpoint.set(sub.endpoint, sub)
    }
  })

  const sendPromises = Array.from(uniqueByEndpoint.values()).map(async (sub) => {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: sub.keys
        },
        JSON.stringify(payload)
      )
    } catch (error: any) {
      const statusCode = error?.statusCode
      if (statusCode === 404 || statusCode === 410) {
        await PushSubscription.deleteOne({ endpoint: sub.endpoint })
      } else {
        console.error('Error sending push notification:', error)
      }
    }
  })

  await Promise.allSettled(sendPromises)
}

export async function sendPushToUsers(userIds: string[], payload: PushPayload) {
  if (!pushEnabled || userIds.length === 0) {
    return
  }

  await connectToDatabase()

  const subscriptions = await PushSubscription.find({
    userId: { $in: userIds }
  }).lean()

  const uniqueByEndpoint = new Map<string, typeof subscriptions[number]>()
  subscriptions.forEach((sub) => {
    if (sub.endpoint) {
      uniqueByEndpoint.set(sub.endpoint, sub)
    }
  })

  const sendPromises = Array.from(uniqueByEndpoint.values()).map(async (sub) => {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: sub.keys
        },
        JSON.stringify(payload)
      )
    } catch (error: any) {
      const statusCode = error?.statusCode
      if (statusCode === 404 || statusCode === 410) {
        await PushSubscription.deleteOne({ endpoint: sub.endpoint })
      } else {
        console.error('Error sending push notification:', error)
      }
    }
  })

  await Promise.allSettled(sendPromises)
}
