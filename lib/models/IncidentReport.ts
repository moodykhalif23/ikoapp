import mongoose, { Document, Schema } from 'mongoose'

export interface IIncidentReport extends Document {
  reportId: mongoose.Types.ObjectId
  noIncidents: boolean
  incidents?: Array<{
    type: 'safety' | 'equipment' | 'environmental' | 'security' | 'other'
    severity: 'low' | 'medium' | 'high' | 'critical'
    description: string
    occurredAt: string
    affectedArea: string
    immediateAction: string
    reportedTo?: string
    followUpRequired: boolean
    followUpNotes?: string
  }>
  createdAt: Date
  updatedAt: Date
}

const IncidentSchema = new Schema({
  type: {
    type: String,
    enum: ['safety', 'equipment', 'environmental', 'security', 'other'],
    required: [true, 'Incident type is required']
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: [true, 'Severity level is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  occurredAt: {
    type: String,
    required: [true, 'Time of occurrence is required']
  },
  affectedArea: {
    type: String,
    required: [true, 'Affected area is required'],
    trim: true
  },
  immediateAction: {
    type: String,
    required: [true, 'Immediate action taken is required'],
    trim: true,
    maxlength: [300, 'Immediate action cannot exceed 300 characters']
  },
  reportedTo: {
    type: String,
    trim: true
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpNotes: {
    type: String,
    trim: true,
    maxlength: [300, 'Follow-up notes cannot exceed 300 characters']
  }
}, { _id: false })

const IncidentReportSchema: Schema = new Schema({
  reportId: {
    type: Schema.Types.ObjectId,
    ref: 'Report',
    required: [true, 'Report ID is required']
  },
  noIncidents: {
    type: Boolean,
    default: false,
    required: true
  },
  incidents: [IncidentSchema]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Validation for incidents array when incidents occurred
IncidentReportSchema.pre('save', function(next) {
  const doc = this as IIncidentReport
  if (!doc.noIncidents && (!doc.incidents || doc.incidents.length === 0)) {
    const error = new Error('Incidents details are required when incidents occurred')
    return next(error)
  }
  next()
})

// Index for better query performance
IncidentReportSchema.index({ reportId: 1 })
IncidentReportSchema.index({ createdAt: -1 })
IncidentReportSchema.index({ 'incidents.severity': 1 })

export default mongoose.models.IncidentReport || mongoose.model<IIncidentReport>('IncidentReport', IncidentReportSchema)