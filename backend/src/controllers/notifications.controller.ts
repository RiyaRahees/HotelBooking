import { Response, NextFunction } from 'express';
import { Notification } from '../models/Notification.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const notifications = await Notification.find({
      $or: [{ recipient: req.user?._id }, { recipient: null }],
    })
      .sort({ createdAt: -1 })
      .limit(30);

    return sendSuccess({
      res,
      message: 'Notifications fetched',
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return sendError({
        res,
        statusCode: 404,
        message: 'Notification not found',
      });
    }

    return sendSuccess({
      res,
      message: 'Notification marked as read',
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await Notification.updateMany(
      { $or: [{ recipient: req.user?._id }, { recipient: null }] },
      { isRead: true }
    );

    return sendSuccess({
      res,
      message: 'All notifications marked as read',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
