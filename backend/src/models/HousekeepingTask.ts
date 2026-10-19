import mongoose, { Document, Schema } from 'mongoose';

export type HousekeepingStatus =
  | 'CLEANING_REQUIRED'
  | 'IN_PROGRESS'
  | 'INSPECTION'
  | 'COMPLETED';

export type HousekeepingPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface IHousekeepingChecklist {
  bedroom: boolean;
  bathroom: boolean;
  towels: boolean;
  toiletries: boolean;
  floor: boolean;
  dustbin: boolean;
  amenities: boolean;
  damage: boolean;
}

export interface IHousekeepingTask extends Document {
  room: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  status: HousekeepingStatus;
  priority: HousekeepingPriority;
  startedAt?: Date;
  completedAt?: Date;
  notes: string;
  inspectionNotes?: string;
  inspectedBy?: mongoose.Types.ObjectId;
  photos: string[];
  checklist: IHousekeepingChecklist;
  createdAt: Date;
  updatedAt: Date;
}

const housekeepingTaskSchema = new Schema<IHousekeepingTask>(
  {
    room: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Room reference is required'],
      index: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    status: {
      type: String,
      enum: ['CLEANING_REQUIRED', 'IN_PROGRESS', 'INSPECTION', 'COMPLETED'],
      default: 'CLEANING_REQUIRED',
      index: true,
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'HIGH',
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    notes: {
      type: String,
      default: '',
    },
    inspectionNotes: {
      type: String,
      default: '',
    },
    inspectedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    photos: [
      {
        type: String,
      },
    ],
    checklist: {
      bedroom: { type: Boolean, default: false },
      bathroom: { type: Boolean, default: false },
      towels: { type: Boolean, default: false },
      toiletries: { type: Boolean, default: false },
      floor: { type: Boolean, default: false },
      dustbin: { type: Boolean, default: false },
      amenities: { type: Boolean, default: false },
      damage: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

export const HousekeepingTask = mongoose.model<IHousekeepingTask>(
  'HousekeepingTask',
  housekeepingTaskSchema
);
