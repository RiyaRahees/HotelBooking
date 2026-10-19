import { z } from 'zod';

export const createHousekeepingTaskSchema = z.object({
  body: z.object({
    roomId: z.string().min(1, 'Room ID is required'),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    assignedTo: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const updateHousekeepingTaskSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    assignedTo: z.string().optional(),
    notes: z.string().optional(),
    checklist: z
      .object({
        bedroom: z.boolean().optional(),
        bathroom: z.boolean().optional(),
        towels: z.boolean().optional(),
        toiletries: z.boolean().optional(),
        floor: z.boolean().optional(),
        dustbin: z.boolean().optional(),
        amenities: z.boolean().optional(),
        damage: z.boolean().optional(),
      })
      .optional(),
  }),
});

export const inspectHousekeepingTaskSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    approved: z.boolean(),
    notes: z.string().optional(),
  }),
});
