import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'ADMIN' | 'MANAGER' | 'RECEPTIONIST' | 'HOUSEKEEPING' | 'MAINTENANCE' | 'ACCOUNTANT';

export type PermissionModule =
  | 'dashboard'
  | 'rooms'
  | 'roomTypes'
  | 'bookings'
  | 'guests'
  | 'checkin'
  | 'checkout'
  | 'payments'
  | 'invoices'
  | 'housekeeping'
  | 'maintenance'
  | 'feedback'
  | 'staff'
  | 'reports'
  | 'notifications'
  | 'settings'
  | 'auditLogs';

export interface IRolePermission {
  module: PermissionModule;
  read: boolean;
  write: boolean;
  update: boolean;
  delete: boolean;
}

export interface IRole extends Document {
  name: UserRole;
  description: string;
  permissions: IRolePermission[];
  createdAt: Date;
  updatedAt: Date;
}

const rolePermissionSchema = new Schema<IRolePermission>(
  {
    module: {
      type: String,
      required: true,
      enum: [
        'dashboard',
        'rooms',
        'roomTypes',
        'bookings',
        'guests',
        'checkin',
        'checkout',
        'payments',
        'invoices',
        'housekeeping',
        'maintenance',
        'feedback',
        'staff',
        'reports',
        'notifications',
        'settings',
        'auditLogs',
      ],
    },
    read: { type: Boolean, default: true },
    write: { type: Boolean, default: false },
    update: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
  },
  { _id: false }
);

const roleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      unique: true,
      enum: ['ADMIN', 'MANAGER', 'RECEPTIONIST', 'HOUSEKEEPING', 'MAINTENANCE', 'ACCOUNTANT'],
    },
    description: {
      type: String,
      default: '',
    },
    permissions: [rolePermissionSchema],
  },
  {
    timestamps: true,
  }
);

export const Role = mongoose.model<IRole>('Role', roleSchema);
