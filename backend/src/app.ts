import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error.middleware.js';
import { notFoundHandler } from './middleware/notFound.middleware.js';

// Route Imports
import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';
import roomTypesRoutes from './routes/roomTypes.routes.js';
import roomsRoutes from './routes/rooms.routes.js';
import guestsRoutes from './routes/guests.routes.js';
import bookingsRoutes from './routes/bookings.routes.js';
import checkinRoutes from './routes/checkin.routes.js';
import checkoutRoutes from './routes/checkout.routes.js';
import housekeepingRoutes from './routes/housekeeping.routes.js';
import maintenanceRoutes from './routes/maintenance.routes.js';
import paymentsRoutes from './routes/payments.routes.js';
import invoicesRoutes from './routes/invoices.routes.js';
import feedbackRoutes from './routes/feedback.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';
import auditLogsRoutes from './routes/auditLogs.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import reportsRoutes from './routes/reports.routes.js';
import searchRoutes from './routes/search.routes.js';

const app = express();

// Security Middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: [env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5174'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});
app.use('/api', limiter);

// Request parsing & Logging
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ROYAL VISTA HMS Backend API is running healthy',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/room-types', roomTypesRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/guests', guestsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/checkin', checkinRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/housekeeping', housekeepingRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/audit-logs', auditLogsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/search', searchRoutes);

// 404 and Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
