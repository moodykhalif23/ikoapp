import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  role: 'admin' | 'reporter' | 'viewer'
  createdAt: Date
  updatedAt: Date
}

const UserSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  role: {
    type: String,
    enum: ['admin', 'reporter', 'viewer'],
    default: 'viewer',
    required: [true, 'Role is required']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Index for better query performance
UserSchema.index({ email: 1 }, { unique: true })
UserSchema.index({ role: 1 })

// Prevent duplicate registration
UserSchema.pre('save', async function(next) {
  const user = this as IUser
  if (this.isModified('email')) {
    const existingUser = await mongoose.models.User.findOne({ email: user.email })
    if (existingUser && existingUser._id.toString() !== user._id.toString()) {
      const error = new Error('Email already exists')
      return next(error)
    }
  }
  next()
})

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)