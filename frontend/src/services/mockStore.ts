import { 
  Room, Guest, Booking, HousekeepingTask, MaintenanceIssue, Payment, Feedback, Staff, HotelSettings, AuditLog, RoomStatus 
} from '../types';

const INITIAL_ROOMS: Room[] = [
  {
    id: 'room-101',
    number: '101',
    type: 'Deluxe',
    floor: 1,
    pricePerNight: 5500,
    status: 'Reserved',
    amenities: ['King Bed', 'City View', 'High-Speed Wi-Fi', 'Smart TV', 'Mini Bar', 'Espresso Machine'],
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    maxOccupancy: 2,
    currentGuestId: 'guest-1',
    currentGuestName: 'John Mathew',
    currentBookingId: 'BK-7801',
    bedType: 'King Size',
    sizeSqFt: 420,
    description: 'Spacious deluxe room with panoramic city views, plush Egyptian cotton linens, and premium marble bathroom with rainfall shower.',
    rating: 4.8,
  },
  {
    id: 'room-102',
    number: '102',
    type: 'Deluxe',
    floor: 1,
    pricePerNight: 5500,
    status: 'Occupied',
    amenities: ['King Bed', 'Courtyard View', 'High-Speed Wi-Fi', 'Smart TV', 'Work Desk', 'Mini Bar'],
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    maxOccupancy: 2,
    currentGuestId: 'guest-2',
    currentGuestName: 'Anjali S',
    currentBookingId: 'bk-102',
    bedType: 'King Size',
    sizeSqFt: 430,
    description: 'Serene deluxe accommodation overlooking the tranquil royal courtyard garden, equipped with bespoke oak furnishings.',
    rating: 4.9,
  },
  {
    id: 'room-103',
    number: '103',
    type: 'Standard',
    floor: 1,
    pricePerNight: 3500,
    status: 'Cleaning',
    amenities: ['Queen Bed', 'Wi-Fi', 'Smart TV', 'Coffee Maker', 'Work Station'],
    image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
    maxOccupancy: 2,
    bedType: 'Queen Bed',
    sizeSqFt: 320,
    description: 'Cozy and well-appointed standard room ideal for business travelers or couples seeking comfortable luxury.',
    rating: 4.6,
  },
  {
    id: 'room-104',
    number: '104',
    type: 'Suite',
    floor: 1,
    pricePerNight: 9500,
    status: 'Reserved',
    amenities: ['King Bed', 'Separate Living Room', 'Jacuzzi', 'Balcony', 'Butler Service', 'Nespresso'],
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    maxOccupancy: 3,
    currentGuestId: 'guest-6',
    currentGuestName: 'Neha Khan',
    currentBookingId: 'BK-7812',
    bedType: 'California King',
    sizeSqFt: 650,
    description: 'Opulent suite featuring an expansive private terrace, separate dining and living salon, and a deep soaking whirlpool bath.',
    rating: 5.0,
  },
  {
    id: 'room-105',
    number: '105',
    type: 'Standard',
    floor: 1,
    pricePerNight: 3500,
    status: 'Occupied',
    amenities: ['Queen Bed', 'Garden View', 'Wi-Fi', 'Smart TV', 'Work Station'],
    image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80',
    maxOccupancy: 2,
    currentGuestId: 'guest-3',
    currentGuestName: 'Rahul Kumar',
    currentBookingId: 'bk-105',
    bedType: 'Queen Bed',
    sizeSqFt: 320,
    description: 'Quiet garden-facing standard room featuring soundproof architecture and ergonomic executive workspace.',
    rating: 4.7,
  },
  {
    id: 'room-106',
    number: '106',
    type: 'Deluxe',
    floor: 1,
    pricePerNight: 5500,
    status: 'Available',
    amenities: ['Twin Beds', 'City View', 'High-Speed Wi-Fi', 'Smart TV', 'Mini Bar'],
    image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
    maxOccupancy: 2,
    bedType: 'Twin Beds',
    sizeSqFt: 420,
    description: 'Twin deluxe room configured for colleagues or companions, offering bespoke amenities and skyline vistas.',
    rating: 4.7,
  },
  {
    id: 'room-107',
    number: '107',
    type: 'Standard',
    floor: 1,
    pricePerNight: 3500,
    status: 'Cleaning',
    amenities: ['Queen Bed', 'Wi-Fi', 'Smart TV', 'Coffee Maker'],
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
    maxOccupancy: 2,
    bedType: 'Queen Bed',
    sizeSqFt: 310,
    description: 'Elegantly furnished room with ambient warm lighting and soft luxury bath robes.',
    rating: 4.5,
  },
  {
    id: 'room-108',
    number: '108',
    type: 'Suite',
    floor: 1,
    pricePerNight: 9500,
    status: 'Maintenance',
    amenities: ['King Bed', 'Private Balcony', 'Living Lounge', 'Walk-in Closet', 'Wine Cooler'],
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
    maxOccupancy: 4,
    bedType: 'King Bed',
    sizeSqFt: 700,
    description: 'Executive luxury suite currently undergoing routine climate control sensor calibration and interior touchup.',
    rating: 4.9,
  },
  {
    id: 'room-201',
    number: '201',
    type: 'Deluxe',
    floor: 2,
    pricePerNight: 5800,
    status: 'Available',
    amenities: ['King Bed', 'Sea View', 'High-Speed Wi-Fi', 'Smart TV', 'Mini Bar'],
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
    maxOccupancy: 2,
    bedType: 'King Size',
    sizeSqFt: 450,
    description: 'Second floor elevated deluxe room showcasing azure horizon views with custom velvet chaise lounge.',
    rating: 4.85,
  },
  {
    id: 'room-204',
    number: '204',
    type: 'Suite',
    floor: 2,
    pricePerNight: 11000,
    status: 'Inspection',
    amenities: ['King Bed', 'Panoramic Horizon', 'Marble Bath', 'Dining Table', 'Sound System'],
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    maxOccupancy: 3,
    bedType: 'King Bed',
    sizeSqFt: 720,
    description: 'Turnover cleaning complete. Awaiting supervisor inspection sign-off.',
    rating: 4.95,
  },
  {
    id: 'room-301',
    number: '301',
    type: 'Executive Suite',
    floor: 3,
    pricePerNight: 14500,
    status: 'Occupied',
    amenities: ['King Bed', 'Penthouse Level View', 'Private Bar', 'Dedicated Concierge', 'Sauna'],
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    maxOccupancy: 4,
    currentGuestId: 'guest-5',
    currentGuestName: 'David Thomas',
    currentBookingId: 'bk-301',
    bedType: 'King Bed',
    sizeSqFt: 920,
    description: 'Executive floor sanctuary offering personal bar selection, steam sauna, and bespoke lounge service.',
    rating: 5.0,
  },
  {
    id: 'room-405',
    number: '405',
    type: 'Presidential Suite',
    floor: 4,
    pricePerNight: 24000,
    status: 'Available',
    amenities: ['Grand Master Bedroom', 'Private Infinity Plunge', 'Chef Kitchenette', 'Grand Piano', 'Security Antechamber'],
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    maxOccupancy: 6,
    bedType: 'Emperor Bed',
    sizeSqFt: 1650,
    description: 'The pinnacle of Royal Vista luxury, featuring 360-degree glass walls, infinity plunge pool, and private butler pantry.',
    rating: 5.0,
  }
];

