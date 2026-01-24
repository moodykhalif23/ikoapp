import mongoose, { Document, Schema } from 'mongoose'

interface PushKeys {
  p256dh: string
  auth: string
}

export interface IPushSubscription extends Document {
  userId: string
  roles: string[]
  endpoint: string
  keys: PushKeys
  userAgent?: string
  createdAt: Date
  updatedAt: Date
}

const PushSubscriptionSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true
  },
  roles: [{
    type: String,
    enum: ['admin', 'reporter', 'viewer']
  }],
  endpoint: {
    type: String,
    required: true,
    unique: true
  },
  keys: {
    p256dh: {
      type: String,
      required: true
    },
    auth: {
      type: String,
      required: true
    }
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
})

PushSubscriptionSchema.index({ userId: 1 })
PushSubscriptionSchema.index({ roles: 1 })

export default mongoose.models.PushSubscription || mongoose.model<IPushSubscription>('PushSubscription', PushSubscriptionSchema)
