import { z } from 'zod';

export const createPaymentSchema = z.object({
  body: z.object({
    guestId: z.string().min(1, 'Guest ID is required'),
    bookingId: z.string().optional(),
    amount: z.number().min(1, 'Amount must be greater than 0'),
    type: z.enum(['ADVANCE', 'ROOM', 'FOOD', 'LAUNDRY', 'SERVICE', 'REFUND', 'FINAL_PAYMENT', 'OTHER']),
    method: z.enum(['CASH', 'CARD', 'UPI', 'ONLINE']),
    notes: z.string().optional(),
  }),
});
