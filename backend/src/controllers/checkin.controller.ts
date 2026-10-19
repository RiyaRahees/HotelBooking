import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { CheckInService } from '../services/checkin.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const processCheckIn = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { bookingId, depositAmount, paymentMethod, keycardsIssued } = req.body;

    if (!bookingId) {
      return sendError({
        res,
        statusCode: 400,
        message: 'bookingId is required for check-in',
      });
    }

    const staffId = req.user?._id.toString();
    const staffName = req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Front Desk';

    const result = await CheckInService.processCheckIn({
      bookingId,
      depositAmount: Number(depositAmount) || 0,
      paymentMethod,
      keycardsIssued: Number(keycardsIssued) || 2,
      staffId,
      staffName,
    });

    return sendSuccess({
      res,
      message: 'Check-in completed successfully. Room is now Occupied.',
      data: result,
    });
  } catch (error: any) {
    return sendError({
      res,
      statusCode: 400,
      message: error.message || 'Check-in processing failed',
    });
  }
};
