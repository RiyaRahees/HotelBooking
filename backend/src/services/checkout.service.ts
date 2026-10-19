import { Booking, IBooking } from '../models/Booking.js';
import { Room } from '../models/Room.js';
import { Guest } from '../models/Guest.js';
import { Payment } from '../models/Payment.js';
import { Invoice, IInvoiceCharge } from '../models/Invoice.js';
import { HousekeepingTask } from '../models/HousekeepingTask.js';
import { Notification } from '../models/Notification.js';
import { AuditLog } from '../models/AuditLog.js';
import { generateInvoiceNumber } from '../utils/generateInvoiceNumber.js';

export interface CheckOutDTO {
  bookingId: string;
  additionalCharges?: {
    food?: number;
    laundry?: number;
    spa?: number;
    miniBar?: number;
    other?: number;
  };
  discount?: number;
  paymentMethod?: 'CASH' | 'CARD' | 'UPI' | 'ONLINE';
  notes?: string;
  staffId?: string;
  staffName?: string;
}

export class CheckOutService {
  static async processCheckOut(dto: CheckOutDTO): Promise<{
    booking: IBooking;
    invoice: any;
    housekeepingTask: any;
  }> {
    const booking = await Booking.findById(dto.bookingId)
      .populate('guest')
      .populate('room')
      .populate('roomType');

    if (!booking) {
      throw new Error('Reservation not found');
    }

    if (booking.bookingStatus !== 'CHECKED_IN') {
      throw new Error(`Cannot check out a booking with status '${booking.bookingStatus}'. Must be CHECKED_IN.`);
    }

    const room = await Room.findById(booking.room);
    if (!room) {
      throw new Error('Room not found');
    }

    const guest = await Guest.findById(booking.guest);
    if (!guest) {
      throw new Error('Guest not found');
    }

    // Calculate incidentals & charges
    const food = dto.additionalCharges?.food || 0;
    const laundry = dto.additionalCharges?.laundry || 0;
    const spa = dto.additionalCharges?.spa || 0;
    const miniBar = dto.additionalCharges?.miniBar || 0;
    const other = dto.additionalCharges?.other || 0;

    const totalAdditional = food + laundry + spa + miniBar + other;
    const discount = dto.discount !== undefined ? dto.discount : booking.discount;

    const subtotal = booking.roomCharge + totalAdditional - discount;
    const tax = Math.round(Math.max(0, subtotal) * 0.12);
    const finalTotal = Math.max(0, subtotal + tax);

    // Compute balance remaining after existing advance/payments
    const outstandingBalance = Math.max(0, finalTotal - booking.paidAmount);

    // Record final settlement payment if balance > 0
    if (outstandingBalance > 0) {
      booking.paidAmount += outstandingBalance;
      booking.balanceAmount = 0;
      booking.paymentStatus = 'PAID';

      await Payment.create({
        paymentId: `PAY-${Date.now()}`,
        booking: booking._id,
        guest: guest._id,
        amount: outstandingBalance,
        type: 'FINAL_PAYMENT',
        method: dto.paymentMethod || 'CARD',
        status: 'PAID',
        transactionId: `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
        notes: `Final settlement upon checkout for booking ${booking.bookingId}`,
        receivedBy: dto.staffId as any,
      });
    } else {
      booking.paymentStatus = 'PAID';
      booking.balanceAmount = 0;
    }

    booking.additionalCharges = totalAdditional;
    booking.discount = discount;
    booking.tax = tax;
    booking.totalAmount = finalTotal;
    booking.bookingStatus = 'CHECKED_OUT';
    booking.actualCheckOut = new Date();
    await booking.save();

    // Prepare itemized charges for invoice
    const charges: IInvoiceCharge[] = [
      {
        name: `Accommodation Charges (${booking.roomCharge.toLocaleString()})`,
        quantity: 1,
        unitPrice: booking.roomCharge,
        amount: booking.roomCharge,
      },
    ];
    if (food > 0) charges.push({ name: 'Dining & In-Room Dining', quantity: 1, unitPrice: food, amount: food });
    if (laundry > 0) charges.push({ name: 'Valet & Laundry Services', quantity: 1, unitPrice: laundry, amount: laundry });
    if (spa > 0) charges.push({ name: 'Spa & Wellness Treatments', quantity: 1, unitPrice: spa, amount: spa });
    if (miniBar > 0) charges.push({ name: 'Mini-Bar & Refreshments', quantity: 1, unitPrice: miniBar, amount: miniBar });
    if (other > 0) charges.push({ name: 'Miscellaneous Concierge Services', quantity: 1, unitPrice: other, amount: other });

    // Generate Invoice
    const invoiceCount = await Invoice.countDocuments();
    const invoiceNumber = generateInvoiceNumber(invoiceCount + 1);

    const invoice = await Invoice.create({
      invoiceNumber,
      booking: booking._id,
      guest: guest._id,
      room: room._id,
      charges,
      subtotal: booking.roomCharge + totalAdditional,
      tax,
      discount,
      total: finalTotal,
      paidAmount: booking.paidAmount,
      balanceAmount: 0,
      issuedAt: new Date(),
      issuedBy: dto.staffId as any,
    });

    // Update Room State: OCCUPIED -> CLEANING
    room.status = 'CLEANING';
    room.currentGuest = null;
    room.currentBooking = null;
    await room.save();

    // Clear Guest currentBooking
    guest.currentBooking = null;
    await guest.save();

    // Automatically Create Housekeeping Task
    const housekeepingTask = await HousekeepingTask.create({
      room: room._id,
      status: 'CLEANING_REQUIRED',
      priority: 'HIGH',
      notes: `Guest ${guest.firstName} ${guest.lastName} checked out. Room turnaround required for new arrival.`,
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

    // Create Notification & Audit Log
    await Notification.create({
      title: 'Checkout Completed',
      message: `${guest.firstName} ${guest.lastName} checked out of Room ${room.roomNumber}. Room assigned to housekeeping.`,
      type: 'CHECKOUT',
      relatedId: booking.bookingId,
    });

    await AuditLog.create({
      user: dto.staffId as any,
      userName: dto.staffName || 'Front Desk',
      action: 'Guest Check-out',
      module: 'Check-out',
      entityId: booking._id.toString(),
      details: `Completed checkout for ${guest.firstName} ${guest.lastName} (Room ${room.roomNumber}). Folio total ₹${finalTotal.toLocaleString()} settled. Room assigned to Housekeeping.`,
    });

    return { booking, invoice, housekeepingTask };
  }
}
