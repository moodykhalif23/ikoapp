import mongoose, { Document, Schema } from "mongoose"

export interface IIncidentTask extends Document {
  title: string
  description?: string
  status: "open" | "in-progress" | "closed"
  dueDate: Date
  reportId: string
  reportDate?: string
  incidentType?: string
  incidentTime?: string
  taskKey: string
  assignedToId: string
  assignedToName?: string
  assignedToEmail?: string
  createdById?: string
  createdByName?: string
  comments?: Array<{
    id: string
    author: string
    role: string
    text: string
    timestamp: string
  }>
  createdAt: Date
  updatedAt: Date
}

const IncidentTaskSchema = new Schema<IIncidentTask>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "closed"],
      default: "open"
    },
    dueDate: {
      type: Date,
      required: true
    },
    reportId: {
      type: String,
      required: true,
      trim: true
    },
    reportDate: {
      type: String,
      trim: true
    },
    incidentType: {
      type: String,
      trim: true
    },
    incidentTime: {
      type: String,
      trim: true
    },
    taskKey: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    assignedToId: {
      type: String,
      required: true,
      trim: true
    },
    assignedToName: {
      type: String,
      trim: true
    },
    assignedToEmail: {
      type: String,
      trim: true
    },
    createdById: {
      type: String,
      trim: true
    },
    createdByName: {
      type: String,
      trim: true
    },
    comments: [
      {
        id: { type: String, required: true },
        author: { type: String, required: true },
        role: { type: String, required: true },
        text: { type: String, required: true },
        timestamp: { type: String, required: true }
      }
    ]
  },
  {
    timestamps: true
  }
)

IncidentTaskSchema.index({ assignedToId: 1, status: 1, dueDate: 1 })
IncidentTaskSchema.index({ reportId: 1, createdAt: -1 })
IncidentTaskSchema.index({ status: 1, dueDate: 1 })

export default mongoose.models.IncidentTask ||
  mongoose.model<IIncidentTask>("IncidentTask", IncidentTaskSchema)
