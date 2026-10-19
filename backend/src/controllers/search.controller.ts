import { Response, NextFunction } from 'express';
import { Guest } from '../models/Guest.js';
import { Room } from '../models/Room.js';
import { Booking } from '../models/Booking.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const globalSearch = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const q = (req.query.q as string)?.trim();

    if (!q) {
      return sendSuccess({
        res,
        message: 'Empty search query',
        data: { guests: [], rooms: [], bookings: [] },
      });
    }

    const regex = new RegExp(q, 'i');

    const [guests, rooms, bookings] = await Promise.all([
      Guest.find({
        $or: [
          { firstName: regex },
          { lastName: regex },
          { phone: regex },
          { email: regex },
          { idNumber: regex },
        ],
      })
        .limit(5)
        .populate('currentBooking'),
      Room.find({
        $or: [{ roomNumber: regex }, { description: regex }],
      })
        .limit(5)
        .populate('roomType')
        .populate('currentGuest'),
      Booking.find({
        $or: [{ bookingId: regex }, { source: regex }],
      })
        .limit(5)
        .populate('guest')
        .populate('room')
        .populate('roomType'),
    ]);

    return sendSuccess({
      res,
      message: 'Global search results',
      data: {
        guests,
        rooms,
        bookings,
      },
    });
  } catch (error) {
    next(error);
  }
};
