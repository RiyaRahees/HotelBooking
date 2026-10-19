import mongoose, { Document, Schema } from 'mongoose';

export type RoomStatus =
  | 'AVAILABLE'
  | 'RESERVED'
  | 'OCCUPIED'
  | 'CLEANING'
  | 'INSPECTION'
  | 'MAINTENANCE'
  | 'OUT_OF_SERVICE';

export interface IRoom extends Document {
  roomNumber: string;
  roomType: mongoose.Types.ObjectId;
  floor: number;
  pricePerNight: number;
  capacity: number;
  amenities: string[];
  images: string[];
  description: string;
  bedType: string;
  sizeSqFt: number;
  status: RoomStatus;
  currentGuest?: mongoose.Types.ObjectId | null;
  currentBooking?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const roomSchema = new Schema<IRoom>(
  {
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      unique: true,
      trim: true,
      index: true,
    },
    roomType: {
      type: Schema.Types.ObjectId,
      ref: 'RoomType',
      required: [true, 'Room type reference is required'],
      index: true,
    },
    floor: {
      type: Number,
      required: [true, 'Floor number is required'],
      min: 1,
      index: true,
    },
    pricePerNight: {
      type: Number,
      required: [true, 'Price per night is required'],
      min: 0,
    },
    capacity: {
      type: Number,
      default: 2,
    },
    amenities: [
      {
        type: String,
      },
    ],
    images: [
      {
        type: String,
      },
    ],
    description: {
      type: String,
      default: '',
    },
    bedType: {
      type: String,
      default: 'King Bed',
    },
    sizeSqFt: {
      type: Number,
      default: 350,
    },
    status: {
      type: String,
      required: true,
      enum: [
        'AVAILABLE',
        'RESERVED',
        'OCCUPIED',
        'CLEANING',
        'INSPECTION',
        'MAINTENANCE',
        'OUT_OF_SERVICE',
      ],
      default: 'AVAILABLE',
      index: true,
    },
    currentGuest: {
      type: Schema.Types.ObjectId,
      ref: 'Guest',
      default: null,
    },
    currentBooking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Room = mongoose.model<IRoom>('Room', roomSchema);
