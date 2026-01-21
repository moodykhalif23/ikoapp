import mongoose, { Document, Schema } from 'mongoose'

export interface IEmployeeTimeEntry extends Document {
  employeeId: mongoose.Types.ObjectId
  employeeName: string
  employeeEmail: string
  clockInTime: Date
  clockOutTime?: Date
  shiftType?: string
  location?: string
  status: 'active' | 'completed'
  totalHours?: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const EmployeeTimeEntrySchema: Schema = new Schema({
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Employee ID is required']
  },
  employeeName: {
    type: String,
    required: [true, 'Employee name is required'],
    trim: true
  },
  employeeEmail: {
    type: String,
    required: [true, 'Employee email is required'],
    lowercase: true,
    trim: true
  },
  clockInTime: {
    type: Date,
    required: [true, 'Clock in time is required'],
    default: Date.now
  },
  clockOutTime: {
    type: Date,
    validate: {
      validator: function(this: IEmployeeTimeEntry, value: Date) {
        return !value || value > this.clockInTime
      },
      message: 'Clock out time must be after clock in time'
    }
  },
  shiftType: {
    type: String,
    enum: ['morning', 'afternoon', 'night', 'overtime'],
    default: 'morning'
  },
  location: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active',
    required: [true, 'Status is required']
  },
  totalHours: {
    type: Number,
    min: [0, 'Total hours cannot be negative']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for better query performance
EmployeeTimeEntrySchema.index({ employeeId: 1, clockInTime: -1 })
EmployeeTimeEntrySchema.index({ employeeEmail: 1, clockInTime: -1 })
EmployeeTimeEntrySchema.index({ status: 1, clockInTime: -1 })
EmployeeTimeEntrySchema.index({ clockInTime: -1 })

// Virtual for calculating total hours
EmployeeTimeEntrySchema.virtual('calculatedTotalHours').get(function(this: IEmployeeTimeEntry) {
  if (this.clockOutTime && this.clockInTime) {
    return (this.clockOutTime.getTime() - this.clockInTime.getTime()) / (1000 * 60 * 60) // Convert to hours
  }
  return 0
})

// Pre-save middleware to calculate total hours
EmployeeTimeEntrySchema.pre('save', function(next) {
  const entry = this as IEmployeeTimeEntry
  if (entry.clockOutTime && entry.clockInTime) {
    entry.totalHours = (entry.clockOutTime.getTime() - entry.clockInTime.getTime()) / (1000 * 60 * 60)
  }
  next()
})

export default mongoose.models.EmployeeTimeEntry || mongoose.model<IEmployeeTimeEntry>('EmployeeTimeEntry', EmployeeTimeEntrySchema)