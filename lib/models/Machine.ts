import mongoose, { Document, Schema } from 'mongoose'

export interface IMachine extends Document {
  name: string
  type: string
  status: 'active' | 'inactive' | 'maintenance'
  createdAt: Date
  updatedAt: Date
}

const MachineSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Machine name is required'],
    trim: true,
    unique: true
  },
  type: {
    type: String,
    required: [true, 'Machine type is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Additional indexes for better query performance
MachineSchema.index({ status: 1 })
MachineSchema.index({ type: 1 })

export default mongoose.models.Machine || mongoose.model<IMachine>('Machine', MachineSchema)