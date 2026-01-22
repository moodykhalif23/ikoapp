import mongoose from 'mongoose'

export interface INotification {
  _id?: string
  title: string
  message: string
  type: 'report_submitted' | 'system' | 'alert'
  recipientRoles: string[] // ['admin', 'viewer'] for report notifications
  recipientIds?: string[] // specific user IDs if needed
  reportId?: string // reference to the report that triggered this notification
  reporterName?: string
  isRead: boolean
  createdAt: Date
  updatedAt: Date
}

const NotificationSchema = new mongoose.Schema<INotification>({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['report_submitted', 'system', 'alert'],
    required: true
  },
  recipientRoles: [{
    type: String,
    enum: ['admin', 'viewer', 'reporter']
  }],
  recipientIds: [{
    type: String
  }],
  reportId: {
    type: String
  },
  reporterName: {
    type: String
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

// Index for efficient querying
NotificationSchema.index({ recipientRoles: 1, isRead: 1, createdAt: -1 })
NotificationSchema.index({ recipientIds: 1, isRead: 1, createdAt: -1 })

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema)