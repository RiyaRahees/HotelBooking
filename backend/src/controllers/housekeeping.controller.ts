import { Response, NextFunction } from 'express';
import { HousekeepingTask } from '../models/HousekeepingTask.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { getPaginationParams } from '../utils/pagination.js';
import { HousekeepingService } from '../services/housekeeping.service.js';

export const getHousekeepingTasks = async (req: AuthRequest, res: Response, next: NextFunction) => {
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

    const [total, tasks] = await Promise.all([
      HousekeepingTask.countDocuments(filter),
      HousekeepingTask.find(filter)
        .populate({
          path: 'room',
          populate: { path: 'roomType' },
        })
        .populate('assignedTo', 'firstName lastName email role')
        .populate('inspectedBy', 'firstName lastName email role')
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit),
    ]);

    return sendSuccess({
      res,
      message: 'Housekeeping tasks fetched successfully',
      data: tasks,
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

export const getHousekeepingTaskById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const task = await HousekeepingTask.findById(req.params.id)
      .populate({
        path: 'room',
        populate: { path: 'roomType' },
      })
      .populate('assignedTo')
      .populate('inspectedBy');

    if (!task) {
      return sendError({
        res,
        statusCode: 404,
        message: 'Housekeeping task not found',
      });
    }

    return sendSuccess({
      res,
      message: 'Housekeeping task details',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const createHousekeepingTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const task = await HousekeepingTask.create({
      room: req.body.roomId,
      priority: req.body.priority || 'HIGH',
      assignedTo: req.body.assignedTo,
      notes: req.body.notes || '',
      checklist: {
        bedroom: false,
        bathroom: false,
        towels: false,
        toiletries: false,
        floor: false,
        dustbin: false,
        amenities: false,
        damage: false,
      },
    });

    await task.populate(['room', 'assignedTo']);

    return sendSuccess({
      res,
      statusCode: 201,
      message: 'Housekeeping task created successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const updateHousekeepingTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const task = await HousekeepingTask.findById(req.params.id);
    if (!task) {
      return sendError({
        res,
        statusCode: 404,
        message: 'Housekeeping task not found',
      });
    }

    if (req.body.checklist) {
      task.checklist = { ...task.checklist, ...req.body.checklist };
    }
    if (req.body.priority) task.priority = req.body.priority;
    if (req.body.assignedTo) task.assignedTo = req.body.assignedTo;
    if (req.body.notes) task.notes = req.body.notes;

    await task.save();
    await task.populate(['room', 'assignedTo']);

    return sendSuccess({
      res,
      message: 'Housekeeping task updated successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const updateHousekeepingStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const userId = req.user?._id.toString();
    const userName = req.user ? `${req.user.firstName} ${req.user.lastName}` : undefined;

    let updatedTask;
    if (status === 'IN_PROGRESS') {
      updatedTask = await HousekeepingService.startCleaning(req.params.id, userId, userName);
    } else if (status === 'INSPECTION') {
      updatedTask = await HousekeepingService.completeCleaning(req.params.id, userId, userName);
    } else {
      updatedTask = await HousekeepingTask.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );
    }

    await updatedTask?.populate(['room', 'assignedTo', 'inspectedBy']);

    return sendSuccess({
      res,
      message: `Housekeeping status updated to ${status}`,
      data: updatedTask,
    });
  } catch (error: any) {
    return sendError({
      res,
      statusCode: 400,
      message: error.message || 'Could not update housekeeping status',
    });
  }
};

export const inspectRoom = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { approved, notes } = req.body;
    const userId = req.user?._id.toString();
    const userName = req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Supervisor';

    const task = await HousekeepingService.inspectRoom(
      req.params.id,
      approved,
      notes,
      userId,
      userName
    );

    await task.populate(['room', 'assignedTo', 'inspectedBy']);

    return sendSuccess({
      res,
      message: approved
        ? 'Inspection approved! Room released to inventory as Available.'
        : 'Inspection rejected. Room returned to Cleaning Required.',
      data: task,
    });
  } catch (error: any) {
    return sendError({
      res,
      statusCode: 400,
      message: error.message || 'Inspection failed',
    });
  }
};
