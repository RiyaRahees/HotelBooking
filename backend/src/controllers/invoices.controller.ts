import { Response, NextFunction } from 'express';
import { Invoice } from '../models/Invoice.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { getPaginationParams } from '../utils/pagination.js';

export const getInvoices = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(req, 20);
    const { guestId, bookingId, search } = req.query;

    const filter: any = {};
    if (guestId) filter.guest = guestId;
    if (bookingId) filter.booking = bookingId;
    if (search) {
      filter.invoiceNumber = { $regex: search, $options: 'i' };
    }

    const [total, invoices] = await Promise.all([
      Invoice.countDocuments(filter),
      Invoice.find(filter)
        .populate('guest')
        .populate('room')
        .populate('booking')
        .populate('issuedBy', 'firstName lastName email role')
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit),
    ]);

    return sendSuccess({
      res,
      message: 'Invoices retrieved successfully',
      data: invoices,
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

export const getInvoiceById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('guest')
      .populate('room')
      .populate('booking')
      .populate('issuedBy');

    if (!invoice) {
      return sendError({
        res,
        statusCode: 404,
        message: 'Invoice not found',
      });
    }

    return sendSuccess({
      res,
      message: 'Invoice details',
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

export const getInvoiceByBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const invoice = await Invoice.findOne({ booking: req.params.bookingId })
      .populate('guest')
      .populate('room')
      .populate('booking')
      .populate('issuedBy');

    if (!invoice) {
      return sendError({
        res,
        statusCode: 404,
        message: 'Invoice not found for this booking',
      });
    }

    return sendSuccess({
      res,
      message: 'Invoice details for booking',
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};
