import type { INotification } from "@/lib/models/Notification"

type NotificationSubscriber = {
  id: string
  userId?: string | null
  userRole?: string | null
  controller: ReadableStreamDefaultController<string>
}

const getSubscribers = () => {
  const globalAny = globalThis as typeof globalThis & {
    __ikoappNotificationSubscribers?: Set<NotificationSubscriber>
  }
  if (!globalAny.__ikoappNotificationSubscribers) {
    globalAny.__ikoappNotificationSubscribers = new Set<NotificationSubscriber>()
  }
  return globalAny.__ikoappNotificationSubscribers
}

const formatSseMessage = (event: string, data: unknown) => {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}

export const addNotificationSubscriber = (subscriber: NotificationSubscriber) => {
  getSubscribers().add(subscriber)
}

export const removeNotificationSubscriber = (subscriber: NotificationSubscriber) => {
  getSubscribers().delete(subscriber)
}

export const sendSseEvent = (
  controller: ReadableStreamDefaultController<string>,
  event: string,
  data: unknown
) => {
  controller.enqueue(formatSseMessage(event, data))
}

const shouldDeliverNotification = (notification: INotification, subscriber: NotificationSubscriber) => {
  const roleMatches = subscriber.userRole
    ? notification.recipientRoles?.includes(subscriber.userRole)
    : false
  const idMatches = subscriber.userId
    ? notification.recipientIds?.includes(subscriber.userId)
    : false
  return roleMatches || idMatches
}

export const publishNotification = (notification: INotification) => {
  const subscribers = getSubscribers()
  if (!subscribers.size) return

  for (const subscriber of subscribers) {
    if (!shouldDeliverNotification(notification, subscriber)) {
      continue
    }
    try {
      sendSseEvent(subscriber.controller, "notification", { notification })
    } catch {
      subscribers.delete(subscriber)
    }
  }
}
