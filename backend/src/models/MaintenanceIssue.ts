import mongoose, { Document, Schema } from 'mongoose';

export type MaintenanceStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'FIXED' | 'VERIFIED';
export type MaintenancePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface IMaintenanceIssue extends Document {
  room: mongoose.Types.ObjectId;
  title: string;
  description: string;
  priority: MaintenancePriority;
  assignedTo?: mongoose.Types.ObjectId;
  status: MaintenanceStatus;
  photos: string[];
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const maintenanceIssueSchema = new Schema<IMaintenanceIssue>(
  {
    room: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Room reference is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Issue title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    status: {
      type: String,
      enum: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'FIXED', 'VERIFIED'],
      default: 'OPEN',
      index: true,
    },
    photos: [
      {
        type: String,
      },
    ],
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const MaintenanceIssue = mongoose.model<IMaintenanceIssue>(
  'MaintenanceIssue',
  maintenanceIssueSchema
);
