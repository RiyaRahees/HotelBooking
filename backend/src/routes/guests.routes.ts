import { Router } from 'express';
import {
  getGuests,
  getGuestById,
  createGuest,
  updateGuest,
  deleteGuest,
} from '../controllers/guests.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { createGuestSchema, updateGuestSchema } from '../validations/guest.validation.js';

const router = Router();

router.get('/', getGuests);
router.get('/:id', getGuestById);
router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'MANAGER', 'RECEPTIONIST'),
  validateRequest(createGuestSchema),
  createGuest
);
router.patch(
  '/:id',
  authenticate,
  authorize('ADMIN', 'MANAGER', 'RECEPTIONIST'),
  validateRequest(updateGuestSchema),
  updateGuest
);
router.delete('/:id', authenticate, authorize('ADMIN', 'MANAGER'), deleteGuest);

export default router;
