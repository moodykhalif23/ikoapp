import mongoose, { Document, Schema } from 'mongoose'

export interface IMediaFile {
  id: string
  name: string
  type: 'image' | 'video'
  size: string
  url: string
}

export interface ISiteVisual extends Document {
  reportId: mongoose.Types.ObjectId
  media: IMediaFile[] // Array of media files (images and videos)
  photos: string[] // Legacy field for backward compatibility
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const MediaFileSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['image', 'video'], required: true },
  size: { type: String, required: true },
  url: { type: String, required: true }
}, { _id: false })

const SiteVisualSchema: Schema = new Schema({
  reportId: {
    type: Schema.Types.ObjectId,
    ref: 'Report',
    required: [true, 'Report ID is required']
  },
  media: {
    type: [MediaFileSchema],
    default: []
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