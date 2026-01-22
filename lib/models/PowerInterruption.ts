import mongoose, { Document, Schema } from 'mongoose'

export interface IPowerInterruption extends Document {
  reportId: mongoose.Types.ObjectId
  noInterruptions: boolean
  occurredAt?: string
  duration?: number
  affectedMachines?: string[]
  kplcMeter?: number
  createdAt: Date
  updatedAt: Date
}

const PowerInterruptionSchema: Schema = new Schema({
  reportId: {
    type: Schema.Types.ObjectId,
    ref: 'Report',
    required: [true, 'Report ID is required']
  },
  noInterruptions: {
    type: Boolean,
    default: false,
    required: true
  },
  occurredAt: {
    type: String,
    validate: {
      validator: function(v: string) {
        // Only validate if noInterruptions is false
        if (!this.noInterruptions && !v) return false
        return true
      },
      message: 'Time of interruption is required when interruptions occurred'
    }
  },
  duration: {
    type: Number,
    min: [1, 'Duration must be at least 1 minute'],
    validate: {
      validator: function(v: number) {
        // Only validate if noInterruptions is false
        if (!this.noInterruptions && (!v || v <= 0)) return false
        return true
      },
      message: 'Duration is required and must be greater than 0 when interruptions occurred'
    }
  },
  affectedMachines: [{
    type: String,
    trim: true
  }],
  kplcMeter: {
    type: Number,
    min: [0, 'KPLC meter reading cannot be negative']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Validation for affected machines when interruptions occurred
PowerInterruptionSchema.pre('save', function() {
  const doc = this as unknown as IPowerInterruption
  if (!doc.noInterruptions && (!doc.affectedMachines || doc.affectedMachines.length === 0)) {
    throw new Error('Affected machines are required when interruptions occurred')
  }
})

// Index for better query performance
PowerInterruptionSchema.index({ reportId: 1 })
PowerInterruptionSchema.index({ createdAt: -1 })

export default mongoose.models.PowerInterruption || mongoose.model<IPowerInterruption>('PowerInterruption', PowerInterruptionSchema)