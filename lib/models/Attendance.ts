import mongoose, { Document, Schema } from 'mongoose'

export interface IAttendance extends Document {
  employeeId: mongoose.Types.ObjectId
  employeeName: string
  date: Date
  shiftType: 'day' | 'night'
  signInTime: string
  signOutTime?: string
  createdBy?: string
  createdAt: Date
  updatedAt: Date
}

const AttendanceSchema: Schema = new Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Employee is required']
  },
  employeeName: {
    type: String,
    required: [true, 'Employee name is required'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  shiftType: {
    type: String,
    enum: ['day', 'night'],
    required: [true, 'Shift type is required']
  },
  signInTime: {
    type: String,
    required: [true, 'Sign-in time is required']
  },
  signOutTime: {
    type: String
  },
  createdBy: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

AttendanceSchema.index({ date: 1 })
AttendanceSchema.index({ employeeId: 1 })
AttendanceSchema.index({ shiftType: 1 })

export default mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema)
