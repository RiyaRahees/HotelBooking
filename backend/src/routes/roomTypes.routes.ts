import { Router } from 'express';
import { getRoomTypes, createRoomType } from '../controllers/roomTypes.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { createRoomTypeSchema } from '../validations/room.validation.js';

const router = Router();

router.get('/', getRoomTypes);
router.post('/', authenticate, authorize('ADMIN', 'MANAGER'), validateRequest(createRoomTypeSchema), createRoomType);

export default router;
