import { Router } from 'express';
import {
  getHousekeepingTasks,
  getHousekeepingTaskById,
  createHousekeepingTask,
  updateHousekeepingTask,
  updateHousekeepingStatus,
  inspectRoom,
} from '../controllers/housekeeping.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import {
  createHousekeepingTaskSchema,
  updateHousekeepingTaskSchema,
  inspectHousekeepingTaskSchema,
} from '../validations/housekeeping.validation.js';

const router = Router();

router.use(authenticate);

router.get('/', getHousekeepingTasks);
router.get('/:id', getHousekeepingTaskById);
router.post(
  '/',
  authorize('ADMIN', 'MANAGER', 'HOUSEKEEPING', 'RECEPTIONIST'),
  validateRequest(createHousekeepingTaskSchema),
  createHousekeepingTask
);
router.patch(
  '/:id',
  authorize('ADMIN', 'MANAGER', 'HOUSEKEEPING'),
  validateRequest(updateHousekeepingTaskSchema),
  updateHousekeepingTask
);
router.patch(
  '/:id/status',
  authorize('ADMIN', 'MANAGER', 'HOUSEKEEPING'),
  updateHousekeepingStatus
);
router.post(
  '/:id/inspect',
  authorize('ADMIN', 'MANAGER'),
  validateRequest(inspectHousekeepingTaskSchema),
  inspectRoom
);

export default router;
