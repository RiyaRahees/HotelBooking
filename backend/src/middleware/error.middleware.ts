import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { sendError } from '../utils/apiResponse.js';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('[Error Occurred]:', err);

  // Zod Validation Error
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return sendError({
      res,
      statusCode: 400,
      message: 'Validation failed',
      errors: formattedErrors,
    });
  }

  // Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    return sendError({
      res,
      statusCode: 400,
      message: `Invalid identifier format for ${err.path}: ${err.value}`,
    });
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'Field';
    return sendError({
      res,
      statusCode: 409,
      message: `${field} already exists with value '${err.keyValue[field]}'`,
    });
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return sendError({
      res,
      statusCode: 401,
      message: 'Invalid authentication token',
    });
  }
  if (err.name === 'TokenExpiredError') {
    return sendError({
      res,
      statusCode: 401,
      message: 'Authentication token has expired. Please login again.',
    });
  }

  // Custom HTTP status error
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  return sendError({
    res,
    statusCode,
    message,
    errors: err.errors || [],
  });
};
