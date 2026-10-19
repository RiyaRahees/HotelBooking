import { z } from 'zod';

export const createBookingSchema = z.object({
  body: z.object({
    guestId: z.string().optional(),
    newGuest: z
      .object({
        firstName: z.string().min(1, 'First name is required'),
        lastName: z.string().min(1, 'Last name is required'),
        phone: z.string().min(1, 'Phone number is required'),
        email: z.string().email().optional(),
        address: z.string().optional(),
        idType: z.enum(['Passport', 'Driving License', 'National ID', 'Aadhaar']).optional(),
        idNumber: z.string().optional(),
      })
      .optional(),
    guestName: z.string().optional(),
    guestPhone: z.string().optional(),
    guestEmail: z.string().optional(),
    roomId: z.string().min(1, 'Room ID is required'),
    checkInDate: z.string().min(1, 'Check-in date is required'),
    checkOutDate: z.string().min(1, 'Check-out date is required'),
    adults: z.number().min(1, 'At least 1 adult is required').default(1),
    children: z.number().min(0).default(0),
    specialRequests: z.string().optional(),
    notes: z.string().optional(),
    discount: z.number().min(0).default(0),
    advanceAmount: z.number().min(0).default(0),
    source: z.string().optional(),
    paymentMethod: z.enum(['CASH', 'CARD', 'UPI', 'ONLINE', 'Cash', 'Card', 'UPI', 'Online', 'Bank Transfer']).optional(),
  }),
});

export const updateBookingStatusSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    status: z.enum([
      'PENDING',
      'CONFIRMED',
      'CHECKED_IN',
      'CHECKED_OUT',
      'CANCELLED',
      'NO_SHOW',
    ]),
  }),
});

