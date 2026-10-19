import { HousekeepingTask, IHousekeepingTask } from '../models/HousekeepingTask.js';
import { Room } from '../models/Room.js';
import { Notification } from '../models/Notification.js';
import { AuditLog } from '../models/AuditLog.js';

export class HousekeepingService {
  static async startCleaning(taskId: string, userId?: string, userName?: string): Promise<IHousekeepingTask> {
    const task = await HousekeepingTask.findById(taskId).populate('room');
    if (!task) throw new Error('Housekeeping task not found');

    task.status = 'IN_PROGRESS';
    task.startedAt = new Date();
    await task.save();

    const room = await Room.findById(task.room);
    if (room && room.status !== 'CLEANING') {
      room.status = 'CLEANING';
      await room.save();
    }

    await AuditLog.create({
      user: userId as any,
      userName: userName || 'Housekeeping Staff',
      action: 'Started Cleaning',
      module: 'Housekeeping',
      entityId: task._id.toString(),
      details: `${userName || 'Staff'} started turnaround cleaning for Room ${room?.roomNumber}`,
    });

    return task;
  }

  static async completeCleaning(taskId: string, userId?: string, userName?: string): Promise<IHousekeepingTask> {
    const task = await HousekeepingTask.findById(taskId).populate('room');
    if (!task) throw new Error('Housekeeping task not found');

    task.status = 'INSPECTION';
    task.completedAt = new Date();
    await task.save();

    const room = await Room.findById(task.room);
    if (room) {
      room.status = 'INSPECTION';
      await room.save();
    }

    await Notification.create({
      title: 'Room Ready for Inspection',
      message: `Cleaning completed for Room ${room?.roomNumber}. Inspection required.`,
      type: 'HOUSEKEEPING',
      relatedId: task._id.toString(),
    });

    await AuditLog.create({
      user: userId as any,
      userName: userName || 'Housekeeping Staff',
      action: 'Completed Cleaning Checklist',
      module: 'Housekeeping',
      entityId: task._id.toString(),
      details: `${userName || 'Housekeeper'} completed 8-point checklist for Room ${room?.roomNumber}. Room status is now Inspection.`,
    });

    return task;
  }

  static async inspectRoom(
    taskId: string,
    approved: boolean,
    notes?: string,
    userId?: string,
    userName?: string
  ): Promise<IHousekeepingTask> {
    const task = await HousekeepingTask.findById(taskId).populate('room');
    if (!task) throw new Error('Housekeeping task not found');

    const room = await Room.findById(task.room);
    if (!room) throw new Error('Associated room not found');

    if (approved) {
      task.status = 'COMPLETED';
      task.inspectionNotes = notes || 'All 8 checklist points verified and approved.';
      task.inspectedBy = userId as any;
      await task.save();

      // State Transition: INSPECTION -> AVAILABLE
      room.status = 'AVAILABLE';
      await room.save();

      await Notification.create({
        title: 'Room Released to Inventory',
        message: `Supervisor approved inspection for Room ${room.roomNumber}. Room is now AVAILABLE.`,
        type: 'HOUSEKEEPING',
        relatedId: room.roomNumber,
      });

      await AuditLog.create({
        user: userId as any,
        userName: userName || 'Supervisor',
        action: 'Approved Room Inspection',
        module: 'Inspection',
        entityId: task._id.toString(),
        details: `${userName || 'Supervisor'} approved inspection for Room ${room.roomNumber}. Room released to inventory as Available.`,
      });
    } else {
      // Rejection sends room back to CLEANING
      task.status = 'CLEANING_REQUIRED';
      task.inspectionNotes = `Rejected: ${notes || 'Requires re-cleaning.'}`;
      task.inspectedBy = userId as any;
      task.checklist = {
        bedroom: false,
        bathroom: false,
        towels: false,
        toiletries: false,
        floor: false,
        dustbin: false,
        amenities: false,
        damage: false,
      };
      await task.save();

      // State Transition: INSPECTION -> CLEANING
      room.status = 'CLEANING';
      await room.save();

      await Notification.create({
        title: 'Room Inspection Rejected',
        message: `Inspection for Room ${room.roomNumber} failed: ${notes || 'Re-cleaning required'}.`,
        type: 'HOUSEKEEPING',
        relatedId: room.roomNumber,
      });

      await AuditLog.create({
        user: userId as any,
        userName: userName || 'Supervisor',
        action: 'Rejected Room Inspection',
        module: 'Inspection',
        entityId: task._id.toString(),
        details: `${userName || 'Supervisor'} rejected inspection for Room ${room.roomNumber}. Room returned to Cleaning.`,
      });
    }

    return task;
  }
}
