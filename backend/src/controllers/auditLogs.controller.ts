import { Response, NextFunction } from 'express';
import { AuditLog } from '../models/AuditLog.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { getPaginationParams } from '../utils/pagination.js';

export const getAuditLogs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(req, 25);
    const { module: mod, search } = req.query;

    const filter: any = {};
    if (mod && mod !== 'All') {
      filter.module = mod;
    }
    if (search) {
      filter.$or = [
        { action: { $regex: search, $options: 'i' } },
        { details: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
      ];
    }

    const [total, logs] = await Promise.all([
      AuditLog.countDocuments(filter),
      AuditLog.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit),
    ]);

    return sendSuccess({
      res,
      message: 'Audit logs retrieved',
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};
