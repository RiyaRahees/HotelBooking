export type RoomType = 'Standard' | 'Deluxe' | 'Suite' | 'Executive Suite' | 'Presidential Suite';

export type RoomStatus =
  | 'Available'
  | 'Reserved'
  | 'Occupied'
  | 'Cleaning'
  | 'Inspection'
  | 'Maintenance'
  | 'Out of Service';

export interface Room {
  id: string;
  number: string;
  type: RoomType;
  floor: number;
  pricePerNight: number;
  status: RoomStatus;
  amenities: string[];
  image: string;
  maxOccupancy: number;
  currentGuestId?: string;
  currentGuestName?: string;
  currentBookingId?: string;
  bedType: string;
  sizeSqFt: number;
  description: string;
  rating?: number;
}

export interface Guest {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  address: string;
  idType: 'Passport' | 'Driving License' | 'National ID' | 'Aadhaar';
  idNumberMasked: string;
  vip: boolean;
  totalStays: number;
  totalSpent: number;
  notes: string;
  createdAt: string;
}

export type BookingStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Checked In'
  | 'Checked Out'
  | 'Cancelled'
  | 'No-show';

export type PaymentStatus = 'Paid' | 'Partial' | 'Pending' | 'Refunded' | 'Failed';
export type PaymentMethod = 'Card' | 'UPI' | 'Cash' | 'Bank Transfer' | 'Online';

export interface Booking {
  id: string;
  guestId: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  guestAvatar: string;
  roomId: string;
  roomNumber: string;
  roomType: RoomType;
  checkInDate: string;
  checkOutDate: string;
  arrivalTime?: string;
  departureTime?: string;
  adults: number;
  children: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  taxAmount: number;
  discountAmount: number;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  specialRequests?: string;
  notes?: string;
  paymentMethod?: PaymentMethod;
  createdAt: string;
}

export type HousekeepingStatus = 'Cleaning Required' | 'In Progress' | 'Inspection' | 'Completed';

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

export interface HousekeepingTask {
  id: string;
  roomId: string;
  roomNumber: string;
  roomType: RoomType;
  taskType: 'Routine Clean' | 'Deep Clean' | 'Turn-down' | 'Post Checkout' | 'Inspection';
  status: HousekeepingStatus;
  assignedStaffId?: string;
  assignedStaffName?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  checklist: ChecklistItem[];
  notes?: string;
  inspectionNotes?: string;
  inspectedBy?: string;
  updatedAt: string;
  timeEstimate: string;
}

export type MaintenancePriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type MaintenanceStatus = 'Open' | 'Assigned' | 'In Progress' | 'Fixed' | 'Verified';
export type MaintenanceCategory = 'Plumbing' | 'Electrical' | 'HVAC' | 'Carpentry' | 'Appliance' | 'Other';

export interface MaintenanceIssue {
  id: string;
  roomId: string;
  roomNumber: string;
  roomType: RoomType;
  title: string;
  description: string;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  assignedStaffId?: string;
  assignedStaffName?: string;
  reportedAt: string;
  resolvedAt?: string;
  costEstimate?: number;
  notes?: string;
}

export interface Payment {
  id: string;
  transactionId: string;
  bookingId: string;
  guestId: string;
  guestName: string;
  guestAvatar?: string;
  roomNumber: string;
  amount: number;
  method: PaymentMethod;
  status: 'Completed' | 'Pending' | 'Failed' | 'Refunded';
  date: string;
  invoiceNumber: string;
  notes?: string;
}

export interface Feedback {
  id: string;
  guestId: string;
  guestName: string;
  guestAvatar: string;
  roomNumber: string;
  rating: number; // 1-5
  cleanlinessRating: number;
  staffRating: number;
  roomRating: number;
  serviceRating: number;
  comment: string;
  date: string;
  response?: string;
}

export type StaffRole = 'Admin' | 'Manager' | 'Receptionist' | 'Housekeeping' | 'Maintenance' | 'Accountant';
export type StaffStatus = 'Active' | 'On Leave' | 'Off Duty';

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  avatar: string;
  department: string;
  status: StaffStatus;
  lastActive: string;
  shift: 'Morning (6 AM - 2 PM)' | 'Day (2 PM - 10 PM)' | 'Night (10 PM - 6 AM)';
  joinDate: string;
}

export interface AuditLog {
  id: string;
  user: string;
  userRole: string;
  action: string;
  module:
    | 'Bookings'
    | 'Rooms'
    | 'Check-in'
    | 'Check-out'
    | 'Housekeeping'
    | 'Inspection'
    | 'Maintenance'
    | 'Payments'
    | 'Guests'
    | 'Staff'
    | 'Settings';
  timestamp: string;
  date: string;
  time: string;
  details: string;
}

export interface HotelSettings {
  hotelName: string;
  subtitle: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  checkInTime: string;
  checkOutTime: string;
  currency: string;
  taxRate: number; // percentage e.g. 12%
  serviceFeeRate: number;
}
