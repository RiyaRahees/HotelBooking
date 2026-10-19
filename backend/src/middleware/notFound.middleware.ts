import { Request, Response } from 'express';
import { sendError } from '../utils/apiResponse.js';

export const notFoundHandler = (req: Request, res: Response) => {
  return sendError({
    res,
    statusCode: 404,
    message: `API Route ${req.method} ${req.originalUrl} not found`,
  });
};