const INITIAL_GUESTS: Guest[] = [
  {
    id: 'guest-1',
    name: 'John Mathew',
    phone: '+91 98451 20492',
    email: 'john.mathew@luxurytravel.in',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    address: '42 Crescent Heights, Indiranagar, Bangalore, Karnataka',
    idType: 'Passport',
    idNumberMasked: 'Z892••••31',
    vip: true,
    totalStays: 6,
    totalSpent: 148500,
    notes: 'Prefers high floor room away from elevator. Allergic to feather pillows (synthetic pillows only). Enjoys Darjeeling first-flush tea.',
    createdAt: '2025-11-10',
  },
  {
    id: 'guest-2',
    name: 'Anjali S',
    phone: '+91 97412 88301',
    email: 'anjali.s@designstudio.com',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    address: '15 Lotus Boulevard, Bandra West, Mumbai, Maharashtra',
    idType: 'Aadhaar',
    idNumberMasked: '•••• •••• 4912',
    vip: false,
    totalStays: 2,
    totalSpent: 38500,
    notes: 'Requested extra bath towels and late afternoon room makeup.',
    createdAt: '2026-02-14',
  },
  {
    id: 'guest-3',
    name: 'Rahul Kumar',
    phone: '+91 91234 56789',
    email: 'rahul.kumar@techventures.io',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    address: '88 Cyber Gateway, Hitech City, Hyderabad, Telangana',
    idType: 'Driving License',
    idNumberMasked: 'DL-04••••982',
    vip: false,
    totalStays: 4,
    totalSpent: 52000,
    notes: 'Frequent business traveler. Always requests quiet workspace and early express breakfast at 6:30 AM.',
    createdAt: '2026-01-20',
  },
  {
    id: 'guest-4',
    name: 'Sneha Pal',
    phone: '+91 99887 76655',
    email: 'sneha.pal@artisanheritage.org',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    address: '7B Southern Avenue, Ballygunge, Kolkata, West Bengal',
    idType: 'Passport',
    idNumberMasked: 'M401••••78',
    vip: true,
    totalStays: 5,
    totalSpent: 112000,
    notes: 'VIP art curator. Appreciates sparkling water replenished daily and fresh orchids.',
    createdAt: '2025-08-19',
  },
  {
    id: 'guest-5',
    name: 'David Thomas',
    phone: '+44 7700 900142',
    email: 'david.thomas@londoncapital.co.uk',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    address: '14 Kensington Gate, London, W8 5EP, United Kingdom',
    idType: 'Passport',
    idNumberMasked: 'GB-992••••01',
    vip: true,
    totalStays: 8,
    totalSpent: 345000,
    notes: 'Managing Director. Prefers private chauffeur airport pickup, single malt whiskey in suite bar.',
    createdAt: '2025-03-05',
  },
  {
    id: 'guest-6',
    name: 'Neha Khan',
    phone: '+91 98765 43210',
    email: 'neha.khan@globalmedia.in',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    address: '12 Golf Links, New Delhi',
    idType: 'Aadhaar',
    idNumberMasked: '•••• •••• 7821',
    vip: false,
    totalStays: 3,
    totalSpent: 42000,
    notes: 'Requested gluten-free breakfast items.',
    createdAt: '2026-04-12',
  },
  {
    id: 'guest-7',
    name: 'Aisha Khan',
    phone: '+91 94433 22110',
    email: 'aisha.khan@lifestylemag.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    address: '9 Marina Bay Road, Chennai, Tamil Nadu',
    idType: 'Passport',
    idNumberMasked: 'K652••••19',
    vip: true,
    totalStays: 9,
    totalSpent: 260000,
    notes: 'Lifestyle editor. Left 5-star review for royal vista hospitality.',
    createdAt: '2025-01-15',
  }
];

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'BK-7801',
    guestId: 'guest-1',
    guestName: 'John Mathew',
    guestPhone: '+91 98451 20492',
    guestEmail: 'john.mathew@luxurytravel.in',
    guestAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    roomId: 'room-101',
    roomNumber: '101',
    roomType: 'Deluxe',
    checkInDate: '2026-09-19',
    checkOutDate: '2026-09-22',
    arrivalTime: '12:00 PM',
    departureTime: '11:00 AM',
    adults: 2,
    children: 0,
    totalAmount: 18480,
    paidAmount: 10000,
    balanceAmount: 8480,
    taxAmount: 1980,
    discountAmount: 0,
    paymentStatus: 'Partial',
    status: 'Confirmed',
    specialRequests: 'High floor, feather-free pillows, airport pickup',
    notes: 'Arrival scheduled by flight 6E-402 at 11:15 AM.',
    paymentMethod: 'Card',
    createdAt: '2026-09-14',
  },
  {
    id: 'bk-102',
    guestId: 'guest-2',
    guestName: 'Anjali S',
    guestPhone: '+91 97412 88301',
    guestEmail: 'anjali.s@designstudio.com',
    guestAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    roomId: 'room-102',
    roomNumber: '102',
    roomType: 'Deluxe',
    checkInDate: '2026-09-17',
    checkOutDate: '2026-09-20',
    arrivalTime: '02:00 PM',
    departureTime: '11:00 AM',
    adults: 2,
    children: 1,
    totalAmount: 18480,
    paidAmount: 18480,
    balanceAmount: 0,
    taxAmount: 1980,
    discountAmount: 0,
    paymentStatus: 'Paid',
    status: 'Checked In',
    specialRequests: 'Extra crib for toddler',
    notes: 'Checked in by Riya on Sep 17.',
    paymentMethod: 'UPI',
    createdAt: '2026-09-12',
  },
  {
    id: 'bk-105',
    guestId: 'guest-3',
    guestName: 'Rahul Kumar',
    guestPhone: '+91 91234 56789',
    guestEmail: 'rahul.kumar@techventures.io',
    guestAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    roomId: 'room-105',
    roomNumber: '105',
    roomType: 'Standard',
    checkInDate: '2026-09-18',
    checkOutDate: '2026-09-21',
    arrivalTime: '03:30 PM',
    departureTime: '11:00 AM',
    adults: 1,
    children: 0,
    totalAmount: 11760,
    paidAmount: 11760,
    balanceAmount: 0,
    taxAmount: 1260,
    discountAmount: 0,
    paymentStatus: 'Paid',
    status: 'Checked In',
    specialRequests: 'Quiet room near high-speed router',
    notes: 'Working remote throughout stay.',
    paymentMethod: 'Card',
    createdAt: '2026-09-15',
  },
  {
    id: 'BK-7798',
    guestId: 'guest-4',
    guestName: 'Sneha Pal',
    guestPhone: '+91 99887 76655',
    guestEmail: 'sneha.pal@artisanheritage.org',
    guestAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    roomId: 'room-102',
    roomNumber: '102',
    roomType: 'Deluxe',
    checkInDate: '2026-09-16',
    checkOutDate: '2026-09-19',
    arrivalTime: '11:00 AM',
    departureTime: '11:00 AM',
    adults: 2,
    children: 0,
    totalAmount: 18480,
    paidAmount: 18480,
    balanceAmount: 0,
    taxAmount: 1980,
    discountAmount: 0,
    paymentStatus: 'Paid',
    status: 'Checked Out',
    notes: 'Checkout completed successfully at 11:00 AM.',
    paymentMethod: 'Card',
    createdAt: '2026-09-10',
  },
  {
    id: 'bk-301',
    guestId: 'guest-5',
    guestName: 'David Thomas',
    guestPhone: '+44 7700 900142',
    guestEmail: 'david.thomas@londoncapital.co.uk',
    guestAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    roomId: 'room-301',
    roomNumber: '301',
    roomType: 'Executive Suite',
    checkInDate: '2026-09-16',
    checkOutDate: '2026-09-23',
    arrivalTime: '01:00 PM',
    departureTime: '12:00 PM',
    adults: 2,
    children: 0,
    totalAmount: 113970,
    paidAmount: 50000,
    balanceAmount: 63970,
    taxAmount: 12210,
    discountAmount: 0,
    paymentStatus: 'Partial',
    status: 'Checked In',
    specialRequests: 'Chauffeur booking on Sep 20, business center access',
    paymentMethod: 'Online',
    createdAt: '2026-09-08',
  },
  {
    id: 'BK-7812',
    guestId: 'guest-6',
    guestName: 'Neha Khan',
    guestPhone: '+91 98765 43210',
    guestEmail: 'neha.khan@globalmedia.in',
    guestAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    roomId: 'room-104',
    roomNumber: '104',
    roomType: 'Suite',
    checkInDate: '2026-09-19',
    checkOutDate: '2026-09-22',
    arrivalTime: '02:30 PM',
    departureTime: '11:00 AM',
    adults: 2,
    children: 1,
    totalAmount: 31920,
    paidAmount: 15000,
    balanceAmount: 16920,
    taxAmount: 3420,
    discountAmount: 0,
    paymentStatus: 'Partial',
    status: 'Confirmed',
    specialRequests: 'Late checkout requested (subject to availability)',
    paymentMethod: 'UPI',
    createdAt: '2026-09-16',
  }
];

