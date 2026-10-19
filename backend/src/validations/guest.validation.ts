import { z } from 'zod';

export const createGuestSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().min(6, 'Valid phone number is required'),
    email: z.string().email('Valid email address is required'),
    dateOfBirth: z.string().optional(),
    address: z.string().optional(),
    nationality: z.string().optional(),
    idType: z.enum(['Passport', 'Driving License', 'National ID', 'Aadhaar']).optional(),
    idNumber: z.string().min(1, 'ID number is required'),
    emergencyContact: z
      .object({
        name: z.string().optional(),
        phone: z.string().optional(),
        relationship: z.string().optional(),
      })
      .optional(),
    notes: z.string().optional(),
    vip: z.boolean().optional(),
    avatar: z.string().optional(),
  }),
});

export const updateGuestSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    phone: z.string().min(6).optional(),
    email: z.string().email().optional(),
    dateOfBirth: z.string().optional(),
    address: z.string().optional(),
    nationality: z.string().optional(),
    idType: z.enum(['Passport', 'Driving License', 'National ID', 'Aadhaar']).optional(),
    idNumber: z.string().optional(),
    notes: z.string().optional(),
    vip: z.boolean().optional(),
    avatar: z.string().optional(),
  }),
});
