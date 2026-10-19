import { Router } from 'express';
import {
  getOccupancyReport,
  getRevenueReport,
  getBookingsReport,
  getHousekeepingReport,
  getMaintenanceReport,
  getFeedbackReport,
} from '../controllers/reports.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/occupancy', authorize('ADMIN', 'MANAGER'), getOccupancyReport);
router.get('/revenue', authorize('ADMIN', 'MANAGER', 'ACCOUNTANT'), getRevenueReport);
router.get('/bookings', authorize('ADMIN', 'MANAGER', 'RECEPTIONIST'), getBookingsReport);
router.get('/housekeeping', authorize('ADMIN', 'MANAGER', 'HOUSEKEEPING'), getHousekeepingReport);
router.get('/maintenance', authorize('ADMIN', 'MANAGER', 'MAINTENANCE'), getMaintenanceReport);
router.get('/feedback', authorize('ADMIN', 'MANAGER'), getFeedbackReport);

export default router;
