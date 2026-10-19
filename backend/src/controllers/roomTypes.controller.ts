import { Request, Response, NextFunction } from 'express';
import { RoomType } from '../models/RoomType.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getRoomTypes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roomTypes = await RoomType.find({ status: 'ACTIVE' });
    return sendSuccess({
      res,
      message: 'Room types fetched successfully',
      data: roomTypes,
    });
  } catch (error) {
    next(error);
  }
};

export const createRoomType = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roomType = await RoomType.create(req.body);
    return sendSuccess({
      res,
      statusCode: 201,
      message: 'Room type created successfully',
      data: roomType,
    });
  } catch (error) {
    next(error);
  }
};
