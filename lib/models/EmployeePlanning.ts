import mongoose, { Document, Schema } from 'mongoose'

export interface IEmployeePlanning extends Document {
  reportId: mongoose.Types.ObjectId
  totalEmployees: number
  presentEmployees: number
  absentEmployees: number
  shiftDetails: Array<{
    shift: 'morning' | 'afternoon' | 'night'
    plannedEmployees: number
    actualEmployees: number
    supervisor: string
  }>
  overtimeHours: number
  trainingHours: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const ShiftDetailSchema = new Schema({
  shift: {
    type: String,
    enum: ['morning', 'afternoon', 'night'],
    required: [true, 'Shift type is required']
  },
  plannedEmployees: {
    type: Number,
    required: [true, 'Planned employees count is required'],
    min: [0, 'Planned employees cannot be negative']
  },
  actualEmployees: {
    type: Number,
    required: [true, 'Actual employees count is required'],
    min: [0, 'Actual employees cannot be negative']
  },
  supervisor: {
    type: String,
    required: [true, 'Supervisor name is required'],
    trim: true
  }
}, { _id: false })

const EmployeePlanningSchema: Schema = new Schema({
  reportId: {
    type: Schema.Types.ObjectId,
    ref: 'Report',
    required: [true, 'Report ID is required']
  },
  totalEmployees: {
    type: Number,
    required: [true, 'Total employees count is required'],
    min: [0, 'Total employees cannot be negative']
  },
  presentEmployees: {
    type: Number,
    required: [true, 'Present employees count is required'],
    min: [0, 'Present employees cannot be negative']
  },
  absentEmployees: {
    type: Number,
    default: 0,
    min: [0, 'Absent employees cannot be negative']
  },
  shiftDetails: [ShiftDetailSchema],
  overtimeHours: {
    type: Number,
    default: 0,
    min: [0, 'Overtime hours cannot be negative']
  },
  trainingHours: {
    type: Number,
    default: 0,
    min: [0, 'Training hours cannot be negative']
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

// Calculate absent employees before saving
EmployeePlanningSchema.pre('save', function() {
  const doc = this as unknown as IEmployeePlanning
  doc.absentEmployees = doc.totalEmployees - doc.presentEmployees
})

// Index for better query performance
EmployeePlanningSchema.index({ reportId: 1 })
EmployeePlanningSchema.index({ createdAt: -1 })

export default mongoose.models.EmployeePlanning || mongoose.model<IEmployeePlanning>('EmployeePlanning', EmployeePlanningSchema)