import { Router } from 'express';
import { login, logout, getMe, refreshSession } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { loginSchema } from '../validations/auth.validation.js';

const router = Router();

router.post('/login', validateRequest(loginSchema), login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.post('/refresh', authenticate, refreshSession);

export default router;
