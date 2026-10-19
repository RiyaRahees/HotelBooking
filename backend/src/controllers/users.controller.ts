import { Response, NextFunction } from 'express';
import { User } from '../models/User.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { getPaginationParams } from '../utils/pagination.js';
import { AuditLog } from '../models/AuditLog.js';

export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(req, 20);
    const { role, status, search } = req.query;

    const filter: any = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const [total, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit),
    ]);

    return sendSuccess({
      res,
      message: 'Staff users fetched successfully',
      data: users.map((u) => u.toJSON()),
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

export const getUserById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError({
        res,
        statusCode: 404,
        message: 'Staff user not found',
      });
    }

    return sendSuccess({
      res,
      message: 'Staff user details',
      data: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const existing = await User.findOne({ email: req.body.email.toLowerCase() });
    if (existing) {
      return sendError({
        res,
        statusCode: 409,
        message: `A staff member with email '${req.body.email}' already exists.`,
      });
    }

    const newUser = await User.create(req.body);

    if (req.user) {
      await AuditLog.create({
        user: req.user._id,
        userName: `${req.user.firstName} ${req.user.lastName}`,
        action: 'Created Staff User',
        module: 'Staff',
        entityId: newUser._id.toString(),
        details: `Created new staff account for ${newUser.firstName} ${newUser.lastName} (${newUser.role})`,
        ipAddress: req.ip,
      });
    }

    return sendSuccess({
      res,
      statusCode: 201,
      message: 'Staff user created successfully',
      data: newUser.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError({
        res,
        statusCode: 404,
        message: 'Staff user not found',
      });
    }

    Object.assign(user, req.body);
    await user.save();

    if (req.user) {
      await AuditLog.create({
        user: req.user._id,
        userName: `${req.user.firstName} ${req.user.lastName}`,
        action: 'Updated Staff User',
        module: 'Staff',
        entityId: user._id.toString(),
        details: `Updated details for ${user.firstName} ${user.lastName}`,
        ipAddress: req.ip,
      });
    }

    return sendSuccess({
      res,
      message: 'Staff user updated successfully',
      data: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError({
        res,
        statusCode: 404,
        message: 'Staff user not found',
      });
    }

    // Soft delete / deactivate
    user.status = 'INACTIVE';
    await user.save();

    if (req.user) {
      await AuditLog.create({
        user: req.user._id,
        userName: `${req.user.firstName} ${req.user.lastName}`,
        action: 'Deactivated Staff User',
        module: 'Staff',
        entityId: user._id.toString(),
        details: `Deactivated staff account for ${user.firstName} ${user.lastName}`,
        ipAddress: req.ip,
      });
    }

    return sendSuccess({
      res,
      message: 'Staff user deactivated successfully',
      data: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};
