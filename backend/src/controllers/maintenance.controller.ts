import { Response, NextFunction } from 'express';
import { MaintenanceIssue } from '../models/MaintenanceIssue.js';
import { Room } from '../models/Room.js';
import { Notification } from '../models/Notification.js';
import { AuditLog } from '../models/AuditLog.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { getPaginationParams } from '../utils/pagination.js';

export const getMaintenanceIssues = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(req, 20);
    const { status, priority, roomId } = req.query;

    const filter: any = {};
    if (status && status !== 'All') {
      filter.status = status;
    }
    if (priority && priority !== 'All') {
      filter.priority = priority;
    }
    if (roomId) {
      filter.room = roomId;
    }

    const [total, issues] = await Promise.all([
      MaintenanceIssue.countDocuments(filter),
      MaintenanceIssue.find(filter)
        .populate({
          path: 'room',
          populate: { path: 'roomType' },
        })
        .populate('assignedTo', 'firstName lastName email role')
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit),
    ]);

    return sendSuccess({
      res,
      message: 'Maintenance issues fetched successfully',
      data: issues,
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

export const getMaintenanceIssueById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const issue = await MaintenanceIssue.findById(req.params.id)
      .populate({
        path: 'room',
        populate: { path: 'roomType' },
      })
      .populate('assignedTo');

    if (!issue) {
      return sendError({
        res,
        statusCode: 404,
        message: 'Maintenance issue not found',
      });
    }

    return sendSuccess({
      res,
      message: 'Maintenance issue details',
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

export const createMaintenanceIssue = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { roomId, title, description, priority, assignedTo, photos } = req.body;

    const room = await Room.findById(roomId);
    if (!room) {
      return sendError({
        res,
        statusCode: 404,
        message: 'Room not found',
      });
    }

    const issue = await MaintenanceIssue.create({
      room: room._id,
      title,
      description: description || '',
      priority: priority || 'MEDIUM',
      assignedTo: assignedTo || null,
      status: assignedTo ? 'ASSIGNED' : 'OPEN',
      photos: photos || [],
    });

    // Update Room status to MAINTENANCE
    room.status = 'MAINTENANCE';
    await room.save();

    await Notification.create({
      title: 'Maintenance Issue Reported',
      message: `${priority || 'MEDIUM'} priority issue "${title}" reported for Room ${room.roomNumber}`,
      type: 'MAINTENANCE',
      relatedId: issue._id.toString(),
    });

    if (req.user) {
      await AuditLog.create({
        user: req.user._id,
        userName: `${req.user.firstName} ${req.user.lastName}`,
        action: 'Reported Maintenance Issue',
        module: 'Maintenance',
        entityId: issue._id.toString(),
        details: `Logged ${priority || 'MEDIUM'} ticket "${title}" for Room ${room.roomNumber}. Room status set to Maintenance.`,
        ipAddress: req.ip,
      });
    }

    await issue.populate(['room', 'assignedTo']);

    return sendSuccess({
      res,
      statusCode: 201,
      message: 'Maintenance issue reported and room moved to Maintenance status',
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMaintenanceIssue = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const issue = await MaintenanceIssue.findById(req.params.id);
    if (!issue) {
      return sendError({
        res,
        statusCode: 404,
        message: 'Maintenance issue not found',
      });
    }

    Object.assign(issue, req.body);
    if (req.body.status === 'FIXED' || req.body.status === 'VERIFIED') {
      issue.resolvedAt = new Date();
    }
    await issue.save();
    await issue.populate(['room', 'assignedTo']);

    // Check if room has any remaining active issues
    const remainingActive = await MaintenanceIssue.findOne({
      room: issue.room,
      status: { $in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS'] },
    });

    if (!remainingActive && (issue.status === 'FIXED' || issue.status === 'VERIFIED')) {
      const room = await Room.findById(issue.room);
      if (room && room.status === 'MAINTENANCE') {
        room.status = 'AVAILABLE';
        await room.save();
      }
    }

    return sendSuccess({
      res,
      message: 'Maintenance issue updated successfully',
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMaintenanceStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const issue = await MaintenanceIssue.findById(req.params.id);
    if (!issue) {
      return sendError({
        res,
        statusCode: 404,
        message: 'Maintenance issue not found',
      });
    }

    issue.status = status;
    if (status === 'FIXED' || status === 'VERIFIED') {
      issue.resolvedAt = new Date();
    }
    await issue.save();

    // Check if room has any remaining open issues
    const remainingActive = await MaintenanceIssue.findOne({
      room: issue.room,
      _id: { $ne: issue._id },
      status: { $in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS'] },
    });

    if (!remainingActive && (status === 'FIXED' || status === 'VERIFIED')) {
      const room = await Room.findById(issue.room);
      if (room && room.status === 'MAINTENANCE') {
        room.status = 'AVAILABLE';
        await room.save();
      }
    }

    await issue.populate(['room', 'assignedTo']);

    return sendSuccess({
      res,
      message: `Maintenance status updated to ${status}`,
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};
