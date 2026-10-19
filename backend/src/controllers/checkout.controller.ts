import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { CheckOutService } from '../services/checkout.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const processCheckOut = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { bookingId, additionalCharges, discount, paymentMethod, notes } = req.body;

    if (!bookingId) {
      return sendError({
        res,
        statusCode: 400,
        message: 'bookingId is required for check-out',
      });
    }

    const staffId = req.user?._id.toString();
    const staffName = req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Front Desk';

    const result = await CheckOutService.processCheckOut({
      bookingId,
      additionalCharges,
      discount,
      paymentMethod,
      notes,
      staffId,
      staffName,
    });

    return sendSuccess({
      res,
      message: 'Checkout completed. Room assigned to housekeeping.',
      data: result,
    });
  } catch (error: any) {
    return sendError({
      res,
      statusCode: 400,
      message: error.message || 'Check-out processing failed',
    });
  }
};
