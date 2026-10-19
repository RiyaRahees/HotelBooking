import { Router } from 'express';
import { getAuditLogs } from '../controllers/auditLogs.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = Router();

router.use(authenticate);
router.get('/', authorize('ADMIN', 'MANAGER'), getAuditLogs);

export default router;
