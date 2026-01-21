import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  role: 'admin' | 'reporter' | 'viewer'
  employeeType: 'permanent' | 'casual'
  employeeId?: string
  department?: string
  phone?: string
  hireDate?: Date
  status: 'active' | 'inactive'
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
  },
  employeeType: {
    type: String,
    enum: ['permanent', 'casual'],
    default: 'permanent',
    required: [true, 'Employee type is required']
  },
  employeeId: {
    type: String,
    trim: true,
    sparse: true
  },
  department: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  hireDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
    required: [true, 'Status is required']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Additional indexes for better query performance
UserSchema.index({ role: 1 })
UserSchema.index({ employeeType: 1 })
UserSchema.index({ status: 1 })
UserSchema.index({ department: 1 })

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