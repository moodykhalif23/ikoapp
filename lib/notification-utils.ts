import { Notification } from '@/lib/models'
import connectToDatabase from '@/lib/mongodb'
import { sendPushToRoles, sendPushToUsers } from '@/lib/push-utils'
import { publishNotification } from '@/lib/notifications-sse'

export async function createReportNotification(
  reportId: string,
  reporterName: string,
  reportType: string
) {
  try {
    await connectToDatabase()
    
    const notification = new Notification({
      title: 'New Report Submitted',
      message: `${reporterName} has submitted a new ${reportType} report`,
      type: 'report_submitted',
      recipientRoles: ['admin', 'viewer'], // Notify both admins and viewers
      reportId,
      reporterName,
      isRead: false
    })

    await notification.save()
    await sendPushToRoles(['admin', 'viewer'], {
      title: notification.title,
      body: notification.message,
      data: {
        type: 'report',
        reportId
      }
    })
    return notification
  } catch (error) {
    console.error('Error creating report notification:', error)
    throw error
  }
}

export async function createAttendanceNotification(
  attendanceDate: string,
  reporterName: string
) {
  try {
    await connectToDatabase()

    const notification = new Notification({
      title: 'Attendance Submitted',
      message: `${reporterName} has submitted attendance for ${attendanceDate}`,
      type: 'attendance_submitted',
      recipientRoles: ['admin', 'viewer'],
      attendanceDate,
      reporterName,
      isRead: false
    })

    await notification.save()
    await sendPushToRoles(['admin', 'viewer'], {
      title: notification.title,
      body: notification.message,
      data: {
        type: 'attendance',
        attendanceDate
      }
    })
    return notification
  } catch (error) {
    console.error('Error creating attendance notification:', error)
    throw error
  }
}

export async function getUnreadNotificationCount(userRole: string, userId?: string) {
  try {
    await connectToDatabase()
    
    const query: any = {
      $or: [
        { recipientRoles: userRole },
        { recipientIds: userId }
      ],
      isRead: false
    }

    const count = await Notification.countDocuments(query)
    return count
  } catch (error) {
    console.error('Error getting unread notification count:', error)
    return 0
  }
}

export async function createIncidentTaskNotification({
  assigneeId,
  assigneeName,
  reportId,
  taskTitle,
  dueDate
}: {
  assigneeId: string
  assigneeName?: string
  reportId: string
  taskTitle: string
  dueDate: string
}) {
  try {
    await connectToDatabase()

    const displayName = assigneeName ? ` for ${assigneeName}` : ""
    const notification = new Notification({
      title: "Incident task assigned",
      message: `${taskTitle}${displayName} (due ${dueDate})`,
      type: "task_assigned",
      recipientRoles: [],
      recipientIds: [assigneeId],
      reportId,
      isRead: false
    })

    await notification.save()
    publishNotification(notification)

    await sendPushToUsers([assigneeId], {
      title: notification.title,
      body: notification.message,
      data: {
        type: "tasks",
        reportId
      }
    })

    return notification
  } catch (error) {
    console.error("Error creating task notification:", error)
    throw error
  }
}
