import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { Notification } from '@/lib/models'

// GET - Fetch notifications for a user
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    
    const { searchParams } = new URL(request.url)
    const userRole = searchParams.get('role')
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '20')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    if (!userRole) {
      return NextResponse.json({ error: 'User role is required' }, { status: 400 })
    }

    // Build query
    const query: any = {
      $or: [
        { recipientRoles: userRole },
        { recipientIds: userId }
      ]
    }

    if (unreadOnly) {
      query.isRead = false
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

// POST - Create a new notification
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    
    const body = await request.json()
    const { title, message, type, recipientRoles, recipientIds, reportId, reporterName } = body

    if (!title || !message || !type || (!recipientRoles && !recipientIds)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const notification = new Notification({
      title,
      message,
      type,
      recipientRoles: recipientRoles || [],
      recipientIds: recipientIds || [],
      reportId,
      reporterName,
      isRead: false
    })

    await notification.save()

    return NextResponse.json({ notification }, { status: 201 })
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 })
  }
}

// PATCH - Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    await connectToDatabase()
    
    const body = await request.json()
    const { notificationIds, markAllAsRead, userRole, userId } = body

    if (markAllAsRead) {
      // Mark all notifications for this user as read
      const query: any = {
        $or: [
          { recipientRoles: userRole },
          { recipientIds: userId }
        ],
        isRead: false
      }

      await Notification.updateMany(query, { isRead: true })
    } else if (notificationIds && notificationIds.length > 0) {
      // Mark specific notifications as read
      await Notification.updateMany(
        { _id: { $in: notificationIds } },
        { isRead: true }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating notifications:', error)
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 })
  }
}