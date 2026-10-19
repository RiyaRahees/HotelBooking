import React, { useState, useEffect } from 'react';
import { useHotelData } from '../hooks/useHotelData';
import { PageHeader } from '../components/common/PageHeader';
import { GuestAvatar } from '../components/common/GuestAvatar';
import { InvoiceModal } from '../components/common/InvoiceModal';
import { bookingsApi } from '../services/bookings';
import { paymentsApi } from '../services/payments';
import { useNotification } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  LogOut,
  BedDouble,
  Receipt,
  Utensils,
  Shirt,
  Sparkles,
  CreditCard,
  CheckCircle2,
  FileText,
  Clock,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { Booking, PaymentMethod } from '../types';

export const CheckOut: React.FC = () => {
  const { refreshAll } = useHotelData();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [bookingsList, setBookingsList] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const data = await bookingsApi.getAll();
      setBookingsList(data);
    } catch (err) {
      console.error('Failed to load in-house bookings for checkout', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  // Find currently active in-house bookings
  const inHouseBookings = bookingsList.filter((b) => b.status === 'Checked In');

  const [selectedBookingId, setSelectedBookingId] = useState<string>('');
  const [foodCharges, setFoodCharges] = useState(1450);
  const [laundryCharges, setLaundryCharges] = useState(600);
  const [serviceCharges, setServiceCharges] = useState(0);
  const [additionalDiscount, setAdditionalDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Card');
  const [checkoutCompleted, setCheckoutCompleted] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!selectedBookingId && inHouseBookings.length > 0) {
      setSelectedBookingId(inHouseBookings[0].id);
    }
  }, [inHouseBookings, selectedBookingId]);

  const selectedBooking = inHouseBookings.find((b) => b.id === selectedBookingId) || inHouseBookings[0];

  // Calculate totals
  const baseRoomTariff = selectedBooking ? selectedBooking.totalAmount - selectedBooking.taxAmount : 0;
  const extrasTotal = foodCharges + laundryCharges + serviceCharges;
  const subtotalBeforeTax = Math.max(0, baseRoomTariff + extrasTotal - additionalDiscount);
  const computedTax = Math.round(subtotalBeforeTax * 0.12);
  const grandTotal = subtotalBeforeTax + computedTax;
  const alreadyPaid = selectedBooking?.paidAmount || 0;
  const finalBalanceToPay = Math.max(0, grandTotal - alreadyPaid);

  const handleExecuteCheckout = async () => {
    if (!selectedBooking) return;

    setIsProcessing(true);
    try {
      // 1. Execute checkOut via bookings API
      await bookingsApi.checkOut(selectedBooking.id, {
        foodCharges,
        laundryCharges,
        serviceCharges,
        additionalDiscount,
        settleAmount: finalBalanceToPay,
        paymentMethod,
      });

      try {
        confetti({
          particleCount: 70,
          spread: 50,
          origin: { y: 0.6 },
        });
      } catch (e) {}

      showToast(
        'Checkout Completed',
        `Room ${selectedBooking.roomNumber} has been moved to Cleaning Required queue.`
      );

      refreshAll();
      setCheckoutCompleted(true);
    } catch (err: any) {
      showToast('Checkout Failed', err.response?.data?.message || err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-4xl mx-auto">
      <PageHeader
        title="Guest Check-out &amp; Billing Settlement"
        subtitle="Review incidentals, calculate folio totals, settle balance, and release room for cleaning"
        icon={LogOut}
      />

      {!checkoutCompleted ? (
        <div className="space-y-6">
          {/* Section 1: In-House Guest Selection */}
          <div className="luxury-card p-6 bg-white rounded-2xl border border-cream-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy-400 mb-3">
              Select In-House Resident for Checkout
            </h3>

            {inHouseBookings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {inHouseBookings.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBookingId(b.id)}
                    className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      selectedBooking?.id === b.id
                        ? 'border-gold-500 bg-gold-50/70 ring-2 ring-gold-300'
                        : 'border-cream-200 bg-white hover:bg-cream-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <GuestAvatar name={b.guestName} avatar={b.guestAvatar} size="sm" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-navy-950 truncate">{b.guestName}</p>
                        <p className="text-[11px] text-gold-800 font-semibold">Room {b.roomNumber} ({b.roomType})</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-navy-400">{b.id}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-navy-500 text-xs bg-cream-50 rounded-xl">
                No guests are currently checked in.
              </div>
            )}
          </div>

          {selectedBooking && (
            <>
              {/* Section 2: Summary of Stay */}
              <div className="luxury-card p-6 bg-white rounded-2xl border border-cream-200">
                <div className="flex items-center justify-between pb-4 border-b border-cream-200">
                  <div className="flex items-center gap-3">
                    <GuestAvatar
                      name={selectedBooking.guestName}
                      avatar={selectedBooking.guestAvatar}
                      vip={true}
                      size="md"
                    />
                    <div>
                      <h3 className="text-base font-bold text-navy-950 font-serif">{selectedBooking.guestName}</h3>
                      <p className="text-xs text-navy-500">
                        Room {selectedBooking.roomNumber} ({selectedBooking.roomType}) · {selectedBooking.guestPhone}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-navy-900 block font-mono">
                      {selectedBooking.checkInDate} → {selectedBooking.checkOutDate}
                    </span>
                    <span className="text-[10px] text-gold-700 font-semibold">3 Nights Stay Duration</span>
                  </div>
                </div>

                {/* Section 3: Itemized Incidentals & Charges */}
                <div className="pt-4 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-navy-400">Incidentals &amp; In-Room Dining</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-cream-50 rounded-xl border border-cream-200">
                      <div className="flex items-center gap-2 mb-1 text-xs font-bold text-navy-900">
                        <Utensils className="w-4 h-4 text-gold-600" />
                        <span>Food &amp; Dining (₹)</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={foodCharges}
                        onChange={(e) => setFoodCharges(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-white border border-cream-300 rounded-lg text-xs font-bold text-navy-900"
                      />
                    </div>

                    <div className="p-3 bg-cream-50 rounded-xl border border-cream-200">
                      <div className="flex items-center gap-2 mb-1 text-xs font-bold text-navy-900">
                        <Shirt className="w-4 h-4 text-navy-600" />
                        <span>Laundry &amp; Pressing (₹)</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={laundryCharges}
                        onChange={(e) => setLaundryCharges(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-white border border-cream-300 rounded-lg text-xs font-bold text-navy-900"
                      />
                    </div>

                    <div className="p-3 bg-cream-50 rounded-xl border border-cream-200">
                      <div className="flex items-center gap-2 mb-1 text-xs font-bold text-navy-900">
                        <Sparkles className="w-4 h-4 text-gold-600" />
                        <span>Spa / Services (₹)</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={serviceCharges}
                        onChange={(e) => setServiceCharges(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-white border border-cream-300 rounded-lg text-xs font-bold text-navy-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: Folio Statement & Calculation */}
                <div className="mt-6 pt-4 border-t border-cream-200">
                  <div className="p-4 bg-cream-50/70 rounded-2xl border border-cream-200 space-y-2 text-xs">
                    <div className="flex justify-between text-navy-600">
                      <span>Room Tariff:</span>
                      <span className="font-semibold">₹{baseRoomTariff.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-navy-600">
                      <span>Food, Laundry &amp; Services:</span>
                      <span className="font-semibold">₹{extrasTotal.toLocaleString()}</span>
                    </div>
                    {additionalDiscount > 0 && (
                      <div className="flex justify-between text-emerald-700">
                        <span>Checkout Discount:</span>
                        <span>-₹{additionalDiscount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-navy-600">
                      <span>GST / Hospitality Tax (12%):</span>
                      <span className="font-semibold">₹{computedTax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-navy-950 pt-2 border-t border-cream-300">
                      <span>Total Folio Amount:</span>
                      <span>₹{grandTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Advance Deposited:</span>
                      <span>-₹{alreadyPaid.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold pt-1 border-t border-cream-200">
                      <span>Balance Due from Guest:</span>
                      <span className={finalBalanceToPay > 0 ? 'text-red-600 font-bold' : 'text-emerald-700'}>
                        ₹{finalBalanceToPay.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 5: Payment Method & Submit */}
                <div className="mt-6 pt-4 border-t border-cream-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1">Settlement Method</label>
                    <div className="flex flex-wrap gap-1.5">
                      {(['Card', 'UPI', 'Cash', 'Online'] as PaymentMethod[]).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setPaymentMethod(m)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
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

                  <button
                    onClick={handleExecuteCheckout}
                    disabled={isProcessing}
                    className="gold-gradient-btn px-8 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-luxury disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>{isProcessing ? 'Processing...' : 'Complete Check-out'}</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        /* Checkout Success State */
        <div className="luxury-card p-8 bg-white rounded-3xl border border-cream-200 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-bold font-serif text-navy-950">✓ Checkout Completed!</h2>
            <p className="text-xs text-navy-500 mt-1">Folio settled in full and keys returned.</p>
          </div>

          {/* Room status notification badge */}
          <div className="max-w-md mx-auto p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-left flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 text-amber-900 rounded-xl">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-amber-950">Room {selectedBooking?.roomNumber} → Cleaning Required</p>
                <p className="text-amber-800 text-[11px]">Housekeeping task has been automatically queued.</p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-amber-200/80 text-amber-950 rounded-lg text-[11px] font-bold">
              Queued
            </span>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setInvoiceModalOpen(true)}
              className="px-5 py-2.5 bg-cream-100 hover:bg-cream-200 text-navy-800 text-xs font-bold rounded-xl flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-navy-600" />
              <span>Print Tax Invoice</span>
            </button>
            <button
              onClick={() => navigate('/housekeeping')}
              className="gold-gradient-btn px-6 py-2.5 text-xs font-bold rounded-xl shadow-luxury flex items-center gap-1.5"
            >
              <span>View Housekeeping Queue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <InvoiceModal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        booking={selectedBooking || undefined}
      />
    </div>
  );
};
