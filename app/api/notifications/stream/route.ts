import { NextRequest } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import { Notification } from "@/lib/models"
import {
  addNotificationSubscriber,
  removeNotificationSubscriber,
  sendSseEvent,
} from "@/lib/notifications-sse"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userRole = searchParams.get("role")
  const userId = searchParams.get("userId")
  const limit = parseInt(searchParams.get("limit") || "10")
  const unreadOnly = searchParams.get("unreadOnly") === "true"

  if (!userRole && !userId) {
    return new Response("Missing role or userId", { status: 400 })
  }

  await connectToDatabase()

  const query: any = {
    $or: [
      userRole ? { recipientRoles: userRole } : null,
      userId ? { recipientIds: userId } : null,
    ].filter(Boolean),
  }

  if (unreadOnly) {
    query.isRead = false
  }

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()

  const stream = new ReadableStream<string>({
    start(controller) {
      const subscriber = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        userId,
        userRole,
        controller,
      }

      addNotificationSubscriber(subscriber)
      sendSseEvent(controller, "init", { notifications })
      sendSseEvent(controller, "ping", { time: Date.now() })

      const pingInterval = setInterval(() => {
        try {
          sendSseEvent(controller, "ping", { time: Date.now() })
        } catch {
          clearInterval(pingInterval)
          removeNotificationSubscriber(subscriber)
        }
      }, 25000)

      request.signal.addEventListener("abort", () => {
        clearInterval(pingInterval)
        removeNotificationSubscriber(subscriber)
      })
    },
    cancel() {
      // Cleanup handled by abort listener
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
