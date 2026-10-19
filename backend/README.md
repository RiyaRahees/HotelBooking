# 🏰 ROYAL VISTA Hotel Management System (HMS) — REST API & Backend

A production-ready, clean, scalable, and modular Hotel Management System (HMS) backend built with **Node.js**, **Express.js**, **TypeScript**, and **MongoDB / Mongoose**.

---

## 🛠️ Technology Stack

- **Runtime**: Node.js (>= v18)
- **Framework**: Express.js
- **Language**: TypeScript (ES2022 / NodeNext)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with secure HTTP-only cookies
- **Password Hashing**: bcryptjs (Salt rounds: 10)
- **Validation**: Zod
- **Security**: Helmet, CORS, Express Rate Limiting
- **Logging**: Morgan

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.ts                  # MongoDB connection with retry handling
│   │   └── env.ts                 # Validated environment configuration
│   ├── controllers/               # Express request handlers
│   │   ├── auth.controller.ts
│   │   ├── users.controller.ts
│   │   ├── rooms.controller.ts
│   │   ├── roomTypes.controller.ts
│   │   ├── guests.controller.ts
│   │   ├── bookings.controller.ts
│   │   ├── checkin.controller.ts
│   │   ├── checkout.controller.ts
│   │   ├── payments.controller.ts
│   │   ├── invoices.controller.ts
│   │   ├── housekeeping.controller.ts
│   │   ├── maintenance.controller.ts
│   │   ├── feedback.controller.ts
│   │   ├── notifications.controller.ts
│   │   ├── reports.controller.ts
│   │   ├── auditLogs.controller.ts
│   │   └── search.controller.ts
│   ├── models/                    # Mongoose database schemas with indexes
│   │   ├── User.ts
│   │   ├── Role.ts
│   │   ├── Room.ts
│   │   ├── RoomType.ts
│   │   ├── Guest.ts
│   │   ├── Booking.ts
│   │   ├── Payment.ts
│   │   ├── Invoice.ts
│   │   ├── HousekeepingTask.ts
│   │   ├── MaintenanceIssue.ts
│   │   ├── Feedback.ts
│   │   ├── Notification.ts
│   │   └── AuditLog.ts
│   ├── routes/                    # REST endpoint definitions
│   ├── middleware/                # Auth, RBAC, Error, and Validation middlewares
│   ├── validations/               # Zod request validation schemas
│   ├── services/                  # Business logic (checkin, checkout, booking, housekeeping)
│   ├── utils/                     # ApiResponse, pagination, ID generators
│   ├── seed/                      # Database seed script
│   ├── app.ts                     # Express application setup & middleware stack
│   └── server.ts                  # Server entrypoint
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## ⚙️ Environment Variables

Create a `.env` file inside `/backend` (or copy `.env.example`):

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/royal_vista
JWT_SECRET=royal_vista_super_secret_jwt_key_2026_production_ready
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5174
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Seed Database with Realistic Demo Data
```bash
npm run seed
```

### 3. Start Development Server (with auto-reload)
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🔑 Test Credentials (Default Password: `Password@123`)

| Role | Name | Email | Permissions |
| :--- | :--- | :--- | :--- |
| **ADMIN** | Marcus Vance | `marcus.vance@royalvista.com` | Full system access & configurations |
| **MANAGER** | Elena Rostova | `elena.rostova@royalvista.com` | Dashboard, Rooms, Bookings, Guests, Reports, Staff |
| **RECEPTIONIST** | Riya Rahees | `riya.rahees@royalvista.com` | Bookings, Guests, Check-in, Check-out, Payments |
| **HOUSEKEEPING** | Sunita Sharma | `sunita.sharma@royalvista.com` | Housekeeping tasks, 8-point checklist, Cleaning status |
| **MAINTENANCE** | Rajesh Verma | `rajesh.verma@royalvista.com` | Maintenance tickets, repairs, facility status |
| **ACCOUNTANT** | Arjun Nair | `arjun.nair@royalvista.com` | Financial ledger, Invoicing, Tax, Revenue reports |

---

## 📡 REST API Reference

### Standard Response Formats

#### Success (200 / 201)
```json
{
  "success": true,
  "message": "Rooms fetched successfully",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 8,
    "totalPages": 1
  }
}
```

#### Error (400 / 401 / 403 / 404 / 500)
```json
{
  "success": false,
  "message": "Room not found",
  "errors": []
}
```

---

### Endpoint Matrix

#### 1. Authentication (`/api/auth`)
- `POST /api/auth/login` — Authenticate user, set HTTP-only cookie, return safe user & token
- `POST /api/auth/logout` — Clear auth cookie
- `GET  /api/auth/me` — Retrieve current authenticated session
- `POST /api/auth/refresh` — Refresh authentication token

#### 2. Staff & Users (`/api/users`)
- `GET    /api/users` — List staff with role & status filters
- `GET    /api/users/:id` — Get staff member details
- `POST   /api/users` — Add new staff user
- `PATCH  /api/users/:id` — Update staff profile/role
- `DELETE /api/users/:id` — Deactivate staff account

