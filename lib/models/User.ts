import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  password: string
  roles: ('admin' | 'reporter' | 'viewer')[] // Changed to array to support multiple roles
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
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  roles: [{
    type: String,
    enum: ['admin', 'reporter', 'viewer'],
    required: false // Allow users to sign up without roles initially
  }],
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

// Additional indexes for better query performance (email index is already created by unique: true)
UserSchema.index({ roles: 1 })
UserSchema.index({ employeeType: 1 })
UserSchema.index({ status: 1 })
UserSchema.index({ department: 1 })

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)