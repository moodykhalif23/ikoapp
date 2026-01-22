import mongoose, { Document, Schema } from 'mongoose'

export interface IEmployee extends Document {
  name: string
  employeeId: string
  phone?: string
  employeeType: 'permanent' | 'casual'
  hireDate?: Date
  status: 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
}

const EmployeeSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  employeeType: {
    type: String,
    enum: ['permanent', 'casual'],
    default: 'permanent',
    required: [true, 'Employee type is required']
  },
  hireDate: {
    type: Date,
    default: Date.now
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

// Indexes for better query performance
EmployeeSchema.index({ employeeId: 1 })
EmployeeSchema.index({ employeeType: 1 })
EmployeeSchema.index({ status: 1 })

export default mongoose.models.Employee || mongoose.model<IEmployee>('Employee', EmployeeSchema)