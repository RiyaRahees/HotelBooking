import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useHotelData } from '../hooks/useHotelData';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { GuestAvatar } from '../components/common/GuestAvatar';
import { guestsApi } from '../services/guests';
import { useNotification } from '../context/NotificationContext';
import {
  Users,
  ChevronLeft,
  Shield,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  MessageSquare,
  Sparkles,
  Edit2,
  Check,
} from 'lucide-react';

export const GuestProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { guests, bookings, payments, feedback, refreshAll } = useHotelData();
  const { showToast } = useNotification();

  const guest = guests.find((g) => g.id === id);

  const [notesEditing, setNotesEditing] = useState(false);
  const [guestNotes, setGuestNotes] = useState(guest?.notes || '');

  if (!guest) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-cream-200">
        <h3 className="text-lg font-bold text-navy-900">Guest Profile Not Found</h3>
        <p className="text-xs text-navy-500 mt-1">No guest record found for ID {id}.</p>
        <Link to="/guests" className="mt-4 inline-block gold-gradient-btn px-4 py-2 rounded-xl text-xs font-bold">
          Back to Guests
        </Link>
      </div>
    );
  }

  const guestBookings = bookings.filter((b) => b.guestId === guest.id || b.guestName === guest.name);
  const activeStay = guestBookings.find((b) => b.status === 'Checked In');
  const pastStays = guestBookings.filter((b) => b.status === 'Checked Out');
  const guestPayments = payments.filter((p) => p.guestId === guest.id || p.guestName === guest.name);
  const guestFeedback = feedback.filter((f) => f.guestId === guest.id || f.guestName === guest.name);

  const handleSaveNotes = async () => {
    await guestsApi.update(guest.id, { notes: guestNotes });
    showToast('Notes Updated', 'Guest preferences and staff notes saved.');
    setNotesEditing(false);
    refreshAll();
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <Link
        to="/guests"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-600 hover:text-gold-700 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Guest Directory</span>
      </Link>

      {/* Profile Header Banner */}
      <div className="luxury-card p-6 bg-white rounded-3xl border border-cream-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <GuestAvatar
            name={guest.name}
            avatar={guest.avatar}
            vip={guest.vip}
            size="xl"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold font-serif text-navy-950">{guest.name}</h1>
              {guest.vip && (
                <span className="px-2.5 py-0.5 bg-gold-100 text-gold-900 border border-gold-300 rounded-full text-xs font-bold">
                  VIP Member
                </span>
              )}
            </div>
            <p className="text-xs text-navy-500 mt-1 flex items-center gap-3">
              <span>Patron since {guest.createdAt}</span>
              <span>·</span>
              <span className="font-bold text-navy-800">{guest.totalStays} Total Stays</span>
              <span>·</span>
              <span className="font-bold text-gold-800 font-serif">₹{guest.totalSpent.toLocaleString()} Spent</span>
            </p>
          </div>
        </div>

        {/* Identity Proof Badge */}
        <div className="p-3.5 bg-cream-50 border border-cream-200 rounded-2xl text-xs space-y-1 self-start md:self-auto">
          <span className="text-[10px] font-bold uppercase tracking-wider text-navy-400 block">
            Verified Identity Document
          </span>
          <div className="flex items-center gap-2 font-mono font-bold text-navy-900">
            <Shield className="w-4 h-4 text-gold-600" />
            <span>{guest.idType}: {guest.idNumberMasked}</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold block">✓ KYC Verified</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Contact & Staff Notes */}
        <div className="space-y-6">
          {/* Contact Details Card */}
          <div className="luxury-card p-6 bg-white rounded-2xl border border-cream-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy-400 mb-4">Contact Information</h3>
            <div className="space-y-3 text-xs text-navy-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cream-100 rounded-xl text-navy-700">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-navy-400 block font-bold">Phone Number</span>
                  <span className="font-bold text-navy-900">{guest.phone}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-cream-100 rounded-xl text-navy-700">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-navy-400 block font-bold">Email Address</span>
                  <span className="font-bold text-navy-900">{guest.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-cream-100 rounded-xl text-navy-700">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-navy-400 block font-bold">Registered City</span>
                  <span className="font-semibold text-navy-900">{guest.address}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences & Staff Notes */}
          <div className="luxury-card p-6 bg-white rounded-2xl border border-cream-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-navy-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-gold-600" />
                Patron Preferences &amp; Notes
              </h3>
              {!notesEditing ? (
                <button
                  onClick={() => setNotesEditing(true)}
                  className="p-1 text-navy-400 hover:text-navy-700 rounded-lg"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleSaveNotes}
                  className="px-2 py-0.5 bg-gold-600 text-white rounded text-[11px] font-bold flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Save
                </button>
              )}
            </div>

            {notesEditing ? (
              <textarea
                rows={4}
                value={guestNotes}
                onChange={(e) => setGuestNotes(e.target.value)}
                className="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none"
              />
            ) : (
              <p className="text-xs text-navy-700 leading-relaxed italic bg-cream-50/70 p-3.5 rounded-xl border border-cream-200">
                "{guest.notes || 'No specific preferences recorded.'}"
              </p>
            )}
          </div>
        </div>

        {/* Right 2 Columns: Current Stay, Previous Stays, Payments & Feedback */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Active Stay */}
          {activeStay && (
            <div className="luxury-card p-6 bg-gold-50/40 border border-gold-200 rounded-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-gold-200">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-sm font-bold text-navy-950 font-serif">Current In-House Stay</h3>
                </div>
                <StatusBadge status="Checked In" size="sm" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
                <div>
                  <span className="text-[10px] text-navy-500 font-semibold block">Room Allocated</span>
                  <p className="text-sm font-bold text-navy-900">Room {activeStay.roomNumber}</p>
                  <p className="text-[10px] text-gold-700 font-bold">{activeStay.roomType}</p>
                </div>
                <div>
                  <span className="text-[10px] text-navy-500 font-semibold block">Check-in</span>
                  <p className="font-bold text-navy-900">{activeStay.checkInDate}</p>
                </div>
                <div>
                  <span className="text-[10px] text-navy-500 font-semibold block">Check-out</span>
                  <p className="font-bold text-navy-900">{activeStay.checkOutDate}</p>
                </div>
                <div>
                  <span className="text-[10px] text-navy-500 font-semibold block">Folio Balance</span>
                  <p className="font-bold text-navy-900">₹{activeStay.balanceAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Previous Stay History */}
          <div className="luxury-card p-6 bg-white rounded-2xl border border-cream-200">
            <h3 className="text-sm font-bold uppercase tracking-wider text-navy-400 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-navy-600" />
              Reservation History ({guestBookings.length})
            </h3>

            {guestBookings.length > 0 ? (
              <div className="space-y-2">
                {guestBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-3.5 bg-cream-50/70 border border-cream-200 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-navy-900">
                        {b.id} — Room {b.roomNumber} ({b.roomType})
                      </p>
                      <p className="text-navy-500 text-[11px] mt-0.5">
                        {b.checkInDate} → {b.checkOutDate} · ₹{b.totalAmount.toLocaleString()}
                      </p>
                    </div>
                    <StatusBadge status={b.status} size="sm" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-navy-400 italic">No prior reservations on file.</p>
            )}
          </div>

          {/* Payments History */}
          <div className="luxury-card p-6 bg-white rounded-2xl border border-cream-200">
            <h3 className="text-sm font-bold uppercase tracking-wider text-navy-400 mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              Settlement History
            </h3>

            {guestPayments.length > 0 ? (
              <div className="space-y-2">
                {guestPayments.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 bg-cream-50/70 border border-cream-200 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-navy-900 font-mono">{p.invoiceNumber}</p>
                      <p className="text-navy-500 text-[11px]">{p.date} · via {p.method}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-navy-950 font-serif block">₹{p.amount.toLocaleString()}</span>
                      <StatusBadge status={p.status} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-navy-400 italic">No direct receipts logged.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
