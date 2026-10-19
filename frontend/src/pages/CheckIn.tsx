import React, { useState, useEffect } from 'react';
import { useHotelData } from '../hooks/useHotelData';
import { PageHeader } from '../components/common/PageHeader';
import { GuestAvatar } from '../components/common/GuestAvatar';
import { bookingsApi } from '../services/bookings';
import { useNotification } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  LogIn,
  Search,
  CheckCircle2,
  ShieldCheck,
  BedDouble,
  CreditCard,
  Key,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { Booking, PaymentMethod } from '../types';

export const CheckIn: React.FC = () => {
  const { rooms, refreshAll } = useHotelData();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [bookingsList, setBookingsList] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Stepper State: 1 = Find, 2 = Verify, 3 = Confirm Room, 4 = Payment, 5 = Complete
  const [currentStep, setCurrentStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Step 2: Verification
  const [idVerified, setIdVerified] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(true);

  // Step 3: Room & Key
  const [assignedRoomId, setAssignedRoomId] = useState('');
  const [keyCardsIssued, setKeyCardsIssued] = useState(2);

  // Step 4: Payment
  const [collectAmount, setCollectAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Card');

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const data = await bookingsApi.getAll();
      setBookingsList(data);
    } catch (err) {
      console.error('Failed to load bookings for check-in', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const pendingBookings = bookingsList.filter((b) => b.status === 'Confirmed' || b.status === 'Pending');

  const filteredBookings = pendingBookings.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      b.guestName.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q) ||
      b.roomNumber.toLowerCase().includes(q) ||
      b.guestPhone.includes(q)
    );
  });

  const handleSelectBooking = (b: Booking) => {
    setSelectedBooking(b);
    setAssignedRoomId(b.roomId);
    setCollectAmount(b.balanceAmount);
    setCurrentStep(2);
  };

  const handleCompleteCheckIn = async () => {
    if (!selectedBooking) return;

    try {
      // 1. Execute checkIn via bookings API
      await bookingsApi.checkIn(selectedBooking.id, {
        collectAmount: Number(collectAmount),
        paymentMethod,
      });

      // 2. Trigger victory confetti
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#B89758', '#C5A880', '#1E293B', '#10B981'],
        });
      } catch (err) {
        // fallback
      }

      showToast(
        'Guest Checked In Successfully! 🔑',
        `${selectedBooking.guestName} is now in Room ${selectedBooking.roomNumber}. Keycards issued: ${keyCardsIssued}`
      );

      refreshAll();
      setCurrentStep(5);
    } catch (err: any) {
      showToast('Check-in Failed', err.response?.data?.message || err.message, 'error');
    }
  };

  const steps = [
    { num: 1, label: 'Find Booking' },
    { num: 2, label: 'Verify Guest' },
    { num: 3, label: 'Confirm Room' },
    { num: 4, label: 'Payment' },
    { num: 5, label: 'Complete' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-4xl mx-auto">
      <PageHeader
        title="Guest Check-in Stepper"
        subtitle="5-step streamlined reception workflow for seamless guest registration and key issuance"
        icon={LogIn}
      />

      {/* Stepper Progress Bar */}
      <div className="luxury-card p-4 sm:p-6 bg-white rounded-2xl border border-cream-200">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-cream-200 z-0" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-gold-600 z-0 transition-all duration-300"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />

          {steps.map((s) => {
            const isDone = s.num < currentStep;
            const isCurrent = s.num === currentStep;

            return (
              <div key={s.num} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 ${
                    isDone
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : isCurrent
                      ? 'bg-gold-600 text-white shadow-gold-glow ring-4 ring-gold-100'
                      : 'bg-white border-2 border-cream-300 text-navy-400'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-5 h-5" /> : s.num}
                </div>
                <span
                  className={`text-[11px] font-bold mt-2 hidden sm:block ${
                    isCurrent ? 'text-gold-900' : isDone ? 'text-emerald-800' : 'text-navy-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 1: Find Booking */}
      {currentStep === 1 && (
        <div className="luxury-card p-6 bg-white rounded-2xl border border-cream-200 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-cream-200">
            <div>
              <h3 className="text-base font-bold font-serif text-navy-950">Step 1: Search Reservation</h3>
              <p className="text-xs text-navy-500">Find incoming arrivals scheduled for check-in</p>
            </div>
            <span className="text-xs font-bold text-gold-700 bg-gold-50 px-2.5 py-1 rounded-lg border border-gold-200">
              {pendingBookings.length} Expected Arrivals
            </span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
            <input
              type="text"
              autoFocus
              placeholder="Search by Guest Name, Booking ID, Room number or Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-cream-50 border border-cream-200 rounded-xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-400"
            />
          </div>

          <div className="divide-y divide-cream-100 max-h-80 overflow-y-auto">
            {filteredBookings.length > 0 ? (
              filteredBookings.map((b) => (
                <div
                  key={b.id}
                  onClick={() => handleSelectBooking(b)}
                  className="py-3.5 px-3 flex items-center justify-between hover:bg-gold-50/50 rounded-xl cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <GuestAvatar name={b.guestName} avatar={b.guestAvatar} size="md" />
                    <div>
                      <p className="text-sm font-bold text-navy-900">{b.guestName}</p>
                      <p className="text-xs text-navy-500">
                        {b.id} · Room {b.roomNumber} ({b.roomType}) · {b.adults} Guests
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <span className="text-xs font-bold text-navy-950 block">₹{b.totalAmount.toLocaleString()}</span>
                      <span className="text-[10px] text-gold-700 font-semibold block">
                        Due: ₹{b.balanceAmount.toLocaleString()}
                      </span>
                    </div>
                    <button className="gold-gradient-btn px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs">
                      Select →
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-navy-400 text-xs">
                No matching confirmed reservations ready for check-in.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Verify Guest Identity */}
      {currentStep === 2 && selectedBooking && (
        <div className="luxury-card p-6 bg-white rounded-2xl border border-cream-200 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-cream-200">
            <div>
              <h3 className="text-base font-bold font-serif text-navy-950">Step 2: Guest Identity Verification</h3>
              <p className="text-xs text-navy-500">Confirm government ID proof and primary contact details</p>
            </div>
            <span className="font-mono font-bold text-xs text-navy-900">{selectedBooking.id}</span>
          </div>

          <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-navy-400 font-bold block mb-1">Guest Name:</span>
              <p className="text-sm font-bold text-navy-900">{selectedBooking.guestName}</p>
            </div>
            <div>
              <span className="text-navy-400 font-bold block mb-1">Contact Phone:</span>
              <p className="font-bold text-navy-900">{selectedBooking.guestPhone}</p>
            </div>
            <div>
              <span className="text-navy-400 font-bold block mb-1">Email Address:</span>
              <p className="text-navy-700">{selectedBooking.guestEmail}</p>
            </div>
            <div>
              <span className="text-navy-400 font-bold block mb-1">Stay Duration:</span>
              <p className="font-semibold text-navy-900">
                {selectedBooking.checkInDate} to {selectedBooking.checkOutDate}
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-start gap-3 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={idVerified}
                onChange={(e) => setIdVerified(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-emerald-600 rounded"
              />
              <div>
                <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Government ID Proof Verified &amp; Scanned
                </span>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  Receptionist has inspected passport / national identity credential.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 bg-cream-50 border border-cream-200 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-gold-600 rounded"
              />
              <div>
                <span className="text-xs font-bold text-navy-900">
                  Guest Hotel Policies &amp; Registration Card Acknowledged
                </span>
                <p className="text-[11px] text-navy-500 mt-0.5">
                  Guest agreed to check-out time (11:00 AM) and non-smoking suite policy.
                </p>
              </div>
            </label>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-cream-200">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 text-xs font-bold text-navy-600 hover:bg-cream-100 rounded-xl flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              disabled={!idVerified || !termsAccepted}
              onClick={() => setCurrentStep(3)}
              className="gold-gradient-btn px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-luxury disabled:opacity-50"
            >
              <span>Next: Room Allocation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm Room & Issue Keys */}
      {currentStep === 3 && selectedBooking && (
        <div className="luxury-card p-6 bg-white rounded-2xl border border-cream-200 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-cream-200">
            <div>
              <h3 className="text-base font-bold font-serif text-navy-950">Step 3: Room Confirmation &amp; Key Issuance</h3>
              <p className="text-xs text-navy-500">Confirm room number allocation and encode smart keycards</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Selected Room</label>
              <select
                value={assignedRoomId}
                onChange={(e) => setAssignedRoomId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-bold text-navy-900 focus:outline-none"
              >
                {rooms
                  .filter((r) => r.type === selectedBooking.roomType)
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      Room {r.number} (Floor {r.floor} — {r.status})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Keycards Issued</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setKeyCardsIssued(count)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      keyCardsIssued === count
                        ? 'border-gold-500 bg-gold-50 text-gold-950 ring-2 ring-gold-200'
                        : 'border-cream-200 bg-white text-navy-700'
                    }`}
                  >
                    {count} {count === 1 ? 'Card' : 'Cards'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 bg-gold-50/50 border border-gold-200 rounded-2xl flex items-center gap-3">
            <div className="p-2.5 bg-gold-100 text-gold-900 rounded-xl">
              <Key className="w-5 h-5" />
            </div>
            <div className="text-xs text-navy-800">
              <p className="font-bold text-navy-950">Simulated RFID Key Encoder</p>
              <p className="text-navy-600">Encoded for Room {selectedBooking.roomNumber} until checkout ({selectedBooking.checkOutDate} 11:00 AM).</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-cream-200">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 text-xs font-bold text-navy-600 hover:bg-cream-100 rounded-xl flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="gold-gradient-btn px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-luxury"
            >
              <span>Next: Settlement</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Payment Settlement */}
      {currentStep === 4 && selectedBooking && (
        <div className="luxury-card p-6 bg-white rounded-2xl border border-cream-200 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-cream-200">
            <div>
              <h3 className="text-base font-bold font-serif text-navy-950">Step 4: Deposit &amp; Payment Collection</h3>
              <p className="text-xs text-navy-500">Collect pending balance or authorize incidental card</p>
            </div>
          </div>

          {/* Pricing Ledger Card */}
          <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200 space-y-2 text-xs">
            <div className="flex justify-between text-navy-600">
              <span>Total Stay Charges:</span>
              <span className="font-bold text-navy-900">₹{selectedBooking.totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-emerald-700">
              <span>Advance Already Paid:</span>
              <span className="font-bold">₹{selectedBooking.paidAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-navy-950 pt-2 border-t border-cream-300">
              <span>Remaining Balance Due:</span>
              <span className="text-red-600">₹{selectedBooking.balanceAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Amount to Collect Now (₹)</label>
              <input
                type="number"
                min="0"
                value={collectAmount}
                onChange={(e) => setCollectAmount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-bold text-emerald-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-semibold text-navy-900 focus:outline-none"
              >
                <option value="Card">Credit / Debit Card</option>
                <option value="UPI">UPI / QR Code</option>
                <option value="Cash">Cash at Front Desk</option>
                <option value="Bank Transfer">Direct Bank Transfer</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-cream-200">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 text-xs font-bold text-navy-600 hover:bg-cream-100 rounded-xl flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={handleCompleteCheckIn}
              className="gold-gradient-btn px-8 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-luxury"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Check-in</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Complete */}
      {currentStep === 5 && selectedBooking && (
        <div className="luxury-card p-8 bg-white rounded-3xl border border-cream-200 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-bold font-serif text-navy-950">✓ Guest Successfully Checked In!</h2>
            <p className="text-xs text-navy-500 mt-1">
              Room {selectedBooking.roomNumber} is now marked as Occupied. Keycard active.
            </p>
          </div>

          <div className="max-w-md mx-auto p-4 bg-cream-50 border border-cream-200 rounded-2xl text-xs space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-navy-500">Guest:</span>
              <span className="font-bold text-navy-900">{selectedBooking.guestName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-navy-500">Room:</span>
              <span className="font-bold text-navy-900">Room {selectedBooking.roomNumber} ({selectedBooking.roomType})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-navy-500">Stay:</span>
              <span className="font-semibold text-navy-900">{selectedBooking.checkInDate} → {selectedBooking.checkOutDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-navy-500">Keycards:</span>
              <span className="font-semibold text-navy-900">{keyCardsIssued} cards issued</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={() => {
                setSelectedBooking(null);
                setCurrentStep(1);
              }}
              className="px-5 py-2.5 bg-cream-100 hover:bg-cream-200 text-navy-800 text-xs font-bold rounded-xl"
            >
              Check-in Another Guest
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="gold-gradient-btn px-6 py-2.5 text-xs font-bold rounded-xl shadow-luxury"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
