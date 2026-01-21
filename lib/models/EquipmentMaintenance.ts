import mongoose, { Document, Schema } from 'mongoose'

export interface IEquipmentMaintenance extends Document {
  equipmentId: mongoose.Types.ObjectId
  equipmentName: string
  maintenanceType: 'preventive' | 'corrective' | 'predictive' | 'emergency'
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
  scheduledDate: Date
  completedDate?: Date
  description: string
  assignedTo?: string
  estimatedHours?: number
  actualHours?: number
  cost?: number
  partsUsed?: string[]
  notes?: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

const EquipmentMaintenanceSchema: Schema = new Schema({
  equipmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Machine',
    required: [true, 'Equipment ID is required']
  },
  equipmentName: {
    type: String,
    required: [true, 'Equipment name is required'],
    trim: true
  },
  maintenanceType: {
    type: String,
    enum: ['preventive', 'corrective', 'predictive', 'emergency'],
    required: [true, 'Maintenance type is required']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    required: [true, 'Priority is required']
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled',
    required: [true, 'Status is required']
  },
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required']
  },
  completedDate: {
    type: Date,
    validate: {
      validator: function(this: IEquipmentMaintenance, value: Date) {
        return !value || value >= this.scheduledDate
      },
      message: 'Completed date must be after scheduled date'
    }
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  assignedTo: {
    type: String,
    trim: true
  },
  estimatedHours: {
    type: Number,
    min: [0, 'Estimated hours cannot be negative']
  },
  actualHours: {
    type: Number,
    min: [0, 'Actual hours cannot be negative']
  },
  cost: {
    type: Number,
    min: [0, 'Cost cannot be negative']
  },
  partsUsed: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  createdBy: {
    type: String,
    required: [true, 'Created by is required'],
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for better query performance
EquipmentMaintenanceSchema.index({ equipmentId: 1, scheduledDate: -1 })
EquipmentMaintenanceSchema.index({ status: 1, priority: 1, scheduledDate: -1 })
EquipmentMaintenanceSchema.index({ maintenanceType: 1, scheduledDate: -1 })
EquipmentMaintenanceSchema.index({ createdAt: -1 })

// Virtual for overdue status
EquipmentMaintenanceSchema.virtual('isOverdue').get(function(this: IEquipmentMaintenance) {
  if (this.status === 'completed' || this.status === 'cancelled') return false
  return new Date() > this.scheduledDate
})

// Virtual for days until maintenance
EquipmentMaintenanceSchema.virtual('daysUntilMaintenance').get(function(this: IEquipmentMaintenance) {
  if (this.status === 'completed' || this.status === 'cancelled') return null
  const diffTime = this.scheduledDate.getTime() - new Date().getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

export default mongoose.models.EquipmentMaintenance || mongoose.model<IEquipmentMaintenance>('EquipmentMaintenance', EquipmentMaintenanceSchema)