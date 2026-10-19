import { Router } from 'express';
import { processCheckIn } from '../controllers/checkin.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = Router();

router.use(authenticate);
router.post('/', authorize('ADMIN', 'MANAGER', 'RECEPTIONIST'), processCheckIn);

export default router;
