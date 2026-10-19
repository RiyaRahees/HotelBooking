import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { RoomService } from '../services/room.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { getPaginationParams } from '../utils/pagination.js';

export const getRooms = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const pagination = getPaginationParams(req, 50, 'roomNumber');
    const { status, roomType, floor, capacity, search } = req.query;

    const { rooms, total } = await RoomService.getAllRooms(
      {
        status: status as string,
        roomType: roomType as string,
        floor: floor as string,
        capacity: capacity as string,
        search: search as string,
      },
      pagination
    );

    return sendSuccess({
      res,
      message: 'Rooms fetched successfully',
      data: rooms,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getRoomById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const room = await RoomService.getRoomById(req.params.id);

    if (!room) {
      return sendError({
        res,
        statusCode: 404,
        message: `Room with identifier '${req.params.id}' not found`,
      });
    }

    return sendSuccess({
      res,
      message: 'Room details retrieved successfully',
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

export const createRoom = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id?.toString();
    const userName = req.user ? `${req.user.firstName} ${req.user.lastName}` : undefined;

    const room = await RoomService.createRoom({
      ...req.body,
      userId,
      userName,
      ipAddress: req.ip,
    });

    return sendSuccess({
      res,
      statusCode: 201,
      message: `Room ${room.roomNumber} created successfully`,
      data: room,
    });
  } catch (error: any) {
    return sendError({
      res,
      statusCode: error.message.includes('already in use') ? 409 : 400,
      message: error.message || 'Could not create room',
    });
  }
};

export const updateRoom = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id?.toString();
    const userName = req.user ? `${req.user.firstName} ${req.user.lastName}` : undefined;

    const room = await RoomService.updateRoom(req.params.id, {
      ...req.body,
      userId,
      userName,
      ipAddress: req.ip,
    });

    return sendSuccess({
      res,
      message: `Room ${room.roomNumber} updated successfully`,
      data: room,
    });
  } catch (error: any) {
    return sendError({
      res,
      statusCode: error.message.includes('not found') ? 404 : 400,
      message: error.message || 'Could not update room',
    });
  }
};

export const updateRoomStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const userId = req.user?._id?.toString();
    const userName = req.user ? `${req.user.firstName} ${req.user.lastName}` : undefined;

    const room = await RoomService.updateRoomStatus(
      req.params.id,
      status,
      userId,
      userName,
      req.ip
    );

    return sendSuccess({
      res,
      message: `Room ${room.roomNumber} status updated to ${status}`,
      data: room,
    });
  } catch (error: any) {
    return sendError({
      res,
      statusCode: error.message.includes('not found') ? 404 : 400,
      message: error.message || 'Could not update room status',
    });
  }
};

export const deleteRoom = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id?.toString();
    const userName = req.user ? `${req.user.firstName} ${req.user.lastName}` : undefined;

    const result = await RoomService.deleteRoom(req.params.id, userId, userName, req.ip);

    return sendSuccess({
      res,
      message: result.message,
      data: null,
    });
  } catch (error: any) {
    return sendError({
      res,
      statusCode: error.message.includes('not found') ? 404 : 400,
      message: error.message || 'Could not delete room',
    });
  }
};