const STANDARD_CHECKLIST = [
  { id: 'c1', label: 'Bedroom cleaned & sanitised', completed: false },
  { id: 'c2', label: 'Bathroom scrubbed & descaled', completed: false },
  { id: 'c3', label: 'Plush towels replaced (4 bath, 2 hand)', completed: false },
  { id: 'c4', label: 'Luxury toiletries & amenities replenished', completed: false },
  { id: 'c5', label: 'Floors vacuumed & mopped', completed: false },
  { id: 'c6', label: 'Dustbins emptied with new bio-liners', completed: false },
  { id: 'c7', label: 'Mini bar, glassware & coffee bar restocked', completed: false },
  { id: 'c8', label: 'Lights, AC, TV & safety hardware checked', completed: false },
];

const INITIAL_TASKS: HousekeepingTask[] = [
  {
    id: 'hk-103',
    roomId: 'room-103',
    roomNumber: '103',
    roomType: 'Standard',
    taskType: 'Post Checkout',
    status: 'Cleaning Required',
    assignedStaffId: 'staff-3',
    assignedStaffName: 'Sunita Sharma',
    priority: 'High',
    checklist: STANDARD_CHECKLIST.map(item => ({ ...item })),
    notes: 'Guest checked out at 10:45 AM. Turnaround needed by 2 PM for 3 PM check-in.',
    updatedAt: '2026-09-19T08:30:00Z',
    timeEstimate: '35 mins',
  },
  {
    id: 'hk-107',
    roomId: 'room-107',
    roomNumber: '107',
    roomType: 'Standard',
    taskType: 'Routine Clean',
    status: 'In Progress',
    assignedStaffId: 'staff-3',
    assignedStaffName: 'Sunita Sharma',
    priority: 'Medium',
    checklist: STANDARD_CHECKLIST.map((item, idx) => ({ ...item, completed: idx < 4 })),
    notes: 'Deep vacuuming and linen change in progress.',
    updatedAt: '2026-09-19T09:15:00Z',
    timeEstimate: '40 mins',
  },
  {
    id: 'hk-204',
    roomId: 'room-204',
    roomNumber: '204',
    roomType: 'Suite',
    taskType: 'Deep Clean',
    status: 'Inspection',
    assignedStaffId: 'staff-4',
    assignedStaffName: 'Amit Patel',
    priority: 'High',
    checklist: STANDARD_CHECKLIST.map(item => ({ ...item, completed: true })),
    notes: 'Cleaning completed. Awaiting supervisor inspection sign-off.',
    updatedAt: '2026-09-19T09:40:00Z',
    timeEstimate: '15 mins',
  },
  {
    id: 'hk-405',
    roomId: 'room-405',
    roomNumber: '405',
    roomType: 'Presidential Suite',
    taskType: 'Deep Clean',
    status: 'Completed',
    assignedStaffId: 'staff-4',
    assignedStaffName: 'Amit Patel',
    priority: 'Urgent',
    checklist: STANDARD_CHECKLIST.map(item => ({ ...item, completed: true })),
    notes: 'Full presidential suite deep sanitized and scented with royal sandalwood mist.',
    updatedAt: '2026-09-19T07:50:00Z',
    timeEstimate: '60 mins',
  }
];

