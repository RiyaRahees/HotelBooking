import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware.js';
import { UserRole } from '../models/Role.js';
import { sendError } from '../utils/apiResponse.js';

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError({
        res,
        statusCode: 401,
        message: 'Authentication required before permission verification.',
      });
    }

    if (req.user.role === 'ADMIN' || allowedRoles.includes(req.user.role)) {
      return next();
    }

    return sendError({
      res,
      statusCode: 403,
      message: `Access denied. Role '${req.user.role}' is not authorized to perform this operation.`,
    });
  };
};
