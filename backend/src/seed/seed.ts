import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { Role } from '../models/Role.js';
import { RoomType } from '../models/RoomType.js';
import { Room } from '../models/Room.js';
import { Guest } from '../models/Guest.js';
import { Booking } from '../models/Booking.js';
import { Payment } from '../models/Payment.js';
import { Invoice } from '../models/Invoice.js';
import { HousekeepingTask } from '../models/HousekeepingTask.js';
import { MaintenanceIssue } from '../models/MaintenanceIssue.js';
import { Feedback } from '../models/Feedback.js';
import { Notification } from '../models/Notification.js';
import { AuditLog } from '../models/AuditLog.js';

const seedDatabase = async () => {
  try {
    console.log(`[Seed] Connecting to MongoDB: ${env.MONGODB_URI}...`);
    await mongoose.connect(env.MONGODB_URI);
    console.log('[Seed] Connected successfully.');

    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Role.deleteMany({}),
      RoomType.deleteMany({}),
      Room.deleteMany({}),
      Guest.deleteMany({}),
      Booking.deleteMany({}),
      Payment.deleteMany({}),
      Invoice.deleteMany({}),
      HousekeepingTask.deleteMany({}),
      MaintenanceIssue.deleteMany({}),
      Feedback.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);

    // 1. Seed Roles with granular module permissions
    console.log('[Seed] Creating Roles with module permissions...');
    const allModules: Array<
      | 'dashboard'
      | 'rooms'
      | 'roomTypes'
      | 'bookings'
      | 'guests'
      | 'checkin'
      | 'checkout'
      | 'payments'
      | 'invoices'
      | 'housekeeping'
      | 'maintenance'
      | 'feedback'
      | 'staff'
      | 'reports'
      | 'notifications'
      | 'settings'
      | 'auditLogs'
    > = [
      'dashboard',
      'rooms',
      'roomTypes',
      'bookings',
      'guests',
      'checkin',
      'checkout',
      'payments',
      'invoices',
      'housekeeping',
      'maintenance',
      'feedback',
      'staff',
      'reports',
      'notifications',
      'settings',
      'auditLogs',
    ];

    const makePermissions = (readMods: string[], writeMods: string[]) =>
      allModules.map((mod) => ({
        module: mod,
        read: readMods.includes(mod) || readMods.includes('*'),
        write: writeMods.includes(mod) || writeMods.includes('*'),
        update: writeMods.includes(mod) || writeMods.includes('*'),
        delete: writeMods.includes(mod) || writeMods.includes('*'),
      }));

    const roles = await Role.create([
      {
        name: 'ADMIN',
        description: 'Full executive system access and configuration control',
        permissions: makePermissions(['*'], ['*']),
      },
      {
        name: 'MANAGER',
        description: 'Operational oversight of rooms, reservations, guests, staff, and financial reports',
        permissions: makePermissions(
          ['*'],
          ['dashboard', 'rooms', 'roomTypes', 'bookings', 'guests', 'checkin', 'checkout', 'feedback', 'staff', 'reports', 'notifications', 'auditLogs']
        ),
      },
      {
        name: 'RECEPTIONIST',
        description: 'Front desk guest check-in, check-out, bookings, and billing',
        permissions: makePermissions(
          ['dashboard', 'rooms', 'roomTypes', 'bookings', 'guests', 'checkin', 'checkout', 'payments', 'invoices', 'notifications'],
          ['bookings', 'guests', 'checkin', 'checkout', 'payments', 'invoices']
        ),
      },
      {
        name: 'HOUSEKEEPING',
        description: 'Room cleaning, sanitization checklist turnaround, and inspections',
        permissions: makePermissions(
          ['dashboard', 'rooms', 'housekeeping', 'maintenance', 'notifications'],
          ['housekeeping', 'maintenance']
        ),
      },
      {
        name: 'MAINTENANCE',
        description: 'Engineering, facility repairs, and asset maintenance',
        permissions: makePermissions(
          ['dashboard', 'rooms', 'maintenance', 'notifications'],
          ['maintenance']
        ),
      },
      {
        name: 'ACCOUNTANT',
        description: 'Financial ledger, invoicing, tax records, and revenue analytics',
        permissions: makePermissions(
          ['dashboard', 'bookings', 'guests', 'payments', 'invoices', 'reports', 'notifications'],
          ['payments', 'invoices']
        ),
      },
    ]);

    // 2. Seed Staff Users (Password for all: Password@123)
    console.log('[Seed] Creating Staff Accounts...');
    const defaultPassword = 'Password@123';

    const [adminUser, managerUser, receptionistUser, housekeeperUser, maintenanceUser, accountantUser] = await Promise.all([
      User.create({
        firstName: 'Marcus',
        lastName: 'Vance',
        email: 'marcus.vance@royalvista.com',
        phone: '+91 98765 00001',
        password: defaultPassword,
        role: 'ADMIN',
        department: 'Executive Management',
        status: 'ACTIVE',
      }),
      User.create({
        firstName: 'Elena',
        lastName: 'Rostova',
        email: 'elena.rostova@royalvista.com',
        phone: '+91 98765 00002',
        password: defaultPassword,
        role: 'MANAGER',
        department: 'Hotel Operations',
        status: 'ACTIVE',
      }),
      User.create({
        firstName: 'Riya',
        lastName: 'Rahees',
        email: 'riya.rahees@royalvista.com',
        phone: '+91 98765 00003',
        password: defaultPassword,
        role: 'RECEPTIONIST',
        department: 'Front Office',
        status: 'ACTIVE',
      }),
      User.create({
        firstName: 'Sunita',
        lastName: 'Sharma',
        email: 'sunita.sharma@royalvista.com',
        phone: '+91 98765 00004',
        password: defaultPassword,
        role: 'HOUSEKEEPING',
        department: 'Housekeeping',
        status: 'ACTIVE',
      }),
      User.create({
        firstName: 'Rajesh',
        lastName: 'Verma',
        email: 'rajesh.verma@royalvista.com',
        phone: '+91 98765 00005',
        password: defaultPassword,
        role: 'MAINTENANCE',
        department: 'Engineering & Maintenance',
        status: 'ACTIVE',
      }),
      User.create({
        firstName: 'Arjun',
        lastName: 'Nair',
        email: 'arjun.nair@royalvista.com',
        phone: '+91 98765 00006',
        password: defaultPassword,
        role: 'ACCOUNTANT',
        department: 'Finance & Accounts',
        status: 'ACTIVE',
      }),
    ]);

    // 3. Seed Room Types
    console.log('[Seed] Creating Room Types...');
    const [standardType, deluxeType, premiumType, suiteType, familySuiteType] = await Promise.all([
      RoomType.create({
        name: 'Standard',
        description: 'Cozy and well-appointed room for business or leisure travelers',
        basePrice: 3500,
        capacity: 2,
        amenities: ['Queen Bed', 'Wi-Fi', 'Smart TV', 'Coffee Maker', 'Work Station'],
        images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80'],
      }),
      RoomType.create({
        name: 'Deluxe',
        description: 'Spacious deluxe room with panoramic city views and bespoke oak furnishings',
        basePrice: 5500,
        capacity: 2,
        amenities: ['King Bed', 'City View', 'High-Speed Wi-Fi', 'Smart TV', 'Mini Bar', 'Espresso Machine'],
        images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'],
      }),
      RoomType.create({
        name: 'Premium',
        description: 'Elevated luxury with premium marble bathroom and private balcony',
        basePrice: 7500,
        capacity: 2,
        amenities: ['King Bed', 'Balcony', 'Nespresso', 'Rain Shower', 'Smart Automation', 'Butler Service'],
        images: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80'],
      }),
      RoomType.create({
        name: 'Suite',
        description: 'Opulent suite featuring an expansive private terrace and separate living salon',
        basePrice: 9500,
        capacity: 3,
        amenities: ['King Bed', 'Separate Living Room', 'Jacuzzi', 'Balcony', 'Butler Service', 'Nespresso'],
        images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'],
      }),
      RoomType.create({
        name: 'Family Suite',
        description: 'Two interconnected luxury bedrooms designed for families and group stays',
        basePrice: 14000,
        capacity: 4,
        amenities: ['2 King Beds', 'Dining Table', 'Kitchenette', 'Dual Bathrooms', 'Children Play Area'],
        images: ['https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80'],
      }),
    ]);

    // 4. Seed Guests
    console.log('[Seed] Creating Guests...');
    const [guestJohn, guestAnjali, guestRahul, guestVikram] = await Promise.all([
      Guest.create({
        firstName: 'John',
        lastName: 'Mathew',
        phone: '+91 98450 12345',
        email: 'john.mathew@example.com',
        address: '42 MG Road, Bengaluru, Karnataka',
        nationality: 'Indian',
        idType: 'Passport',
        idNumber: 'P8923412',
        vip: true,
        notes: 'Prefers high floor with city view, allergic to feather pillows.',
      }),
      Guest.create({
        firstName: 'Anjali',
        lastName: 'Sharma',
        phone: '+91 98201 54321',
        email: 'anjali.s@example.com',
        address: '15 Marine Drive, Mumbai, Maharashtra',
        nationality: 'Indian',
        idType: 'Aadhaar',
        idNumber: '984512348765',
        vip: true,
        notes: 'Celebrating anniversary, requested complimentary sparkling water.',
      }),
      Guest.create({
        firstName: 'Rahul',
        lastName: 'Kumar',
        phone: '+91 99100 87654',
        email: 'rahul.k@example.com',
        address: '77 Golf Links, New Delhi',
        nationality: 'Indian',
        idType: 'Driving License',
        idNumber: 'DL142011001234',
        vip: false,
        notes: 'Corporate guest attending technology symposium.',
      }),
      Guest.create({
        firstName: 'Vikram',
        lastName: 'Malhotra',
        phone: '+91 98765 43210',
        email: 'vikram.malhotra@example.com',
        address: '10 Park Street, Kolkata, West Bengal',
        nationality: 'Indian',
        idType: 'Passport',
        idNumber: 'Z1234567',
        vip: true,
        notes: 'Frequent VIP guest, requires express check-in.',
      }),
    ]);

    // 5. Seed Rooms
    console.log('[Seed] Creating Rooms...');
    const [room101, room102, room103, room104, room105, room106, room107, room108] = await Promise.all([
      Room.create({
        roomNumber: '101',
        roomType: deluxeType._id,
        floor: 1,
        pricePerNight: 5500,
        status: 'AVAILABLE',
        amenities: deluxeType.amenities,
        images: deluxeType.images,
        description: deluxeType.description,
        bedType: 'King Bed',
        sizeSqFt: 420,
      }),
      Room.create({
        roomNumber: '102',
        roomType: deluxeType._id,
        floor: 1,
        pricePerNight: 5500,
        status: 'OCCUPIED',
        amenities: deluxeType.amenities,
        images: deluxeType.images,
        description: deluxeType.description,
        bedType: 'King Bed',
        sizeSqFt: 430,
        currentGuest: guestAnjali._id,
      }),
      Room.create({
        roomNumber: '103',
        roomType: standardType._id,
        floor: 1,
        pricePerNight: 3500,
        status: 'CLEANING',
        amenities: standardType.amenities,
        images: standardType.images,
        description: standardType.description,
        bedType: 'Queen Bed',
        sizeSqFt: 320,
      }),
      Room.create({
        roomNumber: '104',
        roomType: suiteType._id,
        floor: 1,
        pricePerNight: 9500,
        status: 'AVAILABLE',
        amenities: suiteType.amenities,
        images: suiteType.images,
        description: suiteType.description,
        bedType: 'California King',
        sizeSqFt: 650,
      }),
      Room.create({
        roomNumber: '105',
        roomType: standardType._id,
        floor: 1,
        pricePerNight: 3500,
        status: 'OCCUPIED',
        amenities: standardType.amenities,
        images: standardType.images,
        description: standardType.description,
        bedType: 'Queen Bed',
        sizeSqFt: 320,
        currentGuest: guestRahul._id,
      }),
      Room.create({
        roomNumber: '106',
        roomType: deluxeType._id,
        floor: 1,
        pricePerNight: 5500,
        status: 'AVAILABLE',
        amenities: deluxeType.amenities,
        images: deluxeType.images,
        description: deluxeType.description,
        bedType: 'Twin Beds',
        sizeSqFt: 420,
      }),
      Room.create({
        roomNumber: '107',
        roomType: standardType._id,
        floor: 1,
        pricePerNight: 3500,
        status: 'CLEANING',
        amenities: standardType.amenities,
        images: standardType.images,
        description: standardType.description,
        bedType: 'Queen Bed',
        sizeSqFt: 310,
      }),
      Room.create({
        roomNumber: '108',
        roomType: suiteType._id,
        floor: 1,
        pricePerNight: 9500,
        status: 'MAINTENANCE',
        amenities: suiteType.amenities,
        images: suiteType.images,
        description: suiteType.description,
        bedType: 'California King',
        sizeSqFt: 650,
      }),
    ]);

    // 6. Seed Bookings
    console.log('[Seed] Creating Bookings...');
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const inThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const [booking1, booking2] = await Promise.all([
      Booking.create({
        bookingId: 'BK-7801',
        guest: guestAnjali._id,
        room: room102._id,
        roomType: deluxeType._id,
        checkInDate: now,
        checkOutDate: inThreeDays,
        actualCheckIn: now,
        adults: 2,
        children: 0,
        roomCharge: 16500,
        tax: 1980,
        totalAmount: 18480,
        advanceAmount: 5000,
        paidAmount: 5000,
        balanceAmount: 13480,
        paymentStatus: 'PARTIALLY_PAID',
        bookingStatus: 'CHECKED_IN',
        createdBy: receptionistUser._id,
      }),
      Booking.create({
        bookingId: 'BK-7802',
        guest: guestRahul._id,
        room: room105._id,
        roomType: standardType._id,
        checkInDate: now,
        checkOutDate: tomorrow,
        actualCheckIn: now,
        adults: 1,
        children: 0,
        roomCharge: 3500,
        tax: 420,
        totalAmount: 3920,
        advanceAmount: 3920,
        paidAmount: 3920,
        balanceAmount: 0,
        paymentStatus: 'PAID',
        bookingStatus: 'CHECKED_IN',
        createdBy: receptionistUser._id,
      }),
    ]);

    // Link current bookings to rooms and guests
    room102.currentBooking = booking1._id;
    await room102.save();
    guestAnjali.currentBooking = booking1._id;
    await guestAnjali.save();

    room105.currentBooking = booking2._id;
    await room105.save();
    guestRahul.currentBooking = booking2._id;
    await guestRahul.save();

    // 7. Seed Payments
    console.log('[Seed] Creating Payments...');
    await Promise.all([
      Payment.create({
        paymentId: 'PAY-1001',
        booking: booking1._id,
        guest: guestAnjali._id,
        amount: 5000,
        type: 'ADVANCE',
        method: 'CARD',
        status: 'PAID',
        transactionId: 'TXN-98451230',
        receivedBy: receptionistUser._id,
      }),
      Payment.create({
        paymentId: 'PAY-1002',
        booking: booking2._id,
        guest: guestRahul._id,
        amount: 3920,
        type: 'ROOM',
        method: 'UPI',
        status: 'PAID',
        transactionId: 'TXN-87654321',
        receivedBy: receptionistUser._id,
      }),
    ]);

    // 8. Seed Housekeeping Tasks
    console.log('[Seed] Creating Housekeeping Tasks...');
    await Promise.all([
      HousekeepingTask.create({
        room: room103._id,
        assignedTo: housekeeperUser._id,
        status: 'CLEANING_REQUIRED',
        priority: 'HIGH',
        notes: 'Departure cleaning requested. Sanitize room thoroughly.',
      }),
      HousekeepingTask.create({
        room: room107._id,
        assignedTo: housekeeperUser._id,
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        notes: 'Mid-stay linen refresh and vanity cleaning.',
        checklist: {
          bedroom: true,
          bathroom: true,
          towels: true,
          toiletries: false,
          floor: false,
          dustbin: true,
          amenities: false,
          damage: false,
        },
      }),
    ]);

    // 9. Seed Maintenance Issues
    console.log('[Seed] Creating Maintenance Tickets...');
    await MaintenanceIssue.create({
      room: room108._id,
      title: 'Master Jacuzzi Pressure Sensor Calibration',
      description: 'Jacuzzi jet pressure alert triggered during morning diagnostic run.',
      priority: 'HIGH',
      assignedTo: maintenanceUser._id,
      status: 'IN_PROGRESS',
    });

    // 10. Seed Feedback
    console.log('[Seed] Creating Guest Feedback...');
    await Feedback.create({
      guest: guestJohn._id,
      room: room101._id,
      overallRating: 5,
      cleanlinessRating: 5,
      roomRating: 5,
      staffRating: 5,
      serviceRating: 5,
      comments: 'Impeccable service, royal ambiance, and the staff made our stay unforgettable!',
    });

    // 11. Seed Audit Logs
    console.log('[Seed] Creating Operational Audit Logs...');
    await Promise.all([
      AuditLog.create({
        user: receptionistUser._id,
        userName: 'Riya Rahees',
        action: 'Guest Check-in',
        module: 'Check-in',
        entityId: booking1._id.toString(),
        details: 'Riya checked in Anjali Sharma into Room 102. Keycards encoded and deposit recorded.',
      }),
      AuditLog.create({
        user: receptionistUser._id,
        userName: 'Riya Rahees',
        action: 'Guest Check-in',
        module: 'Check-in',
        entityId: booking2._id.toString(),
        details: 'Riya checked in Rahul Kumar into Room 105. Room status updated to Occupied.',
      }),
    ]);

    console.log('==================================================');
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log('--------------------------------------------------');
    console.log('Staff Credentials:');
    console.log('Admin:        marcus.vance@royalvista.com     | Password@123');
    console.log('Manager:      elena.rostova@royalvista.com    | Password@123');
    console.log('Receptionist: riya.rahees@royalvista.com      | Password@123');
    console.log('Housekeeper:  sunita.sharma@royalvista.com    | Password@123');
    console.log('Technician:   rajesh.verma@royalvista.com     | Password@123');
    console.log('Accountant:   arjun.nair@royalvista.com       | Password@123');
    console.log('==================================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error);
    process.exit(1);
  }
};

seedDatabase();
