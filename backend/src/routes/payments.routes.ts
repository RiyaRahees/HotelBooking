import { Router } from 'express';
import { getPayments, getPaymentById, createPayment } from '../controllers/payments.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { createPaymentSchema } from '../validations/payment.validation.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize('ADMIN', 'MANAGER', 'ACCOUNTANT', 'RECEPTIONIST'), getPayments);
router.get('/:id', authorize('ADMIN', 'MANAGER', 'ACCOUNTANT', 'RECEPTIONIST'), getPaymentById);
router.post(
  '/',
  authorize('ADMIN', 'MANAGER', 'ACCOUNTANT', 'RECEPTIONIST'),
  validateRequest(createPaymentSchema),
  createPayment
);

export default router;
