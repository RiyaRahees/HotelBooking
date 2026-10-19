import { Booking, IBooking } from '../models/Booking.js';
import { Room } from '../models/Room.js';
import { Guest } from '../models/Guest.js';
import { Payment } from '../models/Payment.js';
import { Notification } from '../models/Notification.js';
import { AuditLog } from '../models/AuditLog.js';

export interface CheckInDTO {
  bookingId: string;
  depositAmount?: number;
  paymentMethod?: 'CASH' | 'CARD' | 'UPI' | 'ONLINE';
  keycardsIssued?: number;
  staffId?: string;
  staffName?: string;
}

export class CheckInService {
  static async processCheckIn(dto: CheckInDTO): Promise<{ booking: IBooking; room: any }> {
    const booking = await Booking.findById(dto.bookingId).populate('guest').populate('room');
    if (!booking) {
      throw new Error('Reservation not found');
    }

    if (booking.bookingStatus === 'CHECKED_IN') {
      throw new Error(`Guest is already checked into room.`);
    }

    if (booking.bookingStatus === 'CANCELLED' || booking.bookingStatus === 'NO_SHOW') {
      throw new Error(`Cannot check in a ${booking.bookingStatus.toLowerCase()} booking.`);
    }

    const room = await Room.findById(booking.room);
    if (!room) {
      throw new Error('Allocated room not found');
    }

    const guest = await Guest.findById(booking.guest);
    if (!guest) {
      throw new Error('Guest record not found');
    }

    // Process payment if deposit amount provided
    if (dto.depositAmount && dto.depositAmount > 0) {
      const deposit = dto.depositAmount;
      booking.paidAmount += deposit;
      booking.balanceAmount = Math.max(0, booking.totalAmount - booking.paidAmount);
      booking.paymentStatus = booking.balanceAmount === 0 ? 'PAID' : 'PARTIALLY_PAID';

      await Payment.create({
        paymentId: `PAY-${Date.now()}`,
        booking: booking._id,
        guest: guest._id,
        amount: deposit,
        type: 'ROOM',
        method: dto.paymentMethod || 'CARD',
        status: 'PAID',
        transactionId: `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
        notes: `Check-in settlement / deposit for booking ${booking.bookingId}`,
        receivedBy: dto.staffId as any,
      });
    }

    // Update Booking State: CHECKED_IN
    booking.bookingStatus = 'CHECKED_IN';
    booking.actualCheckIn = new Date();
    await booking.save();

    // Update Room State: OCCUPIED
    room.status = 'OCCUPIED';
    room.currentGuest = guest._id;
    room.currentBooking = booking._id;
    await room.save();

    // Update Guest State: currentBooking
    guest.currentBooking = booking._id;
    await guest.save();

    // Create Notification & Audit Log
    await Notification.create({
      title: 'Guest Checked In',
      message: `${guest.firstName} ${guest.lastName} checked in into Room ${room.roomNumber}`,
      type: 'CHECKIN',
      relatedId: booking.bookingId,
    });

    await AuditLog.create({
      user: dto.staffId as any,
      userName: dto.staffName || 'Reception Desk',
      action: 'Guest Check-in',
      module: 'Check-in',
      entityId: booking._id.toString(),
      details: `${dto.staffName || 'Staff'} checked in ${guest.firstName} ${guest.lastName} into Room ${room.roomNumber}. Room status is now Occupied.`,
    });

    return { booking, room };
  }
}