const INITIAL_MAINTENANCE: MaintenanceIssue[] = [
  {
    id: 'maint-108',
    roomId: 'room-108',
    roomNumber: '108',
    roomType: 'Suite',
    title: 'HVAC Climate Control Thermostat Calibration',
    description: 'The smart digital thermostat in the living lounge is reading 3°C above setpoint. Sensor calibration and filter check needed.',
    category: 'HVAC',
    priority: 'High',
    status: 'In Progress',
    assignedStaffId: 'staff-5',
    assignedStaffName: 'Carlos Mendez',
    reportedAt: '2026-09-18T14:20:00Z',
    costEstimate: 2400,
    notes: 'Replacement sensor valve dispatched from store.',
  },
  {
    id: 'maint-201',
    roomId: 'room-201',
    roomNumber: '201',
    roomType: 'Deluxe',
    title: 'Rainfall Shower Head Pressure Adjustment',
    description: 'Minor limescale buildup on the overhead master rainfall fixture reducing water flow slightly.',
    category: 'Plumbing',
    priority: 'Medium',
    status: 'Assigned',
    assignedStaffId: 'staff-5',
    assignedStaffName: 'Carlos Mendez',
    reportedAt: '2026-09-19T06:10:00Z',
    costEstimate: 800,
    notes: 'Scheduled for 11:30 AM after guest departs.',
  },
  {
    id: 'maint-106',
    roomId: 'room-106',
    roomNumber: '106',
    roomType: 'Deluxe',
    title: 'Balcony Door Handle Latch Tightening',
    description: 'Sliding glass door lock handle has minor play. Needs screw tightening and lubrication.',
    category: 'Carpentry',
    priority: 'Low',
    status: 'Fixed',
    assignedStaffId: 'staff-5',
    assignedStaffName: 'Carlos Mendez',
    reportedAt: '2026-09-17T11:00:00Z',
    resolvedAt: '2026-09-17T16:00:00Z',
    costEstimate: 300,
    notes: 'Tightened and test locked 5 times. Smooth operation.',
  }
];

const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay-001',
    transactionId: 'TXN-98210344',
    bookingId: 'BK-7801',
    guestId: 'guest-1',
    guestName: 'John Mathew',
    roomNumber: '101',
    amount: 10000,
    method: 'Card',
    status: 'Completed',
    date: '2026-09-14 15:42',
    invoiceNumber: 'INV-2026-8901',
    notes: 'Online booking deposit via HDFC Mastercard',
  },
  {
    id: 'pay-002',
    transactionId: 'TXN-98210345',
    bookingId: 'bk-102',
    guestId: 'guest-2',
    guestName: 'Anjali S',
    roomNumber: '102',
    amount: 18480,
    method: 'UPI',
    status: 'Completed',
    date: '2026-09-17 14:10',
    invoiceNumber: 'INV-2026-8902',
    notes: 'Settled via Google Pay UPI at Reception Desk',
  },
  {
    id: 'pay-003',
    transactionId: 'TXN-98210346',
    bookingId: 'bk-105',
    guestId: 'guest-3',
    guestName: 'Rahul Kumar',
    roomNumber: '105',
    amount: 11760,
    method: 'Card',
    status: 'Completed',
    date: '2026-09-18 15:35',
    invoiceNumber: 'INV-2026-8903',
    notes: 'Swipe at Front Desk POS Terminal 2',
  },
  {
    id: 'pay-004',
    transactionId: 'TXN-98210347',
    bookingId: 'bk-301',
    guestId: 'guest-5',
    guestName: 'David Thomas',
    roomNumber: '301',
    amount: 50000,
    method: 'Bank Transfer',
    status: 'Completed',
    date: '2026-09-16 11:20',
    invoiceNumber: 'INV-2026-8904',
    notes: 'Wire transfer advance for Executive Suite booking',
  },
  {
    id: 'pay-005',
    transactionId: 'TXN-98210348',
    bookingId: 'BK-7812',
    guestId: 'guest-6',
    guestName: 'Neha Khan',
    roomNumber: '104',
    amount: 15000,
    method: 'UPI',
    status: 'Completed',
    date: '2026-09-16 18:05',
    invoiceNumber: 'INV-2026-8905',
    notes: 'Advance deposit via PhonePe',
  }
];

const INITIAL_FEEDBACK: Feedback[] = [
  {
    id: 'fb-1',
    guestId: 'guest-7',
    guestName: 'Aisha Khan',
    guestAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    roomNumber: '104',
    rating: 5,
    cleanlinessRating: 5,
    staffRating: 5,
    roomRating: 5,
    serviceRating: 5,
    comment: 'Very clean rooms and friendly staff. Had a great stay. The champagne welcome and courteous front desk made our anniversary extraordinary.',
    date: '2026-09-15',
    response: 'Thank you for your generous words Aisha! It was an absolute delight hosting you and celebrating your special milestone with us.',
  },
  {
    id: 'fb-2',
    guestId: 'guest-5',
    guestName: 'David Thomas',
    guestAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    roomNumber: '301',
    rating: 5,
    cleanlinessRating: 5,
    staffRating: 5,
    roomRating: 5,
    serviceRating: 4.8,
    comment: 'Impeccable executive suite standard. The room acoustics and private lounge were perfect for high level business meetings.',
    date: '2026-09-12',
    response: 'We appreciate your esteemed patronage Mr. Thomas and look forward to welcoming you back next quarter.',
  },
  {
    id: 'fb-3',
    guestId: 'guest-4',
    guestName: 'Sneha Pal',
    guestAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    roomNumber: '102',
    rating: 4.5,
    cleanlinessRating: 5,
    staffRating: 4.5,
    roomRating: 4.5,
    serviceRating: 4.5,
    comment: 'The courtyard garden is splendid and serene. Housekeeping was prompt with organic lavender linen mist. Truly restful.',
    date: '2026-09-10',
    response: 'Thank you Sneha! Our garden team takes great pride in maintaining the sanctuary grounds.',
  },
  {
    id: 'fb-4',
    guestId: 'guest-2',
    guestName: 'Anjali S',
    guestAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    roomNumber: '102',
    rating: 4,
    cleanlinessRating: 4.5,
    staffRating: 4,
    roomRating: 4,
    serviceRating: 4,
    comment: 'Lovely ambiance and lighting. In-room dining pasta was delicious, though room service took about 10 minutes longer than estimated on Friday night.',
    date: '2026-09-08',
    response: 'Thank you for your constructive feedback Anjali. We have expanded our weekend kitchen line to ensure swifter delivery times.',
  }
];

