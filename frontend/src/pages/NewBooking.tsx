import React, { useState, useEffect } from 'react';
import { useHotelData } from '../hooks/useHotelData';
import { PageHeader } from '../components/common/PageHeader';
import { bookingsApi } from '../services/bookings';
import { useNotification } from '../context/NotificationContext';
import { useNavigate, Link } from 'react-router-dom';
import { RoomType, PaymentMethod } from '../types';
import {
  CalendarCheck,
  ChevronLeft,
  User,
  Calendar,
  CreditCard,
  Sparkles,
  CheckCircle2,
  BedDouble,
  Receipt,
  FileText,
  Loader2,
} from 'lucide-react';

export const NewBooking: React.FC = () => {
  const { guests, refreshAll } = useHotelData();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  // Rooms state from backend
  const [rooms, setRooms] = useState<any[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mode: Existing vs New Guest
  const [guestMode, setGuestMode] = useState<'existing' | 'new'>('existing');
  const [selectedGuestId, setSelectedGuestId] = useState(guests[0]?.id || '');

  // New Guest Form fields
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');

  // Stay parameters
  const todayStr = new Date().toISOString().split('T')[0];
  const checkoutDefault = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [checkInDate, setCheckInDate] = useState(todayStr);
  const [checkOutDate, setCheckOutDate] = useState(checkoutDefault);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType>('Deluxe');
  const [selectedRoomId, setSelectedRoomId] = useState('');

  // Financials & Payment
  const [discountAmount, setDiscountAmount] = useState(0);
  const [advancePaid, setAdvancePaid] = useState(5000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Card');
  const [specialRequests, setSpecialRequests] = useState('');
  const [staffNotes, setStaffNotes] = useState('');

  // Load rooms / available rooms dynamically from API
  useEffect(() => {
    let isMounted = true;
    const loadRooms = async () => {
      setIsLoadingRooms(true);
      try {
        const available = await bookingsApi.getAvailableRooms({
          checkIn: checkInDate,
          checkOut: checkOutDate,
        });
        if (isMounted) {
          setRooms(available);
          if (available.length > 0) {
            const match = available.find((r) => r.type === selectedRoomType) || available[0];
            setSelectedRoomId(match.id);
          }
        }
      } catch (err) {
        console.error('Failed to load available rooms', err);
      } finally {
        if (isMounted) setIsLoadingRooms(false);
      }
    };
    loadRooms();
    return () => {
      isMounted = false;
    };
  }, [checkInDate, checkOutDate]);

  // Calculate nights and price
  const selectedRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];
  const roomPricePerNight = selectedRoom?.pricePerNight || (selectedRoomType === 'Standard' ? 3500 : selectedRoomType === 'Suite' ? 9500 : selectedRoomType === 'Executive Suite' ? 14500 : selectedRoomType === 'Presidential Suite' ? 24000 : 5500);

  // Nights calculation
  const d1 = new Date(checkInDate);
  const d2 = new Date(checkOutDate);
  const diffTime = d2.getTime() - d1.getTime();
  const nights = Math.max(1, Math.ceil(Math.max(0, diffTime) / (1000 * 60 * 60 * 24)));

  const baseTariff = roomPricePerNight * nights;
  const taxableAmount = Math.max(0, baseTariff - discountAmount);
  const taxAmount = Math.round(taxableAmount * 0.12);
  const totalAmount = taxableAmount + taxAmount;
  const balanceAmount = Math.max(0, totalAmount - advancePaid);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRoom) {
      showToast('Validation Error', 'Please select an available room for the specified dates.', 'error');
      return;
    }

    let guestName = '';
    let guestPhone = '';
    let guestEmail = '';
    let guestAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';

    if (guestMode === 'existing') {
      const g = guests.find((item) => item.id === selectedGuestId);
      if (g) {
        guestName = g.name;
        guestPhone = g.phone;
        guestEmail = g.email;
        guestAvatar = g.avatar;
      }
    } else {
      if (!newName || !newPhone) {
        showToast('Validation Error', 'Guest name and phone number are required.', 'error');
        return;
      }
      guestName = newName;
      guestPhone = newPhone;
      guestEmail = newEmail || 'guest@client.com';
    }

    setIsSubmitting(true);
    try {
      const parts = guestName.trim().split(' ');
      const firstName = parts[0] || 'Guest';
      const lastName = parts.slice(1).join(' ') || 'Patron';

      const newBooking = await bookingsApi.create({
        guestId: guestMode === 'existing' && selectedGuestId ? selectedGuestId : undefined,
        newGuest: guestMode === 'new' ? {
          firstName,
          lastName,
          phone: guestPhone,
          email: guestEmail,
          address: newAddress,
        } : undefined,
        guestName,
        guestPhone,
        guestEmail,
        guestAvatar,
        roomId: selectedRoom.id,
        roomNumber: selectedRoom.number,
        roomType: selectedRoom.type || selectedRoomType,
        checkInDate,
        checkOutDate,
        arrivalTime: '02:00 PM',
        departureTime: '11:00 AM',
        adults: Number(adults),
        children: Number(children),
        totalAmount,
        paidAmount: Number(advancePaid),
        balanceAmount,
        taxAmount,
        discountAmount: Number(discountAmount),
        paymentStatus: balanceAmount === 0 ? 'Paid' : advancePaid > 0 ? 'Partial' : 'Pending',
        status: 'Confirmed',
        specialRequests,
        notes: staffNotes,
        paymentMethod,
      });

      showToast(
        'Booking Confirmed! 🎉',
        `Reservation ${newBooking.id} created for ${guestName} in Room ${selectedRoom.number}.`
      );

      refreshAll();
      navigate('/bookings');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to create booking.';
      showToast('Booking Failed', msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-5xl mx-auto">
      {/* Back Button */}
      <Link
        to="/bookings"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-600 hover:text-gold-700 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Bookings</span>
      </Link>

      <PageHeader
        title="Create New Reservation"
        subtitle="Book luxury suites with instant rate calculations and guest registration"
        icon={CalendarCheck}
      />

      <form onSubmit={handleCreateBooking} className="space-y-6">
        {/* Section 1: Guest Information */}
        <div className="luxury-card p-6 bg-white rounded-2xl border border-cream-200">
          <div className="flex items-center justify-between pb-4 border-b border-cream-200">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-gold-100 text-gold-900 rounded-xl">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold font-serif text-navy-950">1. Guest Information</h3>
                <p className="text-xs text-navy-500">Select an existing registered patron or register new</p>
              </div>
            </div>

            {/* Toggle Mode */}
            <div className="flex items-center gap-1 p-1 bg-cream-100 rounded-xl border border-cream-200">
              <button
                type="button"
                onClick={() => setGuestMode('existing')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  guestMode === 'existing' ? 'bg-white text-navy-950 shadow-sm' : 'text-navy-500 hover:text-navy-900'
                }`}
              >
                Existing Guest
              </button>
              <button
                type="button"
                onClick={() => setGuestMode('new')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  guestMode === 'new' ? 'bg-white text-navy-950 shadow-sm' : 'text-navy-500 hover:text-navy-900'
                }`}
              >
                + New Guest
              </button>
            </div>
          </div>

          <div className="pt-4">
            {guestMode === 'existing' ? (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-navy-900">Select Registered Patron</label>
                <select
                  value={selectedGuestId}
                  onChange={(e) => setSelectedGuestId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-semibold text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-400"
                >
                  {guests.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} — {g.phone} ({g.vip ? 'VIP Member · ' : ''}
                      {g.totalStays} prior stays)
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Malhotra"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Mobile Contact *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98000 00000"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="guest@domain.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Residential City / Address</label>
                  <input
                    type="text"
                    placeholder="City, State"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-400"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Stay Dates & Room Selection */}
        <div className="luxury-card p-6 bg-white rounded-2xl border border-cream-200">
          <div className="flex items-center gap-2.5 pb-4 border-b border-cream-200">
            <div className="p-2 bg-emerald-100 text-emerald-900 rounded-xl">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif text-navy-950">2. Stay &amp; Room Assignment</h3>
              <p className="text-xs text-navy-500">Dates, occupancy count and room allocation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Check-in Date</label>
              <input
                type="date"
                required
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Check-out Date</label>
              <input
                type="date"
                required
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Adults</label>
              <input
                type="number"
                min="1"
                max="6"
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Children</label>
              <input
                type="number"
                min="0"
                max="4"
                value={children}
                onChange={(e) => setChildren(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 mt-2 border-t border-cream-100">
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Select Room Tier</label>
              <select
                value={selectedRoomType}
                onChange={(e) => {
                  const type = e.target.value as RoomType;
                  setSelectedRoomType(type);
                  const firstMatch = rooms.find((r) => r.type === type && r.status === 'Available');
                  if (firstMatch) setSelectedRoomId(firstMatch.id);
                }}
                className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs font-semibold text-navy-900 focus:outline-none"
              >
                <option value="Standard">Standard (₹3,500/night)</option>
                <option value="Deluxe">Deluxe (₹5,500/night)</option>
                <option value="Suite">Suite (₹9,500/night)</option>
                <option value="Executive Suite">Executive Suite (₹14,500/night)</option>
                <option value="Presidential Suite">Presidential Suite (₹24,000/night)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Assign Room Number</label>
              <select
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs font-semibold text-navy-900 focus:outline-none"
              >
                {rooms
                  .filter((r) => r.type === selectedRoomType)
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      Room {r.number} (Floor {r.floor} — {r.status})
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Pricing, Taxes & Advance Payment */}
        <div className="luxury-card p-6 bg-white rounded-2xl border border-cream-200">
          <div className="flex items-center gap-2.5 pb-4 border-b border-cream-200">
            <div className="p-2 bg-amber-100 text-amber-900 rounded-xl">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif text-navy-950">3. Pricing Breakdown &amp; Deposit</h3>
              <p className="text-xs text-navy-500">Itemized room tariff, taxes and advance collection</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
            {/* Input fields */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Promotional Discount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Advance Deposit (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={advancePaid}
                    onChange={(e) => setAdvancePaid(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none font-bold text-emerald-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Payment Method</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Card', 'UPI', 'Cash', 'Bank Transfer'] as PaymentMethod[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                        paymentMethod === m
                          ? 'border-gold-500 bg-gold-50 text-gold-950 ring-2 ring-gold-200'
                          : 'border-cream-200 bg-white text-navy-700 hover:bg-cream-50'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Calculated Breakdown Card */}
            <div className="p-4 bg-cream-50/70 border border-cream-200 rounded-2xl space-y-2.5 text-xs">
              <div className="flex justify-between text-navy-600">
                <span>
                  Room Tariff ({nights} Nights @ ₹{roomPricePerNight.toLocaleString()}):
                </span>
                <span>₹{baseTariff.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Promotional Discount:</span>
                  <span>-₹{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-navy-600">
                <span>GST / Luxury Tax (12%):</span>
                <span>₹{taxAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-navy-950 pt-2 border-t border-cream-300">
                <span>Total Net Bill:</span>
                <span>₹{totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Advance Collected Now:</span>
                <span>₹{advancePaid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-navy-900 pt-1">
                <span>Balance Due at Check-out:</span>
                <span className={balanceAmount > 0 ? 'text-red-600 font-bold' : 'text-emerald-700'}>
                  ₹{balanceAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Special Requests & Notes */}
        <div className="luxury-card p-6 bg-white rounded-2xl border border-cream-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Special Guest Requests</label>
              <textarea
                rows={2}
                placeholder="e.g. Feather-free pillows, late check-in, anniversary flowers..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Internal Reception Notes</label>
              <textarea
                rows={2}
                placeholder="Notes for housekeeping or billing desk..."
                value={staffNotes}
                onChange={(e) => setStaffNotes(e.target.value)}
                className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Bottom Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/bookings')}
            className="px-5 py-2.5 text-xs font-bold text-navy-600 hover:bg-cream-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isLoadingRooms}
            className="gold-gradient-btn px-8 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-luxury disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>{isSubmitting ? 'Creating...' : 'Create Booking'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
