import { Request } from 'express';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: 1 | -1;
}

export const getPaginationParams = (req: Request, defaultLimit = 10, defaultSort = 'createdAt'): PaginationParams => {
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || defaultLimit));
  const skip = (page - 1) * limit;
  const sortBy = (req.query.sortBy as string) || defaultSort;
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

  return { page, limit, skip, sortBy, sortOrder };
};
