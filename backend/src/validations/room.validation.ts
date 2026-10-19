import { z } from 'zod';

export const createRoomTypeSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Room type name is required'),
    description: z.string().optional(),
    basePrice: z.number().min(0, 'Base price must be positive'),
    capacity: z.number().min(1, 'Capacity must be at least 1'),
    amenities: z.array(z.string()).optional(),
    images: z.array(z.string()).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  }),
});

export const createRoomSchema = z.object({
  body: z.object({
    roomNumber: z.string().min(1, 'Room number is required'),
    roomType: z.string().min(1, 'Room type is required'),
    floor: z.number().min(1, 'Floor is required'),
    pricePerNight: z.number().min(0, 'Price per night must be positive'),
    capacity: z.number().min(1).optional(),
    amenities: z.array(z.string()).optional(),
    images: z.array(z.string()).optional(),
    description: z.string().optional(),
    bedType: z.string().optional(),
    sizeSqFt: z.number().optional(),
    status: z.enum([
      'AVAILABLE',
      'RESERVED',
      'OCCUPIED',
      'CLEANING',
      'INSPECTION',
      'MAINTENANCE',
      'OUT_OF_SERVICE',
    ]).optional(),
  }),
});

export const updateRoomSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Room identifier is required'),
  }),
  body: z.object({
    roomNumber: z.string().min(1).optional(),
    roomType: z.string().min(1).optional(),
    floor: z.number().min(1).optional(),
    pricePerNight: z.number().min(0).optional(),
    capacity: z.number().min(1).optional(),
    amenities: z.array(z.string()).optional(),
    images: z.array(z.string()).optional(),
    description: z.string().optional(),
    bedType: z.string().optional(),
    sizeSqFt: z.number().optional(),
    status: z.enum([
      'AVAILABLE',
      'RESERVED',
      'OCCUPIED',
      'CLEANING',
      'INSPECTION',
      'MAINTENANCE',
      'OUT_OF_SERVICE',
    ]).optional(),
  }),
});

export const updateRoomStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Room identifier is required'),
  }),
  body: z.object({
    status: z.enum([
      'AVAILABLE',
      'RESERVED',
      'OCCUPIED',
      'CLEANING',
      'INSPECTION',
      'MAINTENANCE',
      'OUT_OF_SERVICE',
    ]),
  }),
});
