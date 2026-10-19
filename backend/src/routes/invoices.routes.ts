import { Router } from 'express';
import { getInvoices, getInvoiceById, getInvoiceByBooking } from '../controllers/invoices.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize('ADMIN', 'MANAGER', 'ACCOUNTANT', 'RECEPTIONIST'), getInvoices);
router.get('/:id', authorize('ADMIN', 'MANAGER', 'ACCOUNTANT', 'RECEPTIONIST'), getInvoiceById);
router.get('/booking/:bookingId', authorize('ADMIN', 'MANAGER', 'ACCOUNTANT', 'RECEPTIONIST'), getInvoiceByBooking);

export default router;
