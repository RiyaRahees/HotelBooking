import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useHotelData } from '../hooks/useHotelData';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { InvoiceModal } from '../components/common/InvoiceModal';
import {
  CreditCard,
  ChevronLeft,
  FileText,
  User,
  CheckCircle2,
  Calendar,
  Building,
} from 'lucide-react';

export const PaymentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { payments, bookings } = useHotelData();
  const [invoiceOpen, setInvoiceOpen] = useState(false);

  const payment = payments.find((p) => p.id === id || p.transactionId === id);

  if (!payment) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-cream-200">
        <h3 className="text-lg font-bold text-navy-900">Transaction Not Found</h3>
        <p className="text-xs text-navy-500 mt-1">No transaction found matching {id}.</p>
        <Link to="/payments" className="mt-4 inline-block gold-gradient-btn px-4 py-2 rounded-xl text-xs font-bold">
          Back to Payments
        </Link>
      </div>
    );
  }

  const relatedBooking = bookings.find((b) => b.id === payment.bookingId);

  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-4xl mx-auto">
      <Link
        to="/payments"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-600 hover:text-gold-700 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Payments</span>
      </Link>

      <PageHeader
        title={`Transaction #${payment.transactionId}`}
        subtitle={`Invoice: ${payment.invoiceNumber} · Settled by ${payment.guestName}`}
        badge={payment.status}
        actions={
          <button
            onClick={() => setInvoiceOpen(true)}
            className="gold-gradient-btn px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-luxury"
          >
            <FileText className="w-4 h-4" />
            <span>View Tax Invoice</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="luxury-card p-6 bg-white rounded-2xl border border-cream-200 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy-400">Payment Breakdown</h3>

            <div className="p-5 bg-cream-50 rounded-2xl border border-cream-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-navy-500 font-semibold block">Settled Amount</span>
                <span className="text-3xl font-bold font-serif text-navy-950">₹{payment.amount.toLocaleString()}</span>
              </div>
              <StatusBadge status={payment.status} size="lg" />
            </div>

            <div className="space-y-2 text-xs text-navy-700 pt-2">
              <div className="flex justify-between py-2 border-b border-cream-100">
                <span className="text-navy-400">Payment Channel:</span>
                <span className="font-bold text-navy-900">{payment.method}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-cream-100">
                <span className="text-navy-400">Timestamp:</span>
                <span className="font-semibold text-navy-900">{payment.date}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-cream-100">
                <span className="text-navy-400">Room Number:</span>
                <span className="font-bold text-navy-900">Room {payment.roomNumber}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-navy-400">Audit Remarks:</span>
                <span className="italic text-navy-600">{payment.notes || 'Front desk transaction processed.'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="luxury-card p-6 bg-white rounded-2xl border border-cream-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy-400">Related Patron</h3>
            <p className="text-sm font-bold text-navy-950">{payment.guestName}</p>
            {relatedBooking && (
              <div className="pt-2 text-xs text-navy-600 space-y-1">
                <p>Booking Reference: <span className="font-mono font-bold text-navy-900">{relatedBooking.id}</span></p>
                <p>Stay: {relatedBooking.checkInDate} to {relatedBooking.checkOutDate}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <InvoiceModal
        isOpen={invoiceOpen}
        onClose={() => setInvoiceOpen(false)}
        payment={payment}
        booking={relatedBooking}
      />
    </div>
  );
};
