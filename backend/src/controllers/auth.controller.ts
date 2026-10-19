import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { env } from '../config/env.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { AuditLog } from '../models/AuditLog.js';

const generateToken = (id: string, role: string): string => {
  return jwt.sign({ id, role }, env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return sendError({
        res,
        statusCode: 401,
        message: 'Invalid email or password credentials',
      });
    }

    if (user.status === 'INACTIVE') {
      return sendError({
        res,
        statusCode: 403,
        message: 'Account is deactivated. Please contact your administrator.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError({
        res,
        statusCode: 401,
        message: 'Invalid email or password credentials',
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id.toString(), user.role);

    // Set HTTP-only Cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    await AuditLog.create({
      user: user._id,
      userName: `${user.firstName} ${user.lastName}`,
      action: 'User Login',
      module: 'Authentication',
      details: `${user.firstName} ${user.lastName} (${user.role}) logged in successfully`,
      ipAddress: req.ip,
    });

    const userObj = user.toJSON();

    return sendSuccess({
      res,
      message: 'Login successful',
      data: {
        user: userObj,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    if (req.user) {
      await AuditLog.create({
        user: req.user._id,
        userName: `${req.user.firstName} ${req.user.lastName}`,
        action: 'User Logout',
        module: 'Authentication',
        details: `${req.user.firstName} ${req.user.lastName} logged out`,
        ipAddress: req.ip,
      });
    }

    return sendSuccess({
      res,
      message: 'Logged out successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return sendError({
        res,
        statusCode: 401,
        message: 'Not authenticated',
      });
    }

    return sendSuccess({
      res,
      message: 'Current authenticated user profile',
      data: {
        user: req.user.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return sendError({
        res,
        statusCode: 401,
        message: 'Not authenticated',
      });
    }

    const token = generateToken(req.user._id.toString(), req.user.role);

    res.cookie('token', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return sendSuccess({
      res,
      message: 'Session refreshed successfully',
      data: {
        user: req.user.toJSON(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};
