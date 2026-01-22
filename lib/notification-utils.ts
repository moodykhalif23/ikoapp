import { Notification } from '@/lib/models'
import connectToDatabase from '@/lib/mongodb'

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
    return notification
  } catch (error) {
    console.error('Error creating report notification:', error)
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