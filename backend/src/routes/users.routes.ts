import { Router } from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/users.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { registerUserSchema, updateUserSchema } from '../validations/auth.validation.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize('ADMIN', 'MANAGER'), getUsers);
router.get('/:id', authorize('ADMIN', 'MANAGER'), getUserById);
router.post('/', authorize('ADMIN', 'MANAGER'), validateRequest(registerUserSchema), createUser);
router.patch('/:id', authorize('ADMIN', 'MANAGER'), validateRequest(updateUserSchema), updateUser);
router.delete('/:id', authorize('ADMIN'), deleteUser);

export default router;
