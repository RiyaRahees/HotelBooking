import { Response, NextFunction } from 'express';
import { Room } from '../models/Room.js';
import { Booking } from '../models/Booking.js';
import { Payment } from '../models/Payment.js';
import { HousekeepingTask } from '../models/HousekeepingTask.js';
import { MaintenanceIssue } from '../models/MaintenanceIssue.js';
import { Feedback } from '../models/Feedback.js';
import { Notification } from '../models/Notification.js';
import { AuditLog } from '../models/AuditLog.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getDashboardData = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    // Parallel aggregated queries
    const [
      rooms,
      todayArrivals,
      todayDepartures,
      todayPaymentsAgg,
      totalPaymentsAgg,
      pendingBookingsCount,
      housekeepingTasks,
      maintenanceIssues,
      recentBookings,
      recentFeedback,
      recentNotifications,
      recentAuditLogs,
    ] = await Promise.all([
      Room.find().populate('roomType').populate('currentGuest', 'firstName lastName avatar vip'),
      Booking.find({
        checkInDate: { $gte: startOfToday, $lte: endOfToday },
        bookingStatus: { $in: ['CONFIRMED', 'CHECKED_IN', 'PENDING'] },
      }).populate('guest').populate('room').populate('roomType'),
      Booking.find({
        checkOutDate: { $gte: startOfToday, $lte: endOfToday },
        bookingStatus: { $in: ['CHECKED_IN', 'CONFIRMED'] },
      }).populate('guest').populate('room').populate('roomType'),
      Payment.aggregate([
        { $match: { createdAt: { $gte: startOfToday, $lte: endOfToday }, status: 'PAID' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Payment.aggregate([
        { $match: { status: 'PAID' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Booking.countDocuments({ paymentStatus: { $in: ['PENDING', 'PARTIALLY_PAID'] } }),
      HousekeepingTask.find({ status: { $ne: 'COMPLETED' } })
        .populate({ path: 'room', populate: { path: 'roomType' } })
        .populate('assignedTo', 'firstName lastName')
        .sort({ updatedAt: -1 })
        .limit(10),
      MaintenanceIssue.find({ status: { $in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS'] } })
        .populate('room')
        .sort({ priority: -1, createdAt: -1 })
        .limit(10),
      Booking.find()
        .populate('guest')
        .populate('room')
        .populate('roomType')
        .sort({ createdAt: -1 })
        .limit(6),
      Feedback.find()
        .populate('guest')
        .populate('room')
        .sort({ createdAt: -1 })
        .limit(5),
      Notification.find({
        $or: [{ recipient: req.user?._id }, { recipient: null }],
      })
        .sort({ createdAt: -1 })
        .limit(10),
      AuditLog.find()
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    // Room stats calculation
    const totalRooms = rooms.length;
    const availableRooms = rooms.filter((r) => r.status === 'AVAILABLE').length;
    const reservedRooms = rooms.filter((r) => r.status === 'RESERVED').length;
    const occupiedRooms = rooms.filter((r) => r.status === 'OCCUPIED').length;
    const cleaningRooms = rooms.filter((r) => r.status === 'CLEANING').length;
    const inspectionRooms = rooms.filter((r) => r.status === 'INSPECTION').length;
    const maintenanceRooms = rooms.filter((r) => r.status === 'MAINTENANCE').length;
    const outOfServiceRooms = rooms.filter((r) => r.status === 'OUT_OF_SERVICE').length;

    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
    const todayRevenue = todayPaymentsAgg[0]?.total || 0;
    const totalRevenue = totalPaymentsAgg[0]?.total || 0;

    return sendSuccess({
      res,
      message: 'Dashboard operational metrics loaded',
      data: {
        stats: {
          totalRooms,
          availableRooms,
          reservedRooms,
          occupiedRooms,
          cleaningRooms,
          inspectionRooms,
          maintenanceRooms,
          outOfServiceRooms,
          todayArrivalsCount: todayArrivals.length,
          todayDeparturesCount: todayDepartures.length,
          occupancyRate,
          todayRevenue,
          totalRevenue,
          pendingPaymentsCount: pendingBookingsCount,
          activeHousekeepingCount: housekeepingTasks.length,
          activeMaintenanceCount: maintenanceIssues.length,
        },
        todayArrivals,
        todayDepartures,
        rooms,
        housekeepingTasks,
        maintenanceIssues,
        recentBookings,
        recentFeedback,
        recentNotifications,
        recentAuditLogs,
      },
    });
  } catch (error) {
    next(error);
  }
};
