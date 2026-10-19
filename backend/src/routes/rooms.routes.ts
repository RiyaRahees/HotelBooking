import { Router } from 'express';
import {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  updateRoomStatus,
  deleteRoom,
} from '../controllers/rooms.controller.js';
import { optionalAuth } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import {
  createRoomSchema,
  updateRoomSchema,
  updateRoomStatusSchema,
} from '../validations/room.validation.js';

const router = Router();

// Public / Authenticated read routes
router.get('/', optionalAuth, getRooms);
router.get('/:id', optionalAuth, getRoomById);

// Protected room management routes
router.post(
  '/',
  optionalAuth,
  validateRequest(createRoomSchema),
  createRoom
);

router.put(
  '/:id',
  optionalAuth,
  validateRequest(updateRoomSchema),
  updateRoom
);

router.patch(
  '/:id',
  optionalAuth,
  validateRequest(updateRoomSchema),
  updateRoom
);

router.patch(
  '/:id/status',
  optionalAuth,
  validateRequest(updateRoomStatusSchema),
  updateRoomStatus
);

router.delete(
  '/:id',
  optionalAuth,
  deleteRoom
);

export default router;
