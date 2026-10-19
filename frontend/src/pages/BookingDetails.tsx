import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useHotelData } from '../hooks/useHotelData';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { GuestAvatar } from '../components/common/GuestAvatar';
import { InvoiceModal } from '../components/common/InvoiceModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Modal } from '../components/common/Modal';
import { bookingsApi } from '../services/bookings';
import { useNotification } from '../context/NotificationContext';
import {
  CalendarCheck,
  ChevronLeft,
  LogIn,
  LogOut,
  FileText,
  CreditCard,
  BedDouble,
  User,
  Calendar,
  XCircle,
  Phone,
  Mail,
  MapPin,
  Edit,
  UserX,
  Loader2,
} from 'lucide-react';
import { Booking, BookingStatus } from '../types';

export const BookingDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { refreshAll } = useHotelData();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [noShowDialogOpen, setNoShowDialogOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Edit fields
  const [editSpecialRequests, setEditSpecialRequests] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editAdults, setEditAdults] = useState(2);
  const [editChildren, setEditChildren] = useState(0);

  const fetchBooking = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await bookingsApi.getById(id);
      if (data) {
        setBooking(data);
        setEditSpecialRequests(data.specialRequests || '');
        setEditNotes(data.notes || '');
        setEditAdults(data.adults || 2);
        setEditChildren(data.children || 0);
      } else {
        setError('Booking not found');
      }
    } catch (err: any) {
      console.error('Failed to fetch booking', err);
      setError(err.message || 'Failed to load booking details');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-12 bg-white rounded-2xl border border-cream-200">
        <Loader2 className="w-8 h-8 text-gold-600 animate-spin mb-3" />
        <p className="text-xs font-bold text-navy-800">Loading reservation details...</p>
      </div>
    );
  }

  if (!booking || error) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-cream-200">
        <h3 className="text-lg font-bold text-navy-900">Reservation Not Found</h3>
        <p className="text-xs text-navy-500 mt-1">No booking found with identifier {id}.</p>
        <Link to="/bookings" className="mt-4 inline-block gold-gradient-btn px-4 py-2 rounded-xl text-xs font-bold">
          Back to Bookings
        </Link>
      </div>
    );
  }

  const handleCheckIn = async () => {
    try {
      await bookingsApi.checkIn(booking.id);
      showToast('Checked In', `${booking.guestName} has been checked into Room ${booking.roomNumber}.`);
      fetchBooking();
      refreshAll();
    } catch (err: any) {
      showToast('Check-in Failed', err.response?.data?.message || err.message, 'error');
    }
  };

  const handleCancelReservation = async () => {
    try {
      await bookingsApi.cancel(booking.id, 'Cancelled by receptionist');
      showToast('Reservation Cancelled', `Booking ${booking.id} cancelled. Room released.`);
      setCancelDialogOpen(false);
      fetchBooking();
      refreshAll();
    } catch (err: any) {
      showToast('Cancellation Failed', err.response?.data?.message || err.message, 'error');
    }
  };

  const handleNoShow = async () => {
    try {
      await bookingsApi.updateStatus(booking.id, 'No-show');
      showToast('Marked as No-show', `Booking ${booking.id} marked as No-show. Room released.`);
      setNoShowDialogOpen(false);
      fetchBooking();
      refreshAll();
    } catch (err: any) {
      showToast('Update Failed', err.response?.data?.message || err.message, 'error');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await bookingsApi.update(booking.id, {
        specialRequests: editSpecialRequests,
        notes: editNotes,
        adults: Number(editAdults),
        children: Number(editChildren),
      });

      showToast('Reservation Updated', `Details for booking ${booking.id} updated.`);
      setEditModalOpen(false);
      fetchBooking();
      refreshAll();
    } catch (err: any) {
      showToast('Update Failed', err.response?.data?.message || err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <Link
        to="/bookings"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-600 hover:text-gold-700 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Bookings</span>
      </Link>

      <PageHeader
        title={`Reservation #${booking.id}`}
        subtitle={`Reserved for ${booking.guestName} · Room ${booking.roomNumber}`}
        badge={booking.status}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditModalOpen(true)}
              className="px-3.5 py-2 bg-cream-100 hover:bg-cream-200 text-navy-800 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-cream-200 transition-colors"
            >
              <Edit className="w-4 h-4 text-navy-600" />
              <span>Edit Stay</span>
            </button>

            <button
              onClick={() => setInvoiceOpen(true)}
              className="px-3.5 py-2 bg-cream-100 hover:bg-cream-200 text-navy-800 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-cream-200"
            >
              <FileText className="w-4 h-4 text-navy-600" />
              <span>Folio / Invoice</span>
            </button>

            {(booking.status === 'Confirmed' || booking.status === 'Pending') && (
              <button
                onClick={handleCheckIn}
                className="gold-gradient-btn px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-luxury"
              >
                <LogIn className="w-4 h-4" />
                <span>Confirm Check-in</span>
              </button>
            )}

            {booking.status === 'Checked In' && (
              <button
                onClick={() => navigate('/check-out')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Check-out Guest</span>
              </button>
            )}

            {(booking.status === 'Confirmed' || booking.status === 'Pending') && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setNoShowDialogOpen(true)}
                  className="p-2 text-amber-700 hover:bg-amber-50 rounded-xl transition-colors"
                  title="Mark as No-show"
                >
                  <UserX className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCancelDialogOpen(true)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="Cancel Reservation"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Stay & Billing details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stay Overview */}
          <div className="luxury-card p-6 bg-white rounded-2xl border border-cream-200">
            <h3 className="text-sm font-bold uppercase tracking-wider text-navy-400 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gold-600" />
              Stay Information
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-cream-50/70 border border-cream-200 rounded-2xl">
              <div>
                <span className="text-[10px] uppercase font-bold text-navy-400 block mb-1">Check-in</span>
                <p className="text-sm font-bold text-navy-950">{booking.checkInDate}</p>
                <p className="text-xs text-navy-500">From {booking.arrivalTime || '02:00 PM'}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-navy-400 block mb-1">Check-out</span>
                <p className="text-sm font-bold text-navy-950">{booking.checkOutDate}</p>
                <p className="text-xs text-navy-500">Until {booking.departureTime || '11:00 AM'}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-navy-400 block mb-1">Room</span>
                <p className="text-sm font-bold text-navy-950">Room {booking.roomNumber}</p>
                <p className="text-xs text-gold-700 font-semibold">{booking.roomType}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-navy-400 block mb-1">Guests</span>
                <p className="text-sm font-bold text-navy-950">{booking.adults} Adults</p>
                <p className="text-xs text-navy-500">{booking.children} Children</p>
              </div>
            </div>

            {booking.specialRequests && (
              <div className="mt-4 p-3.5 bg-gold-50/50 border border-gold-200 rounded-xl text-xs">
                <span className="font-bold text-gold-900 block mb-1">Special Guest Request:</span>
                <p className="text-navy-700 italic">{booking.specialRequests}</p>
              </div>
            )}

            {booking.notes && (
              <div className="mt-3 p-3 bg-cream-50 border border-cream-200 rounded-xl text-xs text-navy-600">
                <span className="font-bold text-navy-900 block mb-0.5">Staff Notes:</span>
                <p>{booking.notes}</p>
              </div>
            )}
          </div>

          {/* Billing & Settlement */}
          <div className="luxury-card p-6 bg-white rounded-2xl border border-cream-200">
            <h3 className="text-sm font-bold uppercase tracking-wider text-navy-400 mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              Payment &amp; Financial Ledger
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-cream-100 text-navy-700">
                <span>Room Charges &amp; Base Tariff</span>
                <span className="font-semibold">₹{(booking.totalAmount - booking.taxAmount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-cream-100 text-navy-700">
                <span>Hospitality GST &amp; Taxes (12%)</span>
                <span className="font-semibold">₹{booking.taxAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 text-sm font-bold text-navy-950 border-b border-cream-200">
                <span>Total Folio Amount</span>
                <span>₹{booking.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 text-emerald-700 font-bold border-b border-cream-100">
                <span>Paid Amount ({booking.paymentMethod || 'Card'})</span>
                <span>₹{booking.paidAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 text-sm font-bold">
                <span>Outstanding Balance</span>
                <span className={booking.balanceAmount > 0 ? 'text-red-600' : 'text-emerald-700'}>
                  ₹{booking.balanceAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Guest Info Card */}
        <div className="space-y-6">
          <div className="luxury-card p-6 bg-white rounded-2xl border border-cream-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy-400 mb-4">Guest Information</h3>
            <div className="flex items-center gap-3 pb-4 border-b border-cream-200">
              <GuestAvatar
                name={booking.guestName}
                avatar={booking.guestAvatar}
                size="lg"
                vip={true}
              />
              <div className="min-w-0">
                <h4 className="text-base font-bold text-navy-950 truncate">{booking.guestName}</h4>
                <p className="text-xs text-gold-700 font-semibold">Registered Patron</p>
              </div>
            </div>

            <div className="py-4 space-y-3 text-xs text-navy-700 border-b border-cream-200">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-navy-400" />
                <span>{booking.guestPhone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-navy-400" />
                <span className="truncate">{booking.guestEmail}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-navy-400" />
                <span>Bangalore, India</span>
              </div>
            </div>

            <div className="pt-4">
              <Link
                to={`/guests/${booking.guestId}`}
                className="w-full py-2.5 bg-cream-50 hover:bg-cream-100 text-navy-800 border border-cream-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <User className="w-4 h-4 text-navy-600" />
                <span>View Full Guest Profile</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <InvoiceModal
        isOpen={invoiceOpen}
        onClose={() => setInvoiceOpen(false)}
        booking={booking}
      />

      {/* Edit Booking Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit Reservation #${booking.id}`}
        subtitle={`Guest: ${booking.guestName} · Room ${booking.roomNumber}`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Adults</label>
              <input
                type="number"
                min="1"
                max="6"
                value={editAdults}
                onChange={(e) => setEditAdults(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Children</label>
              <input
                type="number"
                min="0"
                max="4"
                value={editChildren}
                onChange={(e) => setEditChildren(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1">Special Requests</label>
            <textarea
              rows={2}
              value={editSpecialRequests}
              onChange={(e) => setEditSpecialRequests(e.target.value)}
              className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1">Staff Notes</label>
            <textarea
              rows={2}
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-cream-200">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-navy-600 hover:bg-cream-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="gold-gradient-btn px-5 py-2 text-xs font-bold rounded-xl shadow-sm"
            >
              Save Reservation
            </button>
          </div>
        </form>
      </Modal>

      {/* Cancel Confirm Dialog */}
      <ConfirmDialog
        isOpen={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        onConfirm={handleCancelReservation}
        title="Cancel Reservation?"
        message={`Are you sure you wish to cancel booking #${booking.id} for ${booking.guestName}? The room will be released immediately.`}
        variant="danger"
        confirmText="Yes, Cancel Booking"
      />

      {/* No-show Confirm Dialog */}
      <ConfirmDialog
        isOpen={noShowDialogOpen}
        onClose={() => setNoShowDialogOpen(false)}
        onConfirm={handleNoShow}
        title="Mark Guest as No-Show?"
        message={`Mark booking #${booking.id} (${booking.guestName}) as No-Show? The reserved room will be released.`}
        variant="warning"
        confirmText="Confirm No-Show"
      />
    </div>
  );
};
