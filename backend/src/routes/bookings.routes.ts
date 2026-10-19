import { Router } from 'express';
import {
  getBookings,
  getAvailableRooms,
  getBookingById,
  createBooking,
  updateBooking,
  updateBookingStatus,
  checkInBooking,
  checkOutBooking,
  cancelBooking,
  deleteBooking,
} from '../controllers/bookings.controller.js';
import { optionalAuth } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { createBookingSchema, updateBookingStatusSchema } from '../validations/booking.validation.js';

const router = Router();

// Public / Authenticated read routes
router.get('/', optionalAuth, getBookings);
router.get('/available-rooms', optionalAuth, getAvailableRooms);
router.get('/:id', optionalAuth, getBookingById);

// Booking management routes
router.post(
  '/',
  optionalAuth,
  validateRequest(createBookingSchema),
  createBooking
);

router.put(
  '/:id',
  optionalAuth,
  updateBooking
);

router.patch(
  '/:id',
  optionalAuth,
  updateBooking
);

router.patch(
  '/:id/status',
  optionalAuth,
  validateRequest(updateBookingStatusSchema),
  updateBookingStatus
);

router.patch(
  '/:id/check-in',
  optionalAuth,
  checkInBooking
);

router.patch(
  '/:id/check-out',
  optionalAuth,
  checkOutBooking
);

router.patch(
  '/:id/cancel',
  optionalAuth,
  cancelBooking
);

router.delete(
  '/:id',
  optionalAuth,
  deleteBooking
);

export default router;

