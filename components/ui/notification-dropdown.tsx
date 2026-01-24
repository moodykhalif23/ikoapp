"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { 
  Notifications as BellIcon, 
  Check as CheckIcon, 
  DoneAll as CheckCheckIcon 
} from "@mui/icons-material"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Notification {
  _id: string
  title: string
  message: string
  type: string
  reportId?: string
  attendanceDate?: string
  reporterName?: string
  isRead: boolean
  createdAt: string
}

interface NotificationDropdownProps {
  user: any
  className?: string
}

export default function NotificationDropdown({ user, className }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const lastNotifiedAtRef = useRef<number>(0)
  const userId = user?._id || user?.id
  const userRole = user?.role || (Array.isArray(user?.roles) ? user.roles[0] : undefined)

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem("ikoapp:lastNotificationAt")
    if (stored) {
      lastNotifiedAtRef.current = Number(stored) || 0
    }
  }, [])

  const fetchNotifications = async () => {
    // Don't fetch if user is not available
    if (!userId || !userRole) {
      return
    }
    
    try {
      setLoading(true)
      const response = await fetch(`/api/notifications?role=${userRole}&userId=${userId}&limit=10`)
      if (response.ok) {
        const data = await response.json()
        const nextNotifications = data.notifications || []
        setNotifications(nextNotifications)
        setUnreadCount(nextNotifications.filter((n: Notification) => !n.isRead).length || 0)
        maybeShowSystemNotification(nextNotifications)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: [notificationId] })
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          markAllAsRead: true, 
          userRole: user?.role, 
          userId: user?._id 
        })
      })

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const maybeShowSystemNotification = (list: Notification[]) => {
    if (typeof window === 'undefined' || !("Notification" in window)) {
      return
    }
    if (Notification.permission !== "granted") {
      return
    }

    const newest = list
      .filter((item) => new Date(item.createdAt).getTime() > lastNotifiedAtRef.current)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]

    if (!newest) {
      return
    }

    new Notification(newest.title, {
      body: newest.message
    })
    const nextTime = new Date(newest.createdAt).getTime()
    lastNotifiedAtRef.current = nextTime
    window.localStorage.setItem("ikoapp:lastNotificationAt", String(nextTime))
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id)
    }

    const target =
      notification.type === "report_submitted" && notification.reportId
        ? { type: "report", reportId: notification.reportId }
        : notification.type === "attendance_submitted" && notification.attendanceDate
          ? { type: "attendance", attendanceDate: notification.attendanceDate }
          : null

    if (target && typeof window !== "undefined") {
      window.localStorage.setItem("ikoapp:notificationTarget", JSON.stringify(target))
      window.dispatchEvent(
        new CustomEvent("ikoapp:notification-target", { detail: target })
      )
      setIsOpen(false)
    }
  }

  const ensurePushSubscription = async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      return
    }
    if (!userId) {
      return
    }
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!vapidPublicKey) {
      return
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      const ready = await navigator.serviceWorker.ready
      let subscription = await ready.pushManager.getSubscription()

      if (!subscription) {
        subscription = await ready.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
        })
      }

      const roles = Array.isArray(user?.roles)
        ? user.roles
        : userRole
          ? [userRole]
          : []

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          roles,
          subscription,
          userAgent: navigator.userAgent
        })
      })
    } catch (error) {
      console.error('Error registering push subscription:', error)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen && userId && userRole) {
      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "default") {
          Notification.requestPermission()
            .then((permission) => {
              if (permission === 'granted') {
                ensurePushSubscription()
              }
            })
            .catch(() => null)
        }
        if (Notification.permission === 'granted') {
          ensurePushSubscription()
        }
      }
      fetchNotifications()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, userId, userRole])

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (!userId || !userRole) {
      return
    }

    const interval = setInterval(() => {
      // Only fetch when dropdown is closed to avoid conflicts
      if (!isOpen) {
        fetchNotifications()
      }
    }, 30000)

    return () => clearInterval(interval)
    // Only recreate interval when user changes, not when isOpen changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, userRole])

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={`relative p-2 ${className}`}>
          <BellIcon sx={{ fontSize: 20 }} />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500 hover:bg-red-500">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs h-auto p-1"
            >
              <CheckCheckIcon sx={{ fontSize: 14, marginRight: 0.5 }} />
              Mark all read
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-96">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                    !notification.isRead ? 'bg-blue-50/50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm font-medium truncate ${
                          !notification.isRead ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation()
                          markAsRead(notification._id)
                        }}
                      >
                        <CheckIcon sx={{ fontSize: 14 }} />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {notifications.length > 0 && (
          <div className="p-2 border-t">
            <Button variant="ghost" size="sm" className="w-full text-xs">
              View all notifications
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
