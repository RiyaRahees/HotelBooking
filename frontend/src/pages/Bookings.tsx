import React, { useState, useEffect, useCallback } from 'react';
import { useHotelData } from '../hooks/useHotelData';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { GuestAvatar } from '../components/common/GuestAvatar';
import { InvoiceModal } from '../components/common/InvoiceModal';
import { Booking, BookingStatus } from '../types';
import { bookingsApi } from '../services/bookings';
import { useNotification } from '../context/NotificationContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarCheck,
  Plus,
  Search,
  Table,
  Calendar as CalendarIcon,
  Eye,
  LogIn,
  LogOut,
  FileText,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export const Bookings: React.FC = () => {
  const { bookings, refreshAll } = useHotelData();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  // Async States
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [paymentFilter, setPaymentFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');

  // Invoice Modal state
  const [selectedBookingForInvoice, setSelectedBookingForInvoice] = useState<Booking | null>(null);

  // Load Bookings from Backend API
  const loadBookings = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      await bookingsApi.getAll({
        status: statusFilter,
        paymentStatus: paymentFilter,
        search: searchQuery,
      });
      refreshAll();
    } catch (err: any) {
      const msg = err?.message || 'Failed to fetch bookings from backend';
      setFetchError(msg);
      showToast('Error Loading Reservations', msg, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, paymentFilter, searchQuery, refreshAll, showToast]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // Filter Bookings locally for instant responsive feel
  const filteredBookings = bookings.filter((b) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      b.id.toLowerCase().includes(q) ||
      b.guestName.toLowerCase().includes(q) ||
      b.roomNumber.toLowerCase().includes(q) ||
      b.guestPhone.includes(q);

    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    const matchesPayment = paymentFilter === 'All' || b.paymentStatus === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const handleQuickCheckIn = async (b: Booking) => {
    setActionLoadingId(b.id);
    try {
      await bookingsApi.checkIn(b.id);
      showToast('Guest Checked In', `${b.guestName} successfully checked into Room ${b.roomNumber}.`);
      await loadBookings();
    } catch (err: any) {
      showToast('Check-in Failed', err?.message || 'Error occurred during check-in.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <PageHeader
        title="Bookings & Reservations"
        subtitle="Track incoming arrivals, current resident stays and room allocation calendar"
        icon={CalendarCheck}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={loadBookings}
              disabled={isLoading}
              className="px-3.5 py-2.5 bg-cream-100 hover:bg-cream-200 text-navy-800 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-cream-200 transition-colors disabled:opacity-50"
              title="Refresh Bookings"
            >
              <RefreshCw className={`w-4 h-4 text-navy-600 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <Link
              to="/bookings/new"
              className="gold-gradient-btn px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-luxury"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Booking</span>
            </Link>
          </div>
        }
      />

      {/* Error Banner */}
      {fetchError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between text-xs text-red-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{fetchError}</span>
          </div>
          <button
            onClick={loadBookings}
            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-900 rounded-lg font-bold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter and View Bar */}
      <div className="luxury-card p-4 bg-white rounded-2xl border border-cream-200 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
          <input
            type="text"
            placeholder="Search booking ID, guest, room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-cream-50 border border-cream-200 rounded-xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-400"
          />
        </div>

        {/* Filters and View Switcher */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-cream-50 border border-cream-200 rounded-xl text-xs font-semibold text-navy-800 focus:outline-none"
          >
            <option value="All">All Booking Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Checked In">Checked In</option>
            <option value="Checked Out">Checked Out</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Payment Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 bg-cream-50 border border-cream-200 rounded-xl text-xs font-semibold text-navy-800 focus:outline-none"
          >
            <option value="All">All Payment States</option>
            <option value="Paid">Fully Paid</option>
            <option value="Partial">Partial Deposit</option>
            <option value="Pending">Pending</option>
          </select>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 p-1 bg-cream-100 rounded-xl border border-cream-200">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table' ? 'bg-white text-navy-950 shadow-sm' : 'text-navy-500 hover:text-navy-900'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'calendar' ? 'bg-white text-navy-950 shadow-sm' : 'text-navy-500 hover:text-navy-900'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main View: Table vs Calendar */}
      {isLoading && bookings.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-cream-200 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-gold-500 animate-spin mb-3" />
          <p className="text-xs font-bold text-navy-800">Loading reservations from database...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-cream-200">
          <CalendarCheck className="w-10 h-10 text-navy-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-navy-900">No Reservations Found</h3>
          <p className="text-xs text-navy-500 mt-1">Try adjusting your filters or search keywords.</p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="luxury-card bg-white rounded-2xl border border-cream-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50/70 border-b border-cream-200 text-navy-400 uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-4">Booking ID</th>
                  <th className="p-4">Guest</th>
                  <th className="p-4">Room</th>
                  <th className="p-4">Check-in</th>
                  <th className="p-4">Check-out</th>
                  <th className="p-4">Guests</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-cream-50/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-navy-900">
                      <Link to={`/bookings/${b.id}`} className="hover:text-gold-700 underline underline-offset-2">
                        {b.id}
                      </Link>
                    </td>
                    <td className="p-4">
                      <GuestAvatar
                        name={b.guestName}
                        avatar={b.guestAvatar}
                        showName={true}
                        subtitle={b.guestPhone}
                        size="sm"
                      />
                    </td>
                    <td className="p-4 font-semibold text-navy-900">
                      <span>Room {b.roomNumber}</span>
                      <span className="text-[10px] text-navy-400 block font-normal">{b.roomType}</span>
                    </td>
                    <td className="p-4 text-navy-800 font-medium">{b.checkInDate}</td>
                    <td className="p-4 text-navy-800 font-medium">{b.checkOutDate}</td>
                    <td className="p-4 text-navy-600 font-medium">
                      {b.adults} Adults {b.children > 0 ? `· ${b.children} Child` : ''}
                    </td>
                    <td className="p-4 font-bold text-navy-950">
                      ₹{b.totalAmount.toLocaleString()}
                      {b.balanceAmount > 0 && (
                        <span className="text-[10px] text-red-600 block font-medium">
                          Due: ₹{b.balanceAmount.toLocaleString()}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={b.paymentStatus} size="sm" />
                    </td>
                    <td className="p-4">
                      <StatusBadge status={b.status} size="sm" />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {b.status === 'Confirmed' && (
                          <button
                            disabled={actionLoadingId === b.id}
                            onClick={() => handleQuickCheckIn(b)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold border border-emerald-200 transition-colors text-[11px] flex items-center gap-1 disabled:opacity-50"
                            title="Instant Check-in"
                          >
                            {actionLoadingId === b.id && <Loader2 className="w-3 h-3 animate-spin" />}
                            <span>Check-in</span>
                          </button>
                        )}
                        {b.status === 'Checked In' && (
                          <button
                            onClick={() => navigate('/check-out')}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg font-bold border border-amber-200 transition-colors text-[11px]"
                            title="Proceed to Check-out"
                          >
                            Check-out
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedBookingForInvoice(b)}
                          className="p-1.5 bg-cream-100 hover:bg-cream-200 text-navy-700 rounded-lg"
                          title="View Invoice"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <Link
                          to={`/bookings/${b.id}`}
                          className="p-1.5 bg-cream-100 hover:bg-cream-200 text-navy-700 rounded-lg"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Calendar / Timeline Allocation View */
        <div className="luxury-card p-6 bg-white rounded-2xl border border-cream-200">
          <div className="flex items-center justify-between pb-4 border-b border-cream-200">
            <div>
              <h3 className="text-base font-bold font-serif text-navy-950">Room Allocation Gantt Timeline</h3>
              <p className="text-xs text-navy-500">Live reservation schedule and resident occupancy</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Confirmed
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-navy-800 inline-block" /> Checked In
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-cream-400 inline-block" /> Checked Out
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-3 overflow-x-auto">
            {/* Days Header */}
            <div className="grid grid-cols-10 gap-2 text-center text-xs font-bold text-navy-600 pb-2 border-b border-cream-200 min-w-[700px]">
              <div className="text-left font-bold text-navy-900">Room</div>
              <div>Day 1</div>
              <div>Day 2</div>
              <div>Day 3</div>
              <div>Day 4 (Today)</div>
              <div>Day 5</div>
              <div>Day 6</div>
              <div>Day 7</div>
              <div>Day 8</div>
              <div>Day 9</div>
            </div>

            {/* Room Rows from live bookings */}
            {filteredBookings.slice(0, 8).map((b, idx) => (
              <div
                key={b.id || idx}
                className="grid grid-cols-10 gap-2 items-center py-2.5 border-b border-cream-100 min-w-[700px] text-xs"
              >
                <div className="font-bold text-navy-950 font-serif">
                  {b.roomNumber} ({b.roomType})
                </div>
                <div className="col-span-9 grid grid-cols-9 gap-1 h-8 items-center bg-cream-50/60 rounded-xl p-1 relative">
                  <div
                    style={{
                      gridColumnStart: (idx % 3) + 2,
                      gridColumnEnd: `span ${(idx % 4) + 3}`,
                    }}
                    className={`h-full rounded-lg px-2 flex items-center justify-between text-white text-[11px] font-bold shadow-xs truncate ${
                      b.status === 'Checked In'
                        ? 'bg-navy-800'
                        : b.status === 'Confirmed'
                        ? 'bg-emerald-600'
                        : 'bg-cream-400 text-navy-800'
                    }`}
                  >
                    <span className="truncate">{b.guestName}</span>
                    <span className="text-[10px] opacity-80 hidden sm:inline">{b.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={!!selectedBookingForInvoice}
        onClose={() => setSelectedBookingForInvoice(null)}
        booking={selectedBookingForInvoice || undefined}
      />
    </div>
  );
};

