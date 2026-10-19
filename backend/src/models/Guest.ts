import mongoose, { Document, Schema } from 'mongoose';

export interface IGuest extends Document {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  dateOfBirth?: Date;
  address: string;
  nationality: string;
  idType: 'Passport' | 'Driving License' | 'National ID' | 'Aadhaar';
  idNumber: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  notes?: string;
  vip: boolean;
  avatar?: string;
  currentBooking?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
  fullName: string;
  idNumberMasked: string;
}

const guestSchema = new Schema<IGuest>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      index: true,
    },
    dateOfBirth: {
      type: Date,
    },
    address: {
      type: String,
      default: '',
    },
    nationality: {
      type: String,
      default: 'Indian',
    },
    idType: {
      type: String,
      enum: ['Passport', 'Driving License', 'National ID', 'Aadhaar'],
      default: 'Passport',
    },
    idNumber: {
      type: String,
      required: [true, 'Identity document number is required'],
      trim: true,
    },
    emergencyContact: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      relationship: { type: String, default: '' },
    },
    notes: {
      type: String,
      default: '',
    },
    vip: {
      type: Boolean,
      default: false,
      index: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    currentBooking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

guestSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

guestSchema.virtual('idNumberMasked').get(function () {
  if (!this.idNumber) return '';
  if (this.idNumber.length <= 4) return '••••' + this.idNumber;
  return '•••• ' + this.idNumber.slice(-4);
});

export const Guest = mongoose.model<IGuest>('Guest', guestSchema);