const INITIAL_STAFF: Staff[] = [
  {
    id: 'staff-1',
    name: 'Riya Rahees',
    email: 'riya.rahees@royalvista.com',
    phone: '+91 98700 11223',
    role: 'Receptionist',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    department: 'Front Office',
    status: 'Active',
    lastActive: 'Just now',
    shift: 'Morning (6 AM - 2 PM)',
    joinDate: '2024-03-15',
  },
  {
    id: 'staff-2',
    name: 'Marcus Vance',
    email: 'marcus.vance@royalvista.com',
    phone: '+91 98700 11224',
    role: 'Manager',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    department: 'General Management',
    status: 'Active',
    lastActive: '12 mins ago',
    shift: 'Morning (6 AM - 2 PM)',
    joinDate: '2022-01-10',
  },
  {
    id: 'staff-3',
    name: 'Sunita Sharma',
    email: 'sunita.sharma@royalvista.com',
    phone: '+91 98700 11225',
    role: 'Housekeeping',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    department: 'Housekeeping & Laundry',
    status: 'Active',
    lastActive: '5 mins ago',
    shift: 'Morning (6 AM - 2 PM)',
    joinDate: '2023-06-01',
  },
  {
    id: 'staff-4',
    name: 'Amit Patel',
    email: 'amit.patel@royalvista.com',
    phone: '+91 98700 11226',
    role: 'Housekeeping',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    department: 'Housekeeping & Laundry',
    status: 'Active',
    lastActive: '15 mins ago',
    shift: 'Day (2 PM - 10 PM)',
    joinDate: '2024-01-18',
  },
  {
    id: 'staff-5',
    name: 'Carlos Mendez',
    email: 'carlos.mendez@royalvista.com',
    phone: '+91 98700 11227',
    role: 'Maintenance',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
    department: 'Engineering & Maintenance',
    status: 'Active',
    lastActive: '20 mins ago',
    shift: 'Morning (6 AM - 2 PM)',
    joinDate: '2023-09-12',
  },
  {
    id: 'staff-6',
    name: 'Priya Iyer',
    email: 'priya.iyer@royalvista.com',
    phone: '+91 98700 11228',
    role: 'Accountant',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    department: 'Finance & Accounts',
    status: 'Off Duty',
    lastActive: 'Yesterday',
    shift: 'Day (2 PM - 10 PM)',
    joinDate: '2022-11-20',
  }
];

const INITIAL_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    user: 'Riya Rahees',
    userRole: 'Receptionist',
    action: 'Checked In Guest',
    module: 'Check-in',
    timestamp: '2026-09-18T15:35:00Z',
    date: '2026-09-18',
    time: '03:35 PM',
    details: 'Checked in Rahul Kumar into Room 105 (Standard). Settled ₹11,760 via Card.',
  },
  {
    id: 'log-2',
    user: 'Riya Rahees',
    userRole: 'Receptionist',
    action: 'Checked Out Guest',
    module: 'Check-out',
    timestamp: '2026-09-19T11:00:00Z',
    date: '2026-09-19',
    time: '11:00 AM',
    details: 'Completed checkout for Sneha Pal (Room 102). Room moved to Cleaning Required.',
  },
  {
    id: 'log-3',
    user: 'Amit Patel',
    userRole: 'Housekeeping',
    action: 'Completed Cleaning Checklist',
    module: 'Housekeeping',
    timestamp: '2026-09-19T09:40:00Z',
    date: '2026-09-19',
    time: '09:40 AM',
    details: 'Room 204 cleaning finished. Submitted for supervisor inspection.',
  },
  {
    id: 'log-4',
    user: 'Marcus Vance',
    userRole: 'Manager',
    action: 'Approved Room Inspection',
    module: 'Inspection',
    timestamp: '2026-09-19T08:15:00Z',
    date: '2026-09-19',
    time: '08:15 AM',
    details: 'Room 405 Presidential Suite inspection approved. Marked Available.',
  },
  {
    id: 'log-5',
    user: 'Carlos Mendez',
    userRole: 'Maintenance',
    action: 'Logged Service Ticket',
    module: 'Maintenance',
    timestamp: '2026-09-18T14:20:00Z',
    date: '2026-09-18',
    time: '02:20 PM',
    details: 'Reported HVAC calibration ticket for Room 108. Room moved to Maintenance.',
  }
];

const INITIAL_SETTINGS: HotelSettings = {
  hotelName: 'ROYAL VISTA',
  subtitle: 'Hotel & Suites',
  tagline: 'Hospitality is not a service, it\'s a feeling.',
  address: '108 Grand Promenade, Royal Boulevard, Luxury Enclave',
  phone: '+91 80 4900 8888',
  email: 'concierge@royalvista-suites.com',
  website: 'https://www.royalvista-suites.com',
  checkInTime: '14:00',
  checkOutTime: '11:00',
  currency: '₹',
  taxRate: 12,
  serviceFeeRate: 5,
};

const STORAGE_KEYS = {
  ROOMS: 'royal_vista_rooms_v2',
  GUESTS: 'royal_vista_guests_v2',
  BOOKINGS: 'royal_vista_bookings_v2',
  TASKS: 'royal_vista_tasks_v2',
  MAINTENANCE: 'royal_vista_maintenance_v2',
  PAYMENTS: 'royal_vista_payments_v2',
  FEEDBACK: 'royal_vista_feedback_v2',
  STAFF: 'royal_vista_staff_v2',
  LOGS: 'royal_vista_logs_v2',
  SETTINGS: 'royal_vista_settings_v2',
  CURRENT_USER: 'royal_vista_current_user_v2',
};

export const DATA_CHANGE_EVENT = 'royal_vista_data_updated';

