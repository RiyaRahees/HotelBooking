import { Response, NextFunction } from 'express';
import { Payment } from '../models/Payment.js';
import { Booking } from '../models/Booking.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { getPaginationParams } from '../utils/pagination.js';
import { AuditLog } from '../models/AuditLog.js';

export const getPayments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(req, 20);
    const { status, method, type, guestId, bookingId, search } = req.query;

    const filter: any = {};
    if (status && status !== 'All') {
      filter.status = status;
    }
    if (method && method !== 'All') {
      filter.method = method;
    }
    if (type && type !== 'All') {
      filter.type = type;
    }
    if (guestId) {
      filter.guest = guestId;
    }
    if (bookingId) {
      filter.booking = bookingId;
    }
    if (search) {
      filter.$or = [
        { paymentId: { $regex: search, $options: 'i' } },
        { transactionId: { $regex: search, $options: 'i' } },
      ];
    }

    const [total, payments] = await Promise.all([
      Payment.countDocuments(filter),
      Payment.find(filter)
        .populate('guest')
        .populate({
          path: 'booking',
          populate: { path: 'room' },
        })
        .populate('receivedBy', 'firstName lastName email role')
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit),
    ]);

    return sendSuccess({
      res,
      message: 'Payments fetched successfully',
      data: payments,
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

export const getPaymentById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('guest')
      .populate({
        path: 'booking',
        populate: { path: 'room' },
      })
      .populate('receivedBy');

    if (!payment) {
      return sendError({
        res,
        statusCode: 404,
        message: 'Payment not found',
      });
    }

    return sendSuccess({
      res,
      message: 'Payment details retrieved',
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

export const createPayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { guestId, bookingId, amount, type, method, notes } = req.body;

    const paymentId = `PAY-${Date.now()}`;
    const transactionId = `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const payment = await Payment.create({
      paymentId,
      guest: guestId,
      booking: bookingId || null,
      amount,
      type: type || 'ROOM',
      method,
      status: 'PAID',
      transactionId,
      notes: notes || '',
      receivedBy: req.user?._id as any,
    });

    // If linked to a booking, update booking paid/balance
    if (bookingId) {
      const booking = await Booking.findById(bookingId);
      if (booking) {
        booking.paidAmount += amount;
        booking.balanceAmount = Math.max(0, booking.totalAmount - booking.paidAmount);
        booking.paymentStatus = booking.balanceAmount === 0 ? 'PAID' : 'PARTIALLY_PAID';
        await booking.save();
      }
    }

    if (req.user) {
      await AuditLog.create({
        user: req.user._id,
        userName: `${req.user.firstName} ${req.user.lastName}`,
        action: 'Recorded Payment',
        module: 'Payments',
        entityId: payment._id.toString(),
        details: `Recorded ₹${amount.toLocaleString()} received via ${method}`,
        ipAddress: req.ip,
      });
    }

    await payment.populate(['guest', 'booking']);

    return sendSuccess({
      res,
      statusCode: 201,
      message: 'Payment recorded successfully',
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};
