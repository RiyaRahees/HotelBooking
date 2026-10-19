import { Response, NextFunction } from 'express';
import { Guest } from '../models/Guest.js';
import { Booking } from '../models/Booking.js';
import { Payment } from '../models/Payment.js';
import { Feedback } from '../models/Feedback.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { getPaginationParams } from '../utils/pagination.js';
import { AuditLog } from '../models/AuditLog.js';

export const getGuests = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(req, 20);
    const { search, vip } = req.query;

    const filter: any = {};
    if (vip === 'true') filter.vip = true;
    if (vip === 'false') filter.vip = false;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { idNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const [total, guests] = await Promise.all([
      Guest.countDocuments(filter),
      Guest.find(filter)
        .populate({
          path: 'currentBooking',
          populate: { path: 'room' },
        })
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit),
    ]);

    // Calculate aggregated stats for each guest
    const guestData = await Promise.all(
      guests.map(async (guest) => {
        const [bookingsCount, paymentsAgg] = await Promise.all([
          Booking.countDocuments({ guest: guest._id }),
          Payment.aggregate([
            { $match: { guest: guest._id, status: 'PAID' } },
            { $group: { _id: null, totalSpent: { $sum: '$amount' } } },
          ]),
        ]);

        const gObj = guest.toJSON();
        return {
          ...gObj,
          totalStays: bookingsCount,
          totalSpent: paymentsAgg[0]?.totalSpent || 0,
        };
      })
    );

    return sendSuccess({
      res,
      message: 'Guests fetched successfully',
      data: guestData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getGuestById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const guest = await Guest.findById(req.params.id);
    if (!guest) {
      return sendError({
        res,
        statusCode: 404,
        message: 'Guest record not found',
      });
    }

    const [bookings, payments, feedbacks] = await Promise.all([
      Booking.find({ guest: guest._id })
        .populate('room')
        .populate('roomType')
        .sort({ createdAt: -1 }),
      Payment.find({ guest: guest._id }).sort({ createdAt: -1 }),
      Feedback.find({ guest: guest._id }).populate('room').sort({ createdAt: -1 }),
    ]);

    const activeBooking = bookings.find((b) => b.bookingStatus === 'CHECKED_IN');
    const pastBookings = bookings.filter((b) => b.bookingStatus === 'CHECKED_OUT');
    const totalSpent = payments
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + p.amount, 0);

    const guestObj = guest.toJSON();

    return sendSuccess({
      res,
      message: 'Guest profile retrieved successfully',
      data: {
        ...guestObj,
        totalStays: bookings.length,
        totalSpent,
        activeBooking,
        bookings,
        pastBookings,
        payments,
        feedbacks,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createGuest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const existing = await Guest.findOne({
      $or: [{ email: req.body.email.toLowerCase() }, { phone: req.body.phone }],
    });

    if (existing) {
      return sendError({
        res,
        statusCode: 409,
        message: 'A guest with this email or phone number is already registered',
      });
    }

    const guest = await Guest.create(req.body);

    if (req.user) {
      await AuditLog.create({
        user: req.user._id,
        userName: `${req.user.firstName} ${req.user.lastName}`,
        action: 'Registered Guest',
        module: 'Guests',
        entityId: guest._id.toString(),
        details: `Registered guest ${guest.firstName} ${guest.lastName} (${guest.email})`,
        ipAddress: req.ip,
      });
    }

    return sendSuccess({
      res,
      statusCode: 201,
      message: 'Guest registered successfully',
      data: guest.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

export const updateGuest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const guest = await Guest.findById(req.params.id);
    if (!guest) {
      return sendError({
        res,
        statusCode: 404,
        message: 'Guest record not found',
      });
    }

    Object.assign(guest, req.body);
    await guest.save();

    if (req.user) {
      await AuditLog.create({
        user: req.user._id,
        userName: `${req.user.firstName} ${req.user.lastName}`,
        action: 'Updated Guest',
        module: 'Guests',
        entityId: guest._id.toString(),
        details: `Updated guest details for ${guest.firstName} ${guest.lastName}`,
        ipAddress: req.ip,
      });
    }

    return sendSuccess({
      res,
      message: 'Guest record updated successfully',
      data: guest.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteGuest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const guest = await Guest.findById(req.params.id);
    if (!guest) {
      return sendError({
        res,
        statusCode: 404,
        message: 'Guest record not found',
      });
    }

    const activeBooking = await Booking.findOne({
      guest: guest._id,
      bookingStatus: { $in: ['CONFIRMED', 'CHECKED_IN'] },
    });

    if (activeBooking) {
      return sendError({
        res,
        statusCode: 400,
        message: 'Cannot remove a guest profile with active or confirmed reservations.',
      });
    }

    await Guest.findByIdAndDelete(req.params.id);

    return sendSuccess({
      res,
      message: `Guest ${guest.firstName} ${guest.lastName} removed successfully`,
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
