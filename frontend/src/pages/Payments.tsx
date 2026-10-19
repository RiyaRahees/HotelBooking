import React, { useState } from 'react';
import { useHotelData } from '../hooks/useHotelData';
import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { InvoiceModal } from '../components/common/InvoiceModal';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  DollarSign,
  Clock,
  CheckCircle2,
  RefreshCcw,
  Search,
  FileText,
  Eye,
  TrendingUp,
} from 'lucide-react';
import { Payment } from '../types';

export const Payments: React.FC = () => {
  const { payments, bookings } = useHotelData();

  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('All');
  const [selectedPaymentForInvoice, setSelectedPaymentForInvoice] = useState<Payment | null>(null);

  // Financial KPIs
  const totalCompleted = payments
    .filter((p) => p.status === 'Completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = bookings
    .filter((b) => b.status === 'Checked In' || b.status === 'Confirmed')
    .reduce((sum, b) => sum + b.balanceAmount, 0);

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.roomNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMethod = methodFilter === 'All' || p.method === methodFilter;

    return matchesSearch && matchesMethod;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <PageHeader
        title="Payments &amp; Transactions"
        subtitle="Track revenue settlements, payment gateway receipts, and generate guest tax invoices"
        icon={CreditCard}
      />

      {/* 4 Financial Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's Revenue"
          value={`₹${(totalCompleted + 18500).toLocaleString()}`}
          subtext="+14% vs yesterday"
          icon={TrendingUp}
          variant="gold"
        />
        <StatCard
          label="Pending Receivables"
          value={`₹${pendingAmount.toLocaleString()}`}
          subtext="In-stay folio balances"
          icon={Clock}
          variant="amber"
        />
        <StatCard
          label="Completed Payments"
          value={`${payments.filter((p) => p.status === 'Completed').length} Txns`}
          subtext="100% gateway success rate"
          icon={CheckCircle2}
          variant="emerald"
        />
        <StatCard
          label="Refunds Processed"
          value="₹0"
          subtext="Zero chargebacks"
          icon={RefreshCcw}
          variant="navy"
        />
      </div>

      {/* Search & Filter Bar */}
      <div className="luxury-card p-4 bg-white rounded-2xl border border-cream-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
          <input
            type="text"
            placeholder="Search Txn ID, invoice, guest, room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-cream-50 border border-cream-200 rounded-xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 bg-cream-50 border border-cream-200 rounded-xl text-xs font-semibold text-navy-800 focus:outline-none"
          >
            <option value="All">All Payment Methods</option>
            <option value="Card">Card</option>
            <option value="UPI">UPI</option>
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="luxury-card bg-white rounded-2xl border border-cream-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-50/70 border-b border-cream-200 text-navy-400 uppercase font-bold tracking-wider">
              <tr>
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Guest</th>
                <th className="p-4">Room</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Method</th>
                <th className="p-4">Date &amp; Time</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-cream-50/50 transition-colors">
                  <td className="p-4 font-mono font-bold text-navy-900">
                    <Link to={`/payments/${p.id}`} className="hover:text-gold-700 underline underline-offset-2">
                      {p.transactionId}
                    </Link>
                    <span className="text-[10px] text-navy-400 block font-normal">{p.invoiceNumber}</span>
                  </td>
                  <td className="p-4 font-bold text-navy-900">{p.guestName}</td>
                  <td className="p-4 font-semibold text-navy-800">Room {p.roomNumber}</td>
                  <td className="p-4 font-bold text-navy-950 font-serif">₹{p.amount.toLocaleString()}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 bg-cream-100 border border-cream-200 rounded font-semibold text-navy-800">
                      {p.method}
                    </span>
                  </td>
                  <td className="p-4 text-navy-600">{p.date}</td>
                  <td className="p-4">
                    <StatusBadge status={p.status} size="sm" />
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedPaymentForInvoice(p)}
                        className="p-1.5 bg-gold-50 hover:bg-gold-100 text-gold-900 rounded-lg border border-gold-200"
                        title="View Tax Invoice"
                      >
                        <FileText className="w-3.5 h-3.5 text-gold-700" />
                      </button>
                      <Link
                        to={`/payments/${p.id}`}
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

      <InvoiceModal
        isOpen={!!selectedPaymentForInvoice}
        onClose={() => setSelectedPaymentForInvoice(null)}
        payment={selectedPaymentForInvoice || undefined}
      />
    </div>
  );
};
