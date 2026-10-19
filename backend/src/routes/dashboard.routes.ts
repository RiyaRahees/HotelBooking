import { Router } from 'express';
import { getDashboardData } from '../controllers/dashboard.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);
router.get('/', getDashboardData);

export default router;