#### 3. Rooms & Room Types (`/api/rooms`, `/api/room-types`)
- `GET    /api/room-types` — List room tiers (Standard, Deluxe, Premium, Suite, Family Suite)
- `POST   /api/room-types` — Create room tier
- `GET    /api/rooms` — List rooms with filters (status, floor, type, search)
- `GET    /api/rooms/:id` — Room details with active stay reference
- `POST   /api/rooms` — Add new room
- `PATCH  /api/rooms/:id` — Update room specs
- `PATCH  /api/rooms/:id/status` — Update room status (`AVAILABLE`, `RESERVED`, `OCCUPIED`, `CLEANING`, `INSPECTION`, `MAINTENANCE`, `OUT_OF_SERVICE`)
- `DELETE /api/rooms/:id` — Delete room (if unoccupied)

#### 4. Guests (`/api/guests`)
- `GET    /api/guests` — Search guest directory, VIP filter
- `GET    /api/guests/:id` — Guest profile with stay history, payments, feedback, total spend
- `POST   /api/guests` — Register guest
- `PATCH  /api/guests/:id` — Update guest details
- `DELETE /api/guests/:id` — Remove guest profile

#### 5. Bookings & Operations (`/api/bookings`)
- `GET    /api/bookings` — Filter by status (`CONFIRMED`, `CHECKED_IN`, `CHECKED_OUT`, `CANCELLED`), dates
- `GET    /api/bookings/:id` — Reservation details with billing summary
- `POST   /api/bookings` — Create booking (automatically sets Room to `RESERVED`)
- `PATCH  /api/bookings/:id` — Update reservation
- `PATCH  /api/bookings/:id/status` — Transition status
- `DELETE /api/bookings/:id` — Cancel booking and release room to `AVAILABLE`

#### 6. Core Hotel Lifecycle Engine
- `POST /api/checkin` — Check in guest: updates Booking to `CHECKED_IN`, Room to `OCCUPIED`, logs activity
- `POST /api/checkout` — Check out guest: calculates folio, records final payment, sets Booking to `CHECKED_OUT`, Room to `CLEANING`, auto-generates Housekeeping task & Tax Invoice (`INV-2026-XXXX`)

#### 7. Housekeeping & Inspection (`/api/housekeeping`)
- `GET   /api/housekeeping` — Task queue with status & priority filters
- `GET   /api/housekeeping/:id` — Task details with 8-point sanitization checklist
- `POST  /api/housekeeping` — Create custom cleaning task
- `PATCH /api/housekeeping/:id` — Update checklist items
- `PATCH /api/housekeeping/:id/status` — Move task (`IN_PROGRESS` -> `INSPECTION`)
- `POST  /api/housekeeping/:id/inspect` — Supervisor Inspection:
  - If **Approved**: Room becomes `AVAILABLE` (Inventory released)
  - If **Rejected**: Room returns to `CLEANING` with supervisor notes

#### 8. Maintenance (`/api/maintenance`)
- `GET   /api/maintenance` — Filter tickets by status (`OPEN`, `ASSIGNED`, `IN_PROGRESS`, `FIXED`, `VERIFIED`) and priority (`LOW`, `MEDIUM`, `HIGH`, `URGENT`)
- `POST  /api/maintenance` — Report issue (sets Room to `MAINTENANCE`)
- `PATCH /api/maintenance/:id/status` — Update status (resolving ticket restores Room to `AVAILABLE`)

#### 9. Payments & Invoices (`/api/payments`, `/api/invoices`)
- `GET  /api/payments` — Financial ledger, search by txn/id
- `GET  /api/payments/:id` — Payment receipt
- `POST /api/payments` — Record payment (Cash, Card, UPI, Online)
- `GET  /api/invoices` — List generated tax invoices
- `GET  /api/invoices/:id` — Invoice folio breakdown
- `GET  /api/invoices/booking/:bookingId` — Get invoice for booking

#### 10. Dashboard, Analytics & Search
- `GET /api/dashboard` — Complete operational stats (KPIs, room counts, arrivals, departures, revenue, recent logs)
- `GET /api/reports/occupancy` — Occupancy rate and 7-day trend
- `GET /api/reports/revenue` — Monthly revenue, ADR, channel distribution
- `GET /api/reports/bookings` — Reservation distribution
- `GET /api/reports/housekeeping` — Cleaning turnaround performance
- `GET /api/reports/maintenance` — Maintenance resolution stats
- `GET /api/reports/feedback` — Cleanliness, room, staff, service ratings
- `GET /api/search?q=` — Global search across Guests, Rooms, and Bookings
- `GET /api/notifications` — Unread notifications
- `GET /api/audit-logs` — Operational audit trail

---

## 🛡️ Security & Quality Standards
- Strict TypeScript configuration with 0 compile errors
- HTTP-only cookie JWT delivery prevents XSS token theft
- Role-based authorization at the route level
- Rate limiting prevents brute force and DDoS attempts
- Standardized error middleware prevents leak of internal stack traces
