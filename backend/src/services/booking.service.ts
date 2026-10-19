import mongoose from 'mongoose';
import { Booking, IBooking, BookingStatus, PaymentStatus } from '../models/Booking.js';
import { Room, IRoom } from '../models/Room.js';
import { Guest, IGuest } from '../models/Guest.js';
import { RoomType } from '../models/RoomType.js';
import { Payment, PaymentMethod } from '../models/Payment.js';
import { HousekeepingTask } from '../models/HousekeepingTask.js';
import { Notification } from '../models/Notification.js';
import { AuditLog } from '../models/AuditLog.js';
import { generateBookingId } from '../utils/generateBookingId.js';
import { PaginationParams } from '../utils/pagination.js';

export interface BookingFilterParams {
  status?: string;
  paymentStatus?: string;
  guestId?: string;
  roomId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateBookingDTO {
  guestId?: string;
  newGuest?: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    address?: string;
    idType?: 'Passport' | 'Driving License' | 'National ID' | 'Aadhaar';
    idNumber?: string;
  };
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children?: number;
  specialRequests?: string;
  notes?: string;
  discount?: number;
  advanceAmount?: number;
  source?: string;
  paymentMethod?: PaymentMethod;
  userId?: string;
  userName?: string;
  ipAddress?: string;
}

export interface CheckInDTO {
  collectAmount?: number;
  paymentMethod?: PaymentMethod;
  keyCardsIssued?: number;
  notes?: string;
  userId?: string;
  userName?: string;
  ipAddress?: string;
}

export interface CheckOutDTO {
  foodCharges?: number;
  laundryCharges?: number;
  serviceCharges?: number;
  additionalDiscount?: number;
  settleAmount?: number;
  paymentMethod?: PaymentMethod;
  notes?: string;
  userId?: string;
  userName?: string;
  ipAddress?: string;
}

export class BookingService {
  static async checkRoomAvailability(
    roomId: string,
    checkIn: Date,
    checkOut: Date,
    excludeBookingId?: string
  ): Promise<boolean> {
    const overlapping = await Booking.findOne({
      room: roomId,
      bookingStatus: { $in: ['CONFIRMED', 'CHECKED_IN'] },
      ...(excludeBookingId && { _id: { $ne: excludeBookingId } }),
      $or: [
        { checkInDate: { $lt: checkOut, $gte: checkIn } },
        { checkOutDate: { $gt: checkIn, $lte: checkOut } },
        { checkInDate: { $lte: checkIn }, checkOutDate: { $gte: checkOut } },
      ],
    });

    return !overlapping;
  }

  static async getAvailableRooms(checkInDate: string, checkOutDate: string, roomType?: string): Promise<IRoom[]> {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    // Find all booked room IDs for the date window
    const bookedBookings = await Booking.find({
      bookingStatus: { $in: ['CONFIRMED', 'CHECKED_IN'] },
      $or: [
        { checkInDate: { $lt: checkOut, $gte: checkIn } },
        { checkOutDate: { $gt: checkIn, $lte: checkOut } },
        { checkInDate: { $lte: checkIn }, checkOutDate: { $gte: checkOut } },
      ],
    }).select('room');

    const bookedRoomIds = bookedBookings.map((b) => b.room);

    const roomQuery: any = {
      _id: { $nin: bookedRoomIds },
      status: { $nin: ['MAINTENANCE', 'OUT_OF_SERVICE'] },
    };

    if (roomType && roomType !== 'All') {
      if (mongoose.Types.ObjectId.isValid(roomType)) {
        roomQuery.roomType = roomType;
      } else {
        const foundType = await RoomType.findOne({ name: roomType });
        if (foundType) {
          roomQuery.roomType = foundType._id;
        }
      }
    }

    return Room.find(roomQuery).populate('roomType').sort({ roomNumber: 1 });
  }

