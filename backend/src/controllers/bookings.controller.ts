import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { getPaginationParams } from '../utils/pagination.js';
import { BookingService } from '../services/booking.service.js';

export const getBookings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const pagination = getPaginationParams(req, 50, 'createdAt');
    const { status, paymentStatus, guestId, roomId, search, startDate, endDate } = req.query;

    const { bookings, total } = await BookingService.getAllBookings(
      {
        status: status as string,
        paymentStatus: paymentStatus as string,
        guestId: guestId as string,
        roomId: roomId as string,
        search: search as string,
        startDate: startDate as string,
        endDate: endDate as string,
      },
      pagination
    );

    return sendSuccess({
      res,
      message: 'Bookings fetched successfully',
      data: bookings,
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

export const getAvailableRooms = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { checkInDate, checkOutDate, roomType } = req.query;
    if (!checkInDate || !checkOutDate) {
      return sendError({
        res,
        statusCode: 400,
        message: 'Both checkInDate and checkOutDate are required to check room availability',
      });
    }

    const rooms = await BookingService.getAvailableRooms(
      checkInDate as string,
      checkOutDate as string,
      roomType as string
    );

    return sendSuccess({
      res,
      message: 'Available rooms fetched successfully',
      data: rooms,
    });
  } catch (error: any) {
    return sendError({
      res,
      statusCode: 400,
      message: error.message || 'Error checking room availability',
    });
  }
};

export const getBookingById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const booking = await BookingService.getBookingById(req.params.id);

    if (!booking) {
      return sendError({
        res,
        statusCode: 404,
        message: `Booking with identifier '${req.params.id}' not found`,
      });
    }

    return sendSuccess({
      res,
      message: 'Booking details retrieved successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const createBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id?.toString();
    const userName = req.user ? `${req.user.firstName} ${req.user.lastName}` : undefined;

    const booking = await BookingService.createBooking({
      ...req.body,
      userId,
      userName,
      ipAddress: req.ip,
    });

    return sendSuccess({
      res,
      statusCode: 201,
      message: `Reservation ${booking.bookingId} created successfully`,
      data: booking,
    });
  } catch (error: any) {
    return sendError({
      res,
      statusCode: error.message.includes('already booked') ? 409 : 400,
      message: error.message || 'Could not create booking',
    });
  }
};

export const updateBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id?.toString();
    const userName = req.user ? `${req.user.firstName} ${req.user.lastName}` : undefined;

    const booking = await BookingService.updateBooking(
      req.params.id,
      req.body,
      userId,
      userName,
      req.ip
    );

    return sendSuccess({
      res,
      message: `Booking ${booking.bookingId} updated successfully`,
      data: booking,
    });
  } catch (error: any) {
    return sendError({
      res,
      statusCode: error.message.includes('not found') ? 404 : 400,
      message: error.message || 'Could not update booking',
    });
  }
};

export const updateBookingStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const userId = req.user?._id?.toString();
    const userName = req.user ? `${req.user.firstName} ${req.user.lastName}` : undefined;

    const booking = await BookingService.updateBookingStatus(
      req.params.id,
      status,
      userId,
      userName,
      req.ip
    );

    return sendSuccess({
      res,
      message: `Booking ${booking.bookingId} status updated to ${status}`,
      data: booking,
    });
  } catch (error: any) {
    return sendError({
      res,
      statusCode: error.message.includes('not found') ? 404 : 400,
      message: error.message || 'Could not update booking status',
    });
  }
};

export const checkInBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id?.toString();
    const userName = req.user ? `${req.user.firstName} ${req.user.lastName}` : undefined;

    const booking = await BookingService.checkInBooking(
      req.params.id,
      req.body,
      userId,
      userName,
      req.ip
    );

    return sendSuccess({
      res,
      message: `Guest checked into Room successfully for booking ${booking.bookingId}`,
      data: booking,
    });
  } catch (error: any) {
    return sendError({
      res,
      statusCode: error.message.includes('not found') ? 404 : 400,
      message: error.message || 'Check-in failed',
    });
  }
};

export const checkOutBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id?.toString();
    const userName = req.user ? `${req.user.firstName} ${req.user.lastName}` : undefined;

    const booking = await BookingService.checkOutBooking(
      req.params.id,
      req.body,
      userId,
      userName,
      req.ip
    );

    return sendSuccess({
      res,
      message: `Guest checked out successfully for booking ${booking.bookingId}`,
      data: booking,
    });
  } catch (error: any) {
    return sendError({
      res,
      statusCode: error.message.includes('not found') ? 404 : 400,
      message: error.message || 'Check-out failed',
    });
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id?.toString();
    const userName = req.user ? `${req.user.firstName} ${req.user.lastName}` : undefined;

    const booking = await BookingService.cancelBooking(req.params.id, userId, userName, req.ip);

    return sendSuccess({
      res,
      message: `Reservation ${booking.bookingId} cancelled successfully and room released`,
      data: booking,
    });
  } catch (error: any) {
    return sendError({
      res,
      statusCode: error.message.includes('not found') ? 404 : 400,
      message: error.message || 'Could not cancel booking',
    });
  }
};

export const deleteBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id?.toString();
    const userName = req.user ? `${req.user.firstName} ${req.user.lastName}` : undefined;

    const result = await BookingService.deleteBooking(req.params.id, userId, userName, req.ip);

    return sendSuccess({
      res,
      message: result.message,
      data: null,
    });
  } catch (error: any) {
    return sendError({
      res,
      statusCode: error.message.includes('not found') ? 404 : 400,
      message: error.message || 'Could not delete booking',
    });
  }
};

