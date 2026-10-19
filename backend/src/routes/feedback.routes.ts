import { Router } from 'express';
import { getFeedback, createFeedback, replyToFeedback } from '../controllers/feedback.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = Router();

router.get('/', getFeedback);
router.post('/', createFeedback);
router.post('/:id/reply', authenticate, authorize('ADMIN', 'MANAGER'), replyToFeedback);

export default router;