  static async getAllBookings(
    filters: BookingFilterParams,
    pagination: PaginationParams
  ): Promise<{ bookings: IBooking[]; total: number }> {
    const query: any = {};

    if (filters.status && filters.status !== 'All') {
      query.bookingStatus = filters.status.toUpperCase();
    }

    if (filters.paymentStatus && filters.paymentStatus !== 'All') {
      const pStatus = filters.paymentStatus.toUpperCase();
      query.paymentStatus = pStatus === 'PARTIAL' ? 'PARTIALLY_PAID' : pStatus;
    }

    if (filters.guestId) {
      query.guest = filters.guestId;
    }

    if (filters.roomId) {
      query.room = filters.roomId;
    }

    if (filters.startDate && filters.endDate) {
      query.checkInDate = {
        $gte: new Date(filters.startDate),
        $lte: new Date(filters.endDate),
      };
    }

    if (filters.search) {
      const searchTrimmed = filters.search.trim();
      const searchRegex = new RegExp(searchTrimmed, 'i');

      // Find matching guest IDs
      const matchingGuests = await Guest.find({
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { phone: searchRegex },
          { email: searchRegex },
        ],
      }).select('_id');
      const guestIds = matchingGuests.map((g) => g._id);

      // Find matching room IDs
      const matchingRooms = await Room.find({
        roomNumber: searchRegex,
      }).select('_id');
      const roomIds = matchingRooms.map((r) => r._id);

      query.$or = [
        { bookingId: searchRegex },
        { source: searchRegex },
        ...(guestIds.length > 0 ? [{ guest: { $in: guestIds } }] : []),
        ...(roomIds.length > 0 ? [{ room: { $in: roomIds } }] : []),
      ];
    }

    const [total, bookings] = await Promise.all([
      Booking.countDocuments(query),
      Booking.find(query)
        .populate('guest')
        .populate({
          path: 'room',
          populate: { path: 'roomType' },
        })
        .populate('roomType')
        .populate('createdBy', 'firstName lastName email role')
        .sort({ [pagination.sortBy]: pagination.sortOrder })
        .skip(pagination.skip)
        .limit(pagination.limit),
    ]);

