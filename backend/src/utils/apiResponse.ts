import { Response } from 'express';

export interface ApiResponseOptions<T = any> {
  res: Response;
  statusCode?: number;
  message?: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiErrorOptions {
  res: Response;
  statusCode?: number;
  message?: string;
  errors?: any[];
}

export const sendSuccess = <T>({
  res,
  statusCode = 200,
  message = 'Operation successful',
  data,
  pagination,
}: ApiResponseOptions<T>) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(pagination && { pagination }),
  });
};

export const sendError = ({
  res,
  statusCode = 500,
  message = 'Internal Server Error',
  errors = [],
}: ApiErrorOptions) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
