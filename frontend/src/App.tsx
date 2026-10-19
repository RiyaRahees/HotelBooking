import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Rooms } from './pages/Rooms';
import { RoomDetails } from './pages/RoomDetails';
import { Bookings } from './pages/Bookings';
import { NewBooking } from './pages/NewBooking';
import { BookingDetails } from './pages/BookingDetails';
import { Guests } from './pages/Guests';
import { GuestProfile } from './pages/GuestProfile';
import { CheckIn } from './pages/CheckIn';
import { CheckOut } from './pages/CheckOut';
import { Housekeeping } from './pages/Housekeeping';
import { HousekeepingDetails } from './pages/HousekeepingDetails';
import { Maintenance } from './pages/Maintenance';
import { MaintenanceDetails } from './pages/MaintenanceDetails';
import { Payments } from './pages/Payments';
import { PaymentDetails } from './pages/PaymentDetails';
import { Feedback } from './pages/Feedback';
import { Staff } from './pages/Staff';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Rooms */}
        <Route path="rooms" element={<Rooms />} />
        <Route path="rooms/:id" element={<RoomDetails />} />
        
        {/* Bookings */}
        <Route path="bookings" element={<Bookings />} />
        <Route path="bookings/new" element={<NewBooking />} />
        <Route path="bookings/:id" element={<BookingDetails />} />
        
        {/* Guests */}
        <Route path="guests" element={<Guests />} />
        <Route path="guests/:id" element={<GuestProfile />} />
        
        {/* Operations */}
        <Route path="check-in" element={<CheckIn />} />
        <Route path="check-out" element={<CheckOut />} />
        
        {/* Housekeeping */}
        <Route path="housekeeping" element={<Housekeeping />} />
        <Route path="housekeeping/:id" element={<HousekeepingDetails />} />
        
        {/* Maintenance */}
        <Route path="maintenance" element={<Maintenance />} />
        <Route path="maintenance/:id" element={<MaintenanceDetails />} />
        
        {/* Financials & Staff */}
        <Route path="payments" element={<Payments />} />
        <Route path="payments/:id" element={<PaymentDetails />} />
        <Route path="feedback" element={<Feedback />} />
        <Route path="staff" element={<Staff />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};
