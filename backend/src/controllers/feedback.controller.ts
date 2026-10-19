import { Response, NextFunction } from 'express';
import { Feedback } from '../models/Feedback.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { getPaginationParams } from '../utils/pagination.js';

export const getFeedback = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(req, 20);
    const { rating, guestId } = req.query;

    const filter: any = {};
    if (rating && rating !== 'All') {
      filter.overallRating = parseInt(rating as string, 10);
    }
    if (guestId) filter.guest = guestId;

    const [total, feedbacks] = await Promise.all([
      Feedback.countDocuments(filter),
      Feedback.find(filter)
        .populate('guest')
        .populate('room')
        .populate('booking')
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit),
    ]);

    return sendSuccess({
      res,
      message: 'Feedback fetched successfully',
      data: feedbacks,
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

export const createFeedback = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const feedback = await Feedback.create(req.body);
    await feedback.populate(['guest', 'room']);
    return sendSuccess({
      res,
      statusCode: 201,
      message: 'Feedback submitted successfully',
      data: feedback,
    });
  } catch (error) {
    next(error);
  }
};

export const replyToFeedback = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return sendError({
        res,
        statusCode: 404,
        message: 'Feedback not found',
      });
    }

    feedback.reply = {
      message: req.body.message,
      repliedBy: req.user?._id as any,
      repliedAt: new Date(),
    };
    await feedback.save();
    await feedback.populate(['guest', 'room']);

    return sendSuccess({
      res,
      message: 'Official response posted successfully',
      data: feedback,
    });
  } catch (error) {
    next(error);
  }
};
