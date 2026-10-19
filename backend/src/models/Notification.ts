import mongoose, { Document, Schema } from 'mongoose';

export type NotificationType =
  | 'BOOKING'
  | 'CHECKIN'
  | 'CHECK_IN'
  | 'CHECKOUT'
  | 'CHECK_OUT'
  | 'HOUSEKEEPING'
  | 'MAINTENANCE'
  | 'PAYMENT'
  | 'SYSTEM';

export interface INotification extends Document {
  recipient?: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  relatedId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['BOOKING', 'CHECKIN', 'CHECK_IN', 'CHECKOUT', 'CHECK_OUT', 'HOUSEKEEPING', 'MAINTENANCE', 'PAYMENT', 'SYSTEM'],
      default: 'SYSTEM',
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    relatedId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Notification = mongoose.model<INotification>(
  'Notification',
  notificationSchema
);
