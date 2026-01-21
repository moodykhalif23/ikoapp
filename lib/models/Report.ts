import mongoose, { Document, Schema } from 'mongoose'

export interface IReport extends Document {
  id: string // Custom ID like RPT-123456
  date: string
  reportedBy: string
  reportedByEmail: string
  status: 'draft' | 'submitted' | 'reviewed' | 'approved'
  submittedAt?: Date
  reviewedAt?: Date
  reviewedBy?: string
  approvedAt?: Date
  approvedBy?: string
  powerInterruptionId?: mongoose.Types.ObjectId
  siteVisualId?: mongoose.Types.ObjectId
  dailyProductionId?: mongoose.Types.ObjectId
  incidentReportId?: mongoose.Types.ObjectId
  employeePlanningId?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const ReportSchema: Schema = new Schema({
  id: {
    type: String,
    required: [true, 'Report ID is required'],
    unique: true,
    trim: true
  },
  date: {
    type: String,
    required: [true, 'Report date is required'],
    match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format']
  },
  reportedBy: {
    type: String,
    required: [true, 'Reporter name is required'],
    trim: true
  },
  reportedByEmail: {
    type: String,
    required: [true, 'Reporter email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'reviewed', 'approved'],
    default: 'draft'
  },
  submittedAt: {
    type: Date
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: String,
    trim: true
  },
  approvedAt: {
    type: Date
  },
  approvedBy: {
    type: String,
    trim: true
  },
  powerInterruptionId: {
    type: Schema.Types.ObjectId,
    ref: 'PowerInterruption'
  },
  siteVisualId: {
    type: Schema.Types.ObjectId,
    ref: 'SiteVisual'
  },
  dailyProductionId: {
    type: Schema.Types.ObjectId,
    ref: 'DailyProduction'
  },
  incidentReportId: {
    type: Schema.Types.ObjectId,
    ref: 'IncidentReport'
  },
  employeePlanningId: {
    type: Schema.Types.ObjectId,
    ref: 'EmployeePlanning'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for better query performance
ReportSchema.index({ id: 1 }, { unique: true })
ReportSchema.index({ reportedByEmail: 1 })
ReportSchema.index({ date: 1 })
ReportSchema.index({ status: 1 })
ReportSchema.index({ submittedAt: -1 })
ReportSchema.index({ createdAt: -1 })

// Virtual for checking if report is complete
ReportSchema.virtual('isComplete').get(function() {
  const report = this as IReport
  return !!(report.powerInterruptionId && report.siteVisualId &&
           report.dailyProductionId && report.incidentReportId &&
           report.employeePlanningId)
})

// Pre-save middleware to generate unique ID
ReportSchema.pre('save', async function(next) {
  const report = this as IReport
  if (this.isNew && !report.id) {
    let counter = 0
    let uniqueId
    do {
      uniqueId = `RPT-${Date.now()}${counter > 0 ? `-${counter}` : ''}`
      counter++
    } while (await mongoose.models.Report.findOne({ id: uniqueId }))
    report.id = uniqueId
  }
  next()
})

// Update status when submitted
ReportSchema.pre('save', function(next) {
  const report = this as IReport
  if (report.isModified('submittedAt') && report.submittedAt && !report.status) {
    report.status = 'submitted'
  }
  next()
})

export default mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema)