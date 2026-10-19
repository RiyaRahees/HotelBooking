import mongoose, { Document, Schema } from 'mongoose';

export type PaymentType =
  | 'ADVANCE'
  | 'ROOM'
  | 'FOOD'
  | 'LAUNDRY'
  | 'SERVICE'
  | 'REFUND'
  | 'FINAL_PAYMENT'
  | 'OTHER';

export type PaymentMethod = 'CASH' | 'CARD' | 'UPI' | 'ONLINE';

export interface IPayment extends Document {
  paymentId: string;
  booking?: mongoose.Types.ObjectId;
  guest: mongoose.Types.ObjectId;
  amount: number;
  type: PaymentType;
  method: PaymentMethod;
  status: 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';
  transactionId: string;
  notes?: string;
  receivedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    paymentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      index: true,
    },
    guest: {
      type: Schema.Types.ObjectId,
      ref: 'Guest',
      required: [true, 'Guest reference is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: 0,
    },
    type: {
      type: String,
      enum: ['ADVANCE', 'ROOM', 'FOOD', 'LAUNDRY', 'SERVICE', 'REFUND', 'FINAL_PAYMENT', 'OTHER'],
      default: 'ROOM',
    },
    method: {
      type: String,
      enum: ['CASH', 'CARD', 'UPI', 'ONLINE'],
      required: [true, 'Payment method is required'],
    },
    status: {
      type: String,
      enum: ['PENDING', 'PAID', 'REFUNDED', 'FAILED'],
      default: 'PAID',
      index: true,
    },
    transactionId: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      default: '',
    },
    receivedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);
