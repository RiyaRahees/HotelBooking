import { Router } from 'express';
import {
  getMaintenanceIssues,
  getMaintenanceIssueById,
  createMaintenanceIssue,
  updateMaintenanceIssue,
  updateMaintenanceStatus,
} from '../controllers/maintenance.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', getMaintenanceIssues);
router.get('/:id', getMaintenanceIssueById);
router.post(
  '/',
  authorize('ADMIN', 'MANAGER', 'MAINTENANCE', 'HOUSEKEEPING', 'RECEPTIONIST'),
  createMaintenanceIssue
);
router.patch(
  '/:id',
  authorize('ADMIN', 'MANAGER', 'MAINTENANCE'),
  updateMaintenanceIssue
);
router.patch(
  '/:id/status',
  authorize('ADMIN', 'MANAGER', 'MAINTENANCE'),
  updateMaintenanceStatus
);

export default router;