function dispatchUpdate(entity: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(DATA_CHANGE_EVENT, { detail: { entity } }));
  }
}

class MockStore {
  // Current Staff User for Role-Based Simulation
  getCurrentUser(): Staff {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!data) {
      const defaultUser = INITIAL_STAFF[0];
      this.setCurrentUser(defaultUser);
      return defaultUser;
    }
    return JSON.parse(data);
  }

  setCurrentUser(user: Staff): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    dispatchUpdate('currentUser');
  }

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    const data = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (!data) {
      this.setAuditLogs(INITIAL_LOGS);
      return INITIAL_LOGS;
    }
    return JSON.parse(data);
  }

  setAuditLogs(logs: AuditLog[]): void {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
    dispatchUpdate('logs');
  }

  logAction(action: string, module: AuditLog['module'], details: string): void {
    const user = this.getCurrentUser();
    const now = new Date();
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      user: user.name,
      userRole: user.role,
      action,
      module,
      timestamp: now.toISOString(),
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      details,
    };
    const logs = this.getAuditLogs();
    logs.unshift(newLog);
    this.setAuditLogs(logs);
  }

  // Rooms
  getRooms(): Room[] {
    const data = localStorage.getItem(STORAGE_KEYS.ROOMS);
    if (!data) {
      this.setRooms(INITIAL_ROOMS);
      return INITIAL_ROOMS;
    }
    return JSON.parse(data);
  }

  setRooms(rooms: Room[]): void {
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
    dispatchUpdate('rooms');
  }

  updateRoomStatus(roomId: string, status: RoomStatus, guestInfo?: { guestId?: string; guestName?: string; bookingId?: string }): Room | undefined {
    const rooms = this.getRooms();
    const index = rooms.findIndex(r => r.id === roomId || r.number === roomId);
    if (index !== -1) {
      const oldStatus = rooms[index].status;
      const isFreeStatus = status === 'Available' || status === 'Cleaning' || status === 'Maintenance' || status === 'Out of Service' || status === 'Inspection';

      rooms[index] = {
        ...rooms[index],
        status,
        currentGuestId: guestInfo?.guestId !== undefined ? guestInfo.guestId : (isFreeStatus ? undefined : rooms[index].currentGuestId),
        currentGuestName: guestInfo?.guestName !== undefined ? guestInfo.guestName : (isFreeStatus ? undefined : rooms[index].currentGuestName),
        currentBookingId: guestInfo?.bookingId !== undefined ? guestInfo.bookingId : (isFreeStatus ? undefined : rooms[index].currentBookingId),
      };
      this.setRooms(rooms);
      
      this.logAction(
        `Room Status Changed`,
        'Rooms',
        `Room ${rooms[index].number} transitioned from ${oldStatus} to ${status}.`
      );

      return rooms[index];
    }
    return undefined;
  }

  // Guests
  getGuests(): Guest[] {
    const data = localStorage.getItem(STORAGE_KEYS.GUESTS);
    if (!data) {
      this.setGuests(INITIAL_GUESTS);
      return INITIAL_GUESTS;
    }
    return JSON.parse(data);
  }

  setGuests(guests: Guest[]): void {
    localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(guests));
    dispatchUpdate('guests');
  }

  addGuest(guest: Omit<Guest, 'id' | 'createdAt' | 'totalStays' | 'totalSpent'>): Guest {
    const guests = this.getGuests();
    const newGuest: Guest = {
      ...guest,
      id: `guest-${Date.now()}`,
      totalStays: 1,
      totalSpent: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    guests.unshift(newGuest);
    this.setGuests(guests);

    this.logAction(
      `Registered New Guest`,
      'Guests',
      `Created profile for ${newGuest.name} (${newGuest.phone}).`
    );

    return newGuest;
  }

  updateGuest(id: string, updates: Partial<Guest>): Guest | undefined {
    const guests = this.getGuests();
    const index = guests.findIndex(g => g.id === id);
    if (index !== -1) {
      guests[index] = { ...guests[index], ...updates };
      this.setGuests(guests);

      this.logAction(
        `Updated Guest Profile`,
        'Guests',
        `Updated profile for ${guests[index].name}.`
      );

      return guests[index];
    }
    return undefined;
  }

  // Bookings
  getBookings(): Booking[] {
    const data = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    if (!data) {
      this.setBookings(INITIAL_BOOKINGS);
      return INITIAL_BOOKINGS;
    }
    return JSON.parse(data);
  }

  setBookings(bookings: Booking[]): void {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    dispatchUpdate('bookings');
  }

  addBooking(bookingData: Omit<Booking, 'id' | 'createdAt'>): Booking {
    const bookings = this.getBookings();
    const newBooking: Booking = {
      ...bookingData,
      id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    bookings.unshift(newBooking);
    this.setBookings(bookings);

    // CORE WORKFLOW: When a new booking is created, Room becomes RESERVED (or Occupied if already checked in)
    if (newBooking.status === 'Checked In') {
      this.updateRoomStatus(newBooking.roomId, 'Occupied', {
        guestId: newBooking.guestId,
        guestName: newBooking.guestName,
        bookingId: newBooking.id,
      });
    } else if (newBooking.status === 'Confirmed' || newBooking.status === 'Pending') {
      this.updateRoomStatus(newBooking.roomId, 'Reserved', {
        guestId: newBooking.guestId,
        guestName: newBooking.guestName,
        bookingId: newBooking.id,
      });
    }

    // Update guest total spent & stays record
    const guests = this.getGuests();
    const gIndex = guests.findIndex(g => g.id === newBooking.guestId || g.name === newBooking.guestName);
    if (gIndex !== -1) {
      guests[gIndex].totalSpent += newBooking.totalAmount;
      guests[gIndex].totalStays += 1;
      this.setGuests(guests);
    }

    this.logAction(
      `Created New Reservation`,
      'Bookings',
      `Booking ${newBooking.id} created for ${newBooking.guestName} in Room ${newBooking.roomNumber}. Room marked as Reserved.`
    );

    return newBooking;
  }

  updateBooking(id: string, updates: Partial<Booking>): Booking | undefined {
    const bookings = this.getBookings();
    const index = bookings.findIndex(b => b.id === id);
    if (index !== -1) {
      bookings[index] = { ...bookings[index], ...updates };
      this.setBookings(bookings);

      this.logAction(
        `Updated Reservation Details`,
        'Bookings',
        `Reservation ${id} updated.`
      );

      return bookings[index];
    }
    return undefined;
  }

  updateBookingStatus(bookingId: string, status: Booking['status'], paidAmountAdd?: number): Booking | undefined {
    const bookings = this.getBookings();
    const index = bookings.findIndex(b => b.id === bookingId);
    if (index !== -1) {
      const b = bookings[index];
      const newPaid = paidAmountAdd !== undefined ? b.paidAmount + paidAmountAdd : b.paidAmount;
      const newBalance = Math.max(0, b.totalAmount - newPaid);
      const newPaymentStatus = newBalance === 0 ? 'Paid' : newPaid > 0 ? 'Partial' : 'Pending';

      bookings[index] = {
        ...b,
        status,
        paidAmount: newPaid,
        balanceAmount: newBalance,
        paymentStatus: newPaymentStatus,
      };
      this.setBookings(bookings);

      // CORE WORKFLOW STATE TRANSITIONS:
      if (status === 'Checked In') {
        // Room becomes OCCUPIED
        this.updateRoomStatus(b.roomId, 'Occupied', {
          guestId: b.guestId,
          guestName: b.guestName,
          bookingId: b.id,
        });

        this.logAction(
          `Checked In Guest`,
          'Check-in',
          `Checked in ${b.guestName} into Room ${b.roomNumber}. Room status is now Occupied.`
        );
      } else if (status === 'Checked Out') {
        // Room becomes CLEANING
        this.updateRoomStatus(b.roomId, 'Cleaning');
        // Automatically create/queue a housekeeping task!
        this.createOrUpdateHousekeepingTaskForRoom(b.roomId, b.roomNumber, b.roomType, `Guest ${b.guestName} completed checkout. Room turnaround required.`);

        this.logAction(
          `Checked Out Guest`,
          'Check-out',
          `Completed checkout for ${b.guestName} (Room ${b.roomNumber}). Room moved to Cleaning Required.`
        );
      } else if (status === 'Cancelled' || status === 'No-show') {
        // If room was Reserved for this booking, return room to Available
        const rooms = this.getRooms();
        const r = rooms.find(rm => rm.id === b.roomId || rm.number === b.roomNumber);
        if (r && r.status === 'Reserved') {
          this.updateRoomStatus(b.roomId, 'Available');
        }

        this.logAction(
          `Reservation ${status}`,
          'Bookings',
          `Booking ${b.id} for ${b.guestName} marked as ${status}. Room released.`
        );
      }

      return bookings[index];
    }
    return undefined;
  }

  // Housekeeping
  getHousekeepingTasks(): HousekeepingTask[] {
    const data = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!data) {
      this.setHousekeepingTasks(INITIAL_TASKS);
      return INITIAL_TASKS;
    }
    return JSON.parse(data);
  }

  setHousekeepingTasks(tasks: HousekeepingTask[]): void {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    dispatchUpdate('housekeeping');
  }

  createOrUpdateHousekeepingTaskForRoom(roomId: string, roomNumber: string, roomType: Room['type'], note?: string): HousekeepingTask {
    const tasks = this.getHousekeepingTasks();
    const existingIndex = tasks.findIndex(t => (t.roomId === roomId || t.roomNumber === roomNumber) && t.status !== 'Completed');
    if (existingIndex !== -1) {
      tasks[existingIndex].status = 'Cleaning Required';
      tasks[existingIndex].updatedAt = new Date().toISOString();
      tasks[existingIndex].checklist = STANDARD_CHECKLIST.map(item => ({ ...item, completed: false }));
      if (note) tasks[existingIndex].notes = note;
      this.setHousekeepingTasks(tasks);
      return tasks[existingIndex];
    }

    const newTask: HousekeepingTask = {
      id: `hk-${roomNumber}-${Date.now()}`,
      roomId,
      roomNumber,
      roomType,
      taskType: 'Post Checkout',
      status: 'Cleaning Required',
      assignedStaffId: 'staff-3',
      assignedStaffName: 'Sunita Sharma',
      priority: 'High',
      checklist: STANDARD_CHECKLIST.map(item => ({ ...item, completed: false })),
      notes: note || `Room ${roomNumber} prepared for immediate deep cleaning turnaround.`,
      updatedAt: new Date().toISOString(),
      timeEstimate: '35 mins',
    };
    tasks.unshift(newTask);
    this.setHousekeepingTasks(tasks);
    return newTask;
  }

  updateHousekeepingTask(taskId: string, updates: Partial<HousekeepingTask>): HousekeepingTask | undefined {
    const tasks = this.getHousekeepingTasks();
    const index = tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      const updated = { ...tasks[index], ...updates, updatedAt: new Date().toISOString() };
      tasks[index] = updated;
      this.setHousekeepingTasks(tasks);

      // CORE WORKFLOW:
      if (updated.status === 'Completed') {
        // When inspection is approved & completed -> Room becomes AVAILABLE
        this.updateRoomStatus(updated.roomId, 'Available');
      } else if (updated.status === 'Inspection') {
        // Room status moves to INSPECTION
        this.updateRoomStatus(updated.roomId, 'Inspection');
      } else if (updated.status === 'In Progress' || updated.status === 'Cleaning Required') {
        this.updateRoomStatus(updated.roomId, 'Cleaning');
      }

      return updated;
    }
    return undefined;
  }

  // Room Inspection Workflow: Approve or Reject
  inspectRoom(taskId: string, approved: boolean, inspectionNotes: string, inspectorName: string): HousekeepingTask | undefined {
    const tasks = this.getHousekeepingTasks();
    const index = tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      const currentTask = tasks[index];
      if (approved) {
        currentTask.status = 'Completed';
        currentTask.inspectionNotes = inspectionNotes || 'All 8 checklist points verified and approved.';
        currentTask.inspectedBy = inspectorName;
        currentTask.updatedAt = new Date().toISOString();

        // Room becomes AVAILABLE
        this.updateRoomStatus(currentTask.roomId, 'Available');

        this.logAction(
          'Approved Room Inspection',
          'Inspection',
          `${inspectorName} approved inspection for Room ${currentTask.roomNumber}. Room is now Available for check-in.`
        );
      } else {
        // Rejection sends room back to CLEANING
        currentTask.status = 'Cleaning Required';
        currentTask.inspectionNotes = `Rejected: ${inspectionNotes || 'Requires re-cleaning.'}`;
        currentTask.inspectedBy = inspectorName;
        currentTask.checklist = currentTask.checklist.map(item => ({ ...item, completed: false }));
        currentTask.updatedAt = new Date().toISOString();

        // Room returns to CLEANING
        this.updateRoomStatus(currentTask.roomId, 'Cleaning');

        this.logAction(
          'Rejected Room Inspection',
          'Inspection',
          `${inspectorName} rejected inspection for Room ${currentTask.roomNumber}. Sent back to Cleaning.`
        );
      }

      tasks[index] = currentTask;
      this.setHousekeepingTasks(tasks);
      return currentTask;
    }
    return undefined;
  }

  // Maintenance
  getMaintenanceIssues(): MaintenanceIssue[] {
    const data = localStorage.getItem(STORAGE_KEYS.MAINTENANCE);
    if (!data) {
      this.setMaintenanceIssues(INITIAL_MAINTENANCE);
      return INITIAL_MAINTENANCE;
    }
    return JSON.parse(data);
  }

  setMaintenanceIssues(issues: MaintenanceIssue[]): void {
    localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(issues));
    dispatchUpdate('maintenance');
  }

  addMaintenanceIssue(issue: Omit<MaintenanceIssue, 'id' | 'reportedAt'>): MaintenanceIssue {
    const issues = this.getMaintenanceIssues();
    const newIssue: MaintenanceIssue = {
      ...issue,
      id: `maint-${Date.now()}`,
      reportedAt: new Date().toISOString(),
    };
    issues.unshift(newIssue);
    this.setMaintenanceIssues(issues);

    if (newIssue.status !== 'Verified' && newIssue.status !== 'Fixed') {
      this.updateRoomStatus(newIssue.roomId, 'Maintenance');
    }

    this.logAction(
      'Reported Maintenance Issue',
      'Maintenance',
      `Logged ${newIssue.priority} priority ticket "${newIssue.title}" for Room ${newIssue.roomNumber}.`
    );

    return newIssue;
  }

  updateMaintenanceIssue(issueId: string, updates: Partial<MaintenanceIssue>): MaintenanceIssue | undefined {
    const issues = this.getMaintenanceIssues();
    const index = issues.findIndex(i => i.id === issueId);
    if (index !== -1) {
      const updated = { ...issues[index], ...updates };
      if (updated.status === 'Fixed' || updated.status === 'Verified') {
        updated.resolvedAt = new Date().toISOString();
        this.updateRoomStatus(updated.roomId, 'Available');
      } else {
        this.updateRoomStatus(updated.roomId, 'Maintenance');
      }
      issues[index] = updated;
      this.setMaintenanceIssues(issues);

      this.logAction(
        'Updated Maintenance Issue',
        'Maintenance',
        `Ticket "${updated.title}" for Room ${updated.roomNumber} updated to ${updated.status}.`
      );

      return updated;
    }
    return undefined;
  }

  // Payments
  getPayments(): Payment[] {
    const data = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    if (!data) {
      this.setPayments(INITIAL_PAYMENTS);
      return INITIAL_PAYMENTS;
    }
    return JSON.parse(data);
  }

  setPayments(payments: Payment[]): void {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
    dispatchUpdate('payments');
  }

  addPayment(payment: Omit<Payment, 'id' | 'transactionId' | 'invoiceNumber' | 'date'>): Payment {
    const payments = this.getPayments();
    const newPayment: Payment = {
      ...payment,
      id: `pay-${Date.now()}`,
      transactionId: `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
      invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    payments.unshift(newPayment);
    this.setPayments(payments);

    this.logAction(
      'Recorded Payment Settlement',
      'Payments',
      `Received ₹${newPayment.amount.toLocaleString()} via ${newPayment.method} for Room ${newPayment.roomNumber} (${newPayment.guestName}).`
    );

    return newPayment;
  }

  // Feedback
  getFeedback(): Feedback[] {
    const data = localStorage.getItem(STORAGE_KEYS.FEEDBACK);
    if (!data) {
      this.setFeedback(INITIAL_FEEDBACK);
      return INITIAL_FEEDBACK;
    }
    return JSON.parse(data);
  }

  setFeedback(feedback: Feedback[]): void {
    localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(feedback));
    dispatchUpdate('feedback');
  }

  // Staff
  getStaff(): Staff[] {
    const data = localStorage.getItem(STORAGE_KEYS.STAFF);
    if (!data) {
      this.setStaff(INITIAL_STAFF);
      return INITIAL_STAFF;
    }
    return JSON.parse(data);
  }

  setStaff(staff: Staff[]): void {
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff));
    dispatchUpdate('staff');
  }

  addStaff(member: Omit<Staff, 'id' | 'joinDate' | 'lastActive'>): Staff {
    const staff = this.getStaff();
    const newStaff: Staff = {
      ...member,
      id: `staff-${Date.now()}`,
      joinDate: new Date().toISOString().split('T')[0],
      lastActive: 'Just now',
    };
    staff.unshift(newStaff);
    this.setStaff(staff);
    return newStaff;
  }

  updateStaff(id: string, updates: Partial<Staff>): Staff | undefined {
    const staff = this.getStaff();
    const index = staff.findIndex(s => s.id === id);
    if (index !== -1) {
      staff[index] = { ...staff[index], ...updates };
      this.setStaff(staff);
      return staff[index];
    }
    return undefined;
  }

  // Settings
  getSettings(): HotelSettings {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!data) {
      this.setSettings(INITIAL_SETTINGS);
      return INITIAL_SETTINGS;
    }
    return JSON.parse(data);
  }

  setSettings(settings: HotelSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    dispatchUpdate('settings');
  }

  // Reset to initial demo state
  resetAllData(): void {
    this.setRooms(INITIAL_ROOMS);
    this.setGuests(INITIAL_GUESTS);
    this.setBookings(INITIAL_BOOKINGS);
    this.setHousekeepingTasks(INITIAL_TASKS);
    this.setMaintenanceIssues(INITIAL_MAINTENANCE);
    this.setPayments(INITIAL_PAYMENTS);
    this.setFeedback(INITIAL_FEEDBACK);
    this.setStaff(INITIAL_STAFF);
    this.setAuditLogs(INITIAL_LOGS);
    this.setSettings(INITIAL_SETTINGS);
    this.setCurrentUser(INITIAL_STAFF[0]);
    dispatchUpdate('all');
  }
}

export const mockStore = new MockStore();
