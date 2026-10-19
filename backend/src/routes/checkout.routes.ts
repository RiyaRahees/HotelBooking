import { Router } from 'express';
import { processCheckOut } from '../controllers/checkout.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = Router();

router.use(authenticate);
router.post('/', authorize('ADMIN', 'MANAGER', 'RECEPTIONIST'), processCheckOut);

export default router;
