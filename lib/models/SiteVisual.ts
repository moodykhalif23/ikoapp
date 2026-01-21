import mongoose, { Document, Schema } from 'mongoose'

export interface ISiteVisual extends Document {
  reportId: mongoose.Types.ObjectId
  photos: string[] // Array of photo URLs or file paths
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const SiteVisualSchema: Schema = new Schema({
  reportId: {
    type: Schema.Types.ObjectId,
    ref: 'Report',
    required: [true, 'Report ID is required']
  },
  photos: [{
    type: String,
    trim: true
  }],
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

// Index for better query performance
SiteVisualSchema.index({ reportId: 1 })
SiteVisualSchema.index({ createdAt: -1 })

export default mongoose.models.SiteVisual || mongoose.model<ISiteVisual>('SiteVisual', SiteVisualSchema)