    return { bookings, total };
  }

  static async getBookingById(id: string): Promise<IBooking | null> {
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ _id: id }, { bookingId: id }] }
      : { bookingId: id };

    return Booking.findOne(query)
      .populate('guest')
      .populate({
        path: 'room',
        populate: { path: 'roomType' },
      })
      .populate('roomType')
      .populate('createdBy', 'firstName lastName email role');
  }

  static async createBooking(dto: CreateBookingDTO): Promise<IBooking> {
    // 1. Resolve or create Guest
    let guestDoc: IGuest | null = null;

    if (dto.guestId && mongoose.Types.ObjectId.isValid(dto.guestId)) {
      guestDoc = await Guest.findById(dto.guestId);
    }

    if (!guestDoc && dto.newGuest) {
      guestDoc = await Guest.create({
        firstName: dto.newGuest.firstName.trim(),
        lastName: dto.newGuest.lastName.trim(),
        phone: dto.newGuest.phone.trim(),
        email: dto.newGuest.email?.trim() || `${dto.newGuest.firstName.toLowerCase()}@client.com`,
        address: dto.newGuest.address || '',
        idType: dto.newGuest.idType || 'Passport',
        idNumber: dto.newGuest.idNumber || `ID-${Math.floor(100000 + Math.random() * 900000)}`,
        nationality: 'Indian',
      });
    } else if (!guestDoc && (dto.guestName || dto.guestPhone)) {
      const names = (dto.guestName || 'Valued Guest').trim().split(' ');
      const firstName = names[0] || 'Valued';
      const lastName = names.slice(1).join(' ') || 'Guest';

      guestDoc = await Guest.create({
        firstName,
        lastName,
        phone: dto.guestPhone || '+91 98000 00000',
        email: dto.guestEmail || `${firstName.toLowerCase()}@client.com`,
        idType: 'Passport',
        idNumber: `ID-${Math.floor(100000 + Math.random() * 900000)}`,
        nationality: 'Indian',
      });
    }

    if (!guestDoc) {
      throw new Error('Valid guest information is required to create a reservation');
    }

    // 2. Resolve Room
    const room = mongoose.Types.ObjectId.isValid(dto.roomId)
      ? await Room.findById(dto.roomId).populate('roomType')
      : await Room.findOne({ roomNumber: dto.roomId }).populate('roomType');

    if (!room) {
      throw new Error(`Room with ID '${dto.roomId}' not found`);
    }

    const checkIn = new Date(dto.checkInDate);
    const checkOut = new Date(dto.checkOutDate);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      throw new Error('Invalid check-in or check-out date format');
    }

    if (checkOut <= checkIn) {
      throw new Error('Check-out date must be strictly after check-in date');
    }

    // 3. Prevent overlapping reservations
    const isAvailable = await this.checkRoomAvailability(room._id.toString(), checkIn, checkOut);
    if (!isAvailable) {
      throw new Error(`Room ${room.roomNumber} is already booked for the selected dates`);
    }

    // 4. Calculate tariff, discounts, taxes and balances
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const roomCharge = room.pricePerNight * nights;
    const discount = dto.discount || 0;
    const taxableAmount = Math.max(0, roomCharge - discount);
    const tax = Math.round(taxableAmount * 0.12); // 12% GST
    const totalAmount = taxableAmount + tax;
    const advanceAmount = Number(dto.advanceAmount) || 0;
    const paidAmount = advanceAmount;
    const balanceAmount = Math.max(0, totalAmount - paidAmount);

    let paymentStatus: PaymentStatus = 'PENDING';
    if (balanceAmount === 0 && totalAmount > 0) {
      paymentStatus = 'PAID';
    } else if (paidAmount > 0) {
      paymentStatus = 'PARTIALLY_PAID';
    }

    const bookingId = generateBookingId();

    const booking = await Booking.create({
      bookingId,
      guest: guestDoc._id,
      room: room._id,
      roomType: room.roomType?._id || room.roomType,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      adults: dto.adults || 1,
      children: dto.children || 0,
      specialRequests: dto.specialRequests || '',
      roomCharge,
      additionalCharges: 0,
      discount,
      tax,
      totalAmount,
      advanceAmount,
      paidAmount,
      balanceAmount,
      paymentStatus,
      bookingStatus: 'CONFIRMED',
      source: dto.source || 'Direct Front Desk',
      createdBy: dto.userId as any,
    });

    // Update Room status to RESERVED if not already OCCUPIED
    if (room.status === 'AVAILABLE') {
      room.status = 'RESERVED';
      room.currentGuest = guestDoc._id;
      room.currentBooking = booking._id;
      await room.save();
    }

    // 5. Record advance payment if collected
    if (advanceAmount > 0) {
      const paymentId = `PAY-${Date.now()}`;
      await Payment.create({
        paymentId,
        booking: booking._id,
        guest: guestDoc._id,
        amount: advanceAmount,
        type: 'ADVANCE',
        method: dto.paymentMethod || 'CARD',
        status: 'PAID',
        transactionId: `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
        notes: `Advance deposit for reservation ${booking.bookingId}`,
        receivedBy: dto.userId as any,
      });
    }

    // 6. AuditLog & Notification
    await Notification.create({
      title: 'New Booking Created',
      message: `Reservation ${booking.bookingId} created for ${guestDoc.firstName} ${guestDoc.lastName} in Room ${room.roomNumber}`,
      type: 'BOOKING',
      relatedId: booking.bookingId,
    });

    if (dto.userId) {
      await AuditLog.create({
        user: dto.userId as any,
        userName: dto.userName || 'Front Desk',
        action: 'Created Booking',
        module: 'Bookings',
        entityId: booking._id.toString(),
        details: `Created reservation ${booking.bookingId} for ${guestDoc.firstName} ${guestDoc.lastName} in Room ${room.roomNumber} (₹${totalAmount.toLocaleString()})`,
        ipAddress: dto.ipAddress || '',
      });
    }

    await booking.populate(['guest', 'room', 'roomType']);
    return booking;
  }

  static async updateBooking(id: string, updates: any, userId?: string, userName?: string, ipAddress?: string): Promise<IBooking> {
    const booking = await this.getBookingById(id);
    if (!booking) {
      throw new Error(`Booking not found with ID '${id}'`);
    }

    if (updates.specialRequests !== undefined) booking.specialRequests = updates.specialRequests;
    if (updates.adults !== undefined) booking.adults = Number(updates.adults);
    if (updates.children !== undefined) booking.children = Number(updates.children);
    if (updates.discount !== undefined) {
      booking.discount = Number(updates.discount);
      const taxable = Math.max(0, booking.roomCharge - booking.discount);
      booking.tax = Math.round(taxable * 0.12);
      booking.totalAmount = taxable + booking.tax + (booking.additionalCharges || 0);
      booking.balanceAmount = Math.max(0, booking.totalAmount - booking.paidAmount);
      booking.paymentStatus = booking.balanceAmount === 0 ? 'PAID' : booking.paidAmount > 0 ? 'PARTIALLY_PAID' : 'PENDING';
    }

    await booking.save();
    await booking.populate(['guest', 'room', 'roomType']);

    if (userId) {
      await AuditLog.create({
        user: userId as any,
        userName: userName || 'Front Desk',
        action: 'Updated Booking',
        module: 'Bookings',
        entityId: booking._id.toString(),
        details: `Updated reservation ${booking.bookingId}`,
        ipAddress: ipAddress || '',
      });
    }

    return booking;
  }

  static async updateBookingStatus(
    id: string,
    status: BookingStatus,
    userId?: string,
    userName?: string,
    ipAddress?: string
  ): Promise<IBooking> {
    if (status === 'CANCELLED') {
      return this.cancelBooking(id, userId, userName, ipAddress);
    }
    if (status === 'CHECKED_IN') {
      return this.checkInBooking(id, {}, userId, userName, ipAddress);
    }
    if (status === 'CHECKED_OUT') {
      return this.checkOutBooking(id, {}, userId, userName, ipAddress);
    }

    const booking = await this.getBookingById(id);
    if (!booking) {
      throw new Error(`Booking not found with ID '${id}'`);
    }

    booking.bookingStatus = status;
    await booking.save();
    await booking.populate(['guest', 'room', 'roomType']);

    if (userId) {
      await AuditLog.create({
        user: userId as any,
        userName: userName || 'Front Desk',
        action: 'Updated Booking Status',
        module: 'Bookings',
        entityId: booking._id.toString(),
        details: `Status of booking ${booking.bookingId} changed to ${status}`,
        ipAddress: ipAddress || '',
      });
    }

    return booking;
  }

  static async checkInBooking(
    id: string,
    dto: CheckInDTO,
    userId?: string,
    userName?: string,
    ipAddress?: string
  ): Promise<IBooking> {
    const booking = await this.getBookingById(id);
    if (!booking) {
      throw new Error(`Booking not found with ID '${id}'`);
    }

    if (booking.bookingStatus === 'CHECKED_IN') {
      throw new Error(`Booking ${booking.bookingId} is already checked in`);
    }
    if (booking.bookingStatus === 'CHECKED_OUT' || booking.bookingStatus === 'CANCELLED') {
      throw new Error(`Cannot check in a booking with status '${booking.bookingStatus}'`);
    }

    const room = await Room.findById(booking.room);
    if (!room) {
      throw new Error('Assigned room not found');
    }

    // 1. Process payment if provided during check-in
    const collectAmount = Number(dto.collectAmount) || 0;
    if (collectAmount > 0) {
      booking.paidAmount += collectAmount;
      booking.balanceAmount = Math.max(0, booking.totalAmount - booking.paidAmount);
      booking.paymentStatus = booking.balanceAmount === 0 ? 'PAID' : 'PARTIALLY_PAID';

      const paymentId = `PAY-${Date.now()}`;
      await Payment.create({
        paymentId,
        booking: booking._id,
        guest: booking.guest,
        amount: collectAmount,
        type: 'ROOM',
        method: dto.paymentMethod || 'CARD',
        status: 'PAID',
        transactionId: `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
        notes: dto.notes || `Payment collected at check-in for booking ${booking.bookingId}`,
        receivedBy: userId as any,
      });
    }

    // 2. Update booking state
    booking.bookingStatus = 'CHECKED_IN';
    booking.actualCheckIn = new Date();
    await booking.save();

    // 3. Update room state to OCCUPIED
    room.status = 'OCCUPIED';
    room.currentGuest = booking.guest;
    room.currentBooking = booking._id;
    await room.save();

    // 4. Update guest active booking
    await Guest.findByIdAndUpdate(booking.guest, {
      currentBooking: booking._id,
    });

    // 5. Audit Log & Notification
    await Notification.create({
      title: 'Guest Checked In',
      message: `Booking ${booking.bookingId} checked into Room ${room.roomNumber}`,
      type: 'CHECK_IN',
      relatedId: booking.bookingId,
    });

    if (userId) {
      await AuditLog.create({
        user: userId as any,
        userName: userName || 'Front Desk',
        action: 'Checked In Guest',
        module: 'Bookings',
        entityId: booking._id.toString(),
        details: `Checked in booking ${booking.bookingId} into Room ${room.roomNumber}. Room status is now OCCUPIED.`,
        ipAddress: ipAddress || '',
      });
    }

    await booking.populate(['guest', 'room', 'roomType']);
    return booking;
  }

  static async checkOutBooking(
    id: string,
    dto: CheckOutDTO,
    userId?: string,
    userName?: string,
    ipAddress?: string
  ): Promise<IBooking> {
    const booking = await this.getBookingById(id);
    if (!booking) {
      throw new Error(`Booking not found with ID '${id}'`);
    }

    if (booking.bookingStatus === 'CHECKED_OUT') {
      throw new Error(`Booking ${booking.bookingId} is already checked out`);
    }

    const room = await Room.findById(booking.room);
    if (!room) {
      throw new Error('Assigned room not found');
    }

    // 1. Settle incidentals & additional charges
    const extraCharges =
      (Number(dto.foodCharges) || 0) +
      (Number(dto.laundryCharges) || 0) +
      (Number(dto.serviceCharges) || 0);

    const additionalDiscount = Number(dto.additionalDiscount) || 0;

    if (extraCharges > 0 || additionalDiscount > 0) {
      booking.additionalCharges = (booking.additionalCharges || 0) + extraCharges;
      booking.discount = (booking.discount || 0) + additionalDiscount;
      const taxable = Math.max(0, booking.roomCharge + booking.additionalCharges - booking.discount);
      booking.tax = Math.round(taxable * 0.12);
      booking.totalAmount = taxable + booking.tax;
      booking.balanceAmount = Math.max(0, booking.totalAmount - booking.paidAmount);
    }

    // 2. Process final settlement payment
    const settleAmount = Number(dto.settleAmount) || 0;
    if (settleAmount > 0) {
      booking.paidAmount += settleAmount;
      booking.balanceAmount = Math.max(0, booking.totalAmount - booking.paidAmount);
      booking.paymentStatus = 'PAID';

      const paymentId = `PAY-${Date.now()}`;
      await Payment.create({
        paymentId,
        booking: booking._id,
        guest: booking.guest,
        amount: settleAmount,
        type: 'FINAL_PAYMENT',
        method: dto.paymentMethod || 'CARD',
        status: 'PAID',
        transactionId: `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
        notes: dto.notes || `Final folio settlement on checkout (Room ${room.roomNumber})`,
        receivedBy: userId as any,
      });
    }

    // 3. Update booking status
    booking.bookingStatus = 'CHECKED_OUT';
    booking.actualCheckOut = new Date();
    await booking.save();

    // 4. Update room status to CLEANING
    room.status = 'CLEANING';
    room.currentGuest = null;
    room.currentBooking = null;
    await room.save();

    // 5. Clear guest active booking & increment stay metrics
    await Guest.findByIdAndUpdate(booking.guest, {
      currentBooking: null,
      $inc: {
        totalStays: 1,
        totalSpent: booking.totalAmount,
      },
    });

    // 6. Queue Housekeeping Task
    await HousekeepingTask.create({
      room: room._id,
      status: 'CLEANING_REQUIRED',
      priority: 'HIGH',
      notes: `Turnover cleaning post checkout for reservation ${booking.bookingId} (Room ${room.roomNumber})`,
    });

    // 7. AuditLog & Notification
    await Notification.create({
      title: 'Guest Checked Out',
      message: `Booking ${booking.bookingId} checked out from Room ${room.roomNumber}. Room queued for cleaning.`,
      type: 'CHECK_OUT',
      relatedId: booking.bookingId,
    });

    if (userId) {
      await AuditLog.create({
        user: userId as any,
        userName: userName || 'Front Desk',
        action: 'Checked Out Guest',
        module: 'Bookings',
        entityId: booking._id.toString(),
        details: `Checked out booking ${booking.bookingId} from Room ${room.roomNumber}. Room status set to CLEANING.`,
        ipAddress: ipAddress || '',
      });
    }

    await booking.populate(['guest', 'room', 'roomType']);
    return booking;
  }

  static async cancelBooking(
    id: string,
    userId?: string,
    userName?: string,
    ipAddress?: string
  ): Promise<IBooking> {
    const booking = await this.getBookingById(id);
    if (!booking) {
      throw new Error(`Booking not found with ID '${id}'`);
    }

    if (booking.bookingStatus === 'CHECKED_IN') {
      throw new Error('Cannot cancel a booking that is currently checked in. Please perform check-out.');
    }

    booking.bookingStatus = 'CANCELLED';
    await booking.save();

    const room = await Room.findById(booking.room);
    if (room && (room.status === 'RESERVED' || room.currentBooking?.toString() === booking._id.toString())) {
      room.status = 'AVAILABLE';
      room.currentGuest = null;
      room.currentBooking = null;
      await room.save();
    }

    await Guest.findByIdAndUpdate(booking.guest, {
      currentBooking: null,
    });

    if (userId) {
      await AuditLog.create({
        user: userId as any,
        userName: userName || 'Front Desk',
        action: 'Cancelled Booking',
        module: 'Bookings',
        entityId: booking._id.toString(),
        details: `Cancelled reservation ${booking.bookingId}. Room inventory released.`,
        ipAddress: ipAddress || '',
      });
    }

    await booking.populate(['guest', 'room', 'roomType']);
    return booking;
  }

  static async deleteBooking(
    id: string,
    userId?: string,
    userName?: string,
    ipAddress?: string
  ): Promise<{ message: string; bookingId: string }> {
    const booking = await this.getBookingById(id);
    if (!booking) {
      throw new Error(`Booking not found with ID '${id}'`);
    }

    const bId = booking.bookingId;

    const room = await Room.findById(booking.room);
    if (room && room.currentBooking?.toString() === booking._id.toString()) {
      room.status = 'AVAILABLE';
      room.currentGuest = null;
      room.currentBooking = null;
      await room.save();
    }

    await Booking.findByIdAndDelete(booking._id);

    if (userId) {
      await AuditLog.create({
        user: userId as any,
        userName: userName || 'Front Desk',
        action: 'Deleted Booking',
        module: 'Bookings',
        entityId: booking._id.toString(),
        details: `Deleted reservation ${bId} from database`,
        ipAddress: ipAddress || '',
      });
    }

    return { message: `Reservation ${bId} deleted successfully`, bookingId: bId };
  }
}

