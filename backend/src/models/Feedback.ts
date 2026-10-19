import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedback extends Document {
  guest: mongoose.Types.ObjectId;
  booking?: mongoose.Types.ObjectId;
  room?: mongoose.Types.ObjectId;
  overallRating: number;
  cleanlinessRating: number;
  roomRating: number;
  staffRating: number;
  serviceRating: number;
  comments: string;
  reply?: {
    message: string;
    repliedBy: mongoose.Types.ObjectId;
    repliedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const feedbackSchema = new Schema<IFeedback>(
  {
    guest: {
      type: Schema.Types.ObjectId,
      ref: 'Guest',
      required: [true, 'Guest reference is required'],
      index: true,
    },
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      index: true,
    },
    room: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      index: true,
    },
    overallRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    cleanlinessRating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
    },
    roomRating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
    },
    staffRating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
    },
    serviceRating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
    },
    comments: {
      type: String,
      default: '',
    },
    reply: {
      message: { type: String },
      repliedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      repliedAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

export const Feedback = mongoose.model<IFeedback>('Feedback', feedbackSchema);
