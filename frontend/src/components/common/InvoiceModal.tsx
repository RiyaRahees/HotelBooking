import React from 'react';
import { Modal } from './Modal';
import { Booking, Payment } from '../../types';
import { Printer, Download, Sparkles, Building2, CheckCircle2 } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking?: Booking;
  payment?: Payment;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  booking,
  payment,
}) => {
  const { showToast } = useNotification();

  if (!booking && !payment) return null;

  const invoiceNum = payment?.invoiceNumber || `INV-2026-${booking?.id.replace(/\D/g, '') || '9012'}`;
  const guestName = booking?.guestName || payment?.guestName || 'Valued Guest';
  const roomNum = booking?.roomNumber || payment?.roomNumber || '101';
  const roomType = booking?.roomType || 'Deluxe Room';
  const total = booking?.totalAmount || payment?.amount || 18480;
  const tax = booking?.taxAmount || Math.round(total * 0.12);
  const subtotal = total - tax;
  const paid = booking?.paidAmount ?? (payment?.status === 'Completed' ? payment.amount : total);
  const balance = Math.max(0, total - paid);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    showToast('Invoice Downloaded', `Invoice ${invoiceNum} generated as PDF.`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Guest Folio & Tax Invoice" maxWidth="2xl">
      <div className="flex flex-col gap-6">
        {/* Printable Area */}
        <div id="printable-invoice" className="p-6 sm:p-8 bg-white border border-cream-200 rounded-2xl">
          {/* Header Brand */}
          <div className="flex items-start justify-between pb-6 border-b border-cream-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-serif text-navy-950 tracking-wide">ROYAL VISTA</h2>
                <p className="text-xs font-semibold uppercase tracking-widest text-gold-700">Hotel &amp; Suites</p>
                <p className="text-[11px] text-navy-500 mt-0.5">108 Grand Promenade · +91 80 4900 8888</p>
              </div>
            </div>

            <div className="text-right">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {balance === 0 ? 'Fully Settled' : 'Payment Pending'}
              </span>
              <p className="text-sm font-bold text-navy-900 mt-2">{invoiceNum}</p>
              <p className="text-xs text-navy-500">Date: {payment?.date || new Date().toISOString().split('T')[0]}</p>
            </div>
          </div>

          {/* Billed To & Stay Details */}
          <div className="grid grid-cols-2 gap-6 py-6 border-b border-cream-200 text-xs">
            <div>
              <p className="text-[10px] font-bold text-navy-400 uppercase tracking-wider mb-1">Billed To</p>
              <p className="text-sm font-bold text-navy-900">{guestName}</p>
              <p className="text-navy-600">{booking?.guestEmail || 'guest@client.com'}</p>
              <p className="text-navy-600">{booking?.guestPhone || '+91 98000 00000'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-navy-400 uppercase tracking-wider mb-1">Stay Information</p>
              <p className="text-sm font-bold text-navy-900">Room {roomNum} ({roomType})</p>
              <p className="text-navy-600">Check-in: {booking?.checkInDate || '2026-09-19'}</p>
              <p className="text-navy-600">Check-out: {booking?.checkOutDate || '2026-09-22'}</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="py-6 border-b border-cream-200">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-cream-300 text-navy-400 font-bold uppercase tracking-wider text-left">
                  <th className="pb-2">Description</th>
                  <th className="pb-2 text-center">Qty / Nights</th>
                  <th className="pb-2 text-right">Rate</th>
                  <th className="pb-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100 text-navy-800">
                <tr>
                  <td className="py-3">
                    <p className="font-semibold text-navy-900">{roomType} Accommodation</p>
                    <p className="text-[11px] text-navy-500">Complimentary Breakfast &amp; High-Speed Wi-Fi</p>
                  </td>
                  <td className="py-3 text-center">3 Nights</td>
                  <td className="py-3 text-right">₹{(subtotal / 3).toFixed(0)}</td>
                  <td className="py-3 text-right font-medium">₹{subtotal.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="py-3">
                    <p className="font-semibold text-navy-900">GST / Luxury Tax (12%)</p>
                    <p className="text-[11px] text-navy-500">State &amp; Central Hospitality Levy</p>
                  </td>
                  <td className="py-3 text-center">—</td>
                  <td className="py-3 text-right">12%</td>
                  <td className="py-3 text-right font-medium">₹{tax.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals Breakdown */}
          <div className="pt-4 flex justify-end">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-navy-600">
                <span>Subtotal:</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-navy-600">
                <span>Taxes &amp; Fees (12%):</span>
                <span>₹{tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-navy-900 pt-2 border-t border-cream-300">
                <span>Total Amount:</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-navy-600">
                <span>Paid Amount:</span>
                <span className="text-emerald-700 font-semibold">₹{paid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-navy-900 pt-1">
                <span>Balance Due:</span>
                <span className={balance > 0 ? 'text-red-600 font-bold' : 'text-navy-900'}>
                  ₹{balance.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-navy-700 hover:bg-cream-100 rounded-xl"
          >
            Close
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 text-xs font-bold text-navy-800 bg-cream-100 hover:bg-cream-200 border border-cream-300 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
          <button
            onClick={handlePrint}
            className="gold-gradient-btn px-5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Folio</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
