import mongoose, { Document, Schema } from 'mongoose'

export interface IDailyProduction extends Document {
  reportId: mongoose.Types.ObjectId
  machineProductions: Array<{
    machineName: string
    producedUnits: number
    targetUnits: number
    efficiency: number
    downtime: number
    notes?: string
  }>
  totalProduced: number
  totalTarget: number
  overallEfficiency: number
  createdAt: Date
  updatedAt: Date
}

const MachineProductionSchema = new Schema({
  machineName: {
    type: String,
    required: [true, 'Machine name is required'],
    trim: true
  },
  producedUnits: {
    type: Number,
    required: [true, 'Produced units is required'],
    min: [0, 'Produced units cannot be negative']
  },
  targetUnits: {
    type: Number,
    required: [true, 'Target units is required'],
    min: [0, 'Target units cannot be negative']
  },
  efficiency: {
    type: Number,
    min: [0, 'Efficiency cannot be less than 0%'],
    max: [100, 'Efficiency cannot exceed 100%']
  },
  downtime: {
    type: Number,
    min: [0, 'Downtime cannot be negative'],
    default: 0
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [200, 'Notes cannot exceed 200 characters']
  }
}, { _id: false })

const DailyProductionSchema: Schema = new Schema({
  reportId: {
    type: Schema.Types.ObjectId,
    ref: 'Report',
    required: [true, 'Report ID is required']
  },
  machineProductions: [MachineProductionSchema],
  totalProduced: {
    type: Number,
    default: 0,
    min: [0, 'Total produced cannot be negative']
  },
  totalTarget: {
    type: Number,
    default: 0,
    min: [0, 'Total target cannot be negative']
  },
  overallEfficiency: {
    type: Number,
    min: [0, 'Overall efficiency cannot be less than 0%'],
    max: [100, 'Overall efficiency cannot exceed 100%']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Calculate totals before saving
DailyProductionSchema.pre('save', function() {
  const doc = this as unknown as IDailyProduction

  if (doc.machineProductions && doc.machineProductions.length > 0) {
    doc.totalProduced = doc.machineProductions.reduce((sum, machine) => sum + machine.producedUnits, 0)
    doc.totalTarget = doc.machineProductions.reduce((sum, machine) => sum + machine.targetUnits, 0)
    doc.overallEfficiency = doc.totalTarget > 0 ? (doc.totalProduced / doc.totalTarget) * 100 : 0
  }
})

// Index for better query performance
DailyProductionSchema.index({ reportId: 1 })
DailyProductionSchema.index({ createdAt: -1 })

export default mongoose.models.DailyProduction || mongoose.model<IDailyProduction>('DailyProduction', DailyProductionSchema)