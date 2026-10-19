import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User, IUser } from '../models/User.js';
import { sendError } from '../utils/apiResponse.js';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined = req.cookies?.token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendError({
        res,
        statusCode: 401,
        message: 'Authentication required. Please login to access this resource.',
      });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string; role: string };
    const user = await User.findById(decoded.id).select('+password');

    if (!user) {
      return sendError({
        res,
        statusCode: 401,
        message: 'User belonging to this token no longer exists.',
      });
    }

    if (user.status === 'INACTIVE') {
      return sendError({
        res,
        statusCode: 403,
        message: 'User account is currently deactivated. Please contact your administrator.',
      });
    }

    req.user = user;
    next();
  } catch (error: any) {
    return sendError({
      res,
      statusCode: 401,
      message: 'Invalid or expired authentication token',
    });
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined = req.cookies?.token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string; role: string };
      const user = await User.findById(decoded.id);
      if (user && user.status !== 'INACTIVE') {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    next();
  }
};
