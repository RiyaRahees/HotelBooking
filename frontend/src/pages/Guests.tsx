import React, { useState } from 'react';
import { useHotelData } from '../hooks/useHotelData';
import { PageHeader } from '../components/common/PageHeader';
import { GuestAvatar } from '../components/common/GuestAvatar';
import { Modal } from '../components/common/Modal';
import { guestsApi } from '../services/guests';
import { useNotification } from '../context/NotificationContext';
import { Link, useNavigate } from 'react-router-dom';
import { Users, UserPlus, Search, Eye, Phone, Mail, Crown, Shield } from 'lucide-react';
import { Guest } from '../types';

export const Guests: React.FC = () => {
  const { guests, bookings, refreshAll } = useHotelData();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Form State for Add Guest
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [idType, setIdType] = useState<Guest['idType']>('Passport');
  const [idNumberMasked, setIdNumberMasked] = useState('');
  const [vip, setVip] = useState(false);
  const [notes, setNotes] = useState('');

  const filteredGuests = guests.filter((g) => {
    const q = searchQuery.toLowerCase();
    return (
      g.name.toLowerCase().includes(q) ||
      g.phone.includes(q) ||
      g.email.toLowerCase().includes(q) ||
      g.idNumberMasked.toLowerCase().includes(q)
    );
  });

  const handleCreateGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      showToast('Validation Error', 'Guest name and phone number are required.', 'error');
      return;
    }

    await guestsApi.create({
      name,
      phone,
      email: email || 'guest@domain.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      address: address || 'Bangalore, India',
      idType,
      idNumberMasked: idNumberMasked || '•••• •••• 1234',
      vip,
      notes: notes || 'Preferred guest registered at front desk.',
    });

    showToast('Guest Profile Created', `${name} added to patron directory.`);
    setAddModalOpen(false);
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    refreshAll();
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <PageHeader
        title="Guest Directory &amp; Profiles"
        subtitle="Maintain verified guest identity proofs, stay history, VIP memberships and preferences"
        icon={Users}
        actions={
          <button
            onClick={() => setAddModalOpen(true)}
            className="gold-gradient-btn px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-luxury"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Guest</span>
          </button>
        }
      />

      {/* Search Bar */}
      <div className="luxury-card p-4 bg-white rounded-2xl border border-cream-200 flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
          <input
            type="text"
            placeholder="Search by name, phone, email or ID proof..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-cream-50 border border-cream-200 rounded-xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-400"
          />
        </div>
        <span className="text-xs text-navy-500 font-medium hidden sm:inline">
          {filteredGuests.length} registered guests
        </span>
      </div>

      {/* Guests Table */}
      <div className="luxury-card bg-white rounded-2xl border border-cream-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-50/70 border-b border-cream-200 text-navy-400 uppercase font-bold tracking-wider">
              <tr>
                <th className="p-4">Guest</th>
                <th className="p-4">Contact Details</th>
                <th className="p-4">ID Proof</th>
                <th className="p-4">Total Stays</th>
                <th className="p-4">Lifetime Spend</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {filteredGuests.map((guest) => {
                const activeBooking = bookings.find(
                  (b) => b.guestId === guest.id && b.status === 'Checked In'
                );

                return (
                  <tr key={guest.id} className="hover:bg-cream-50/50 transition-colors">
                    <td className="p-4">
                      <GuestAvatar
                        name={guest.name}
                        avatar={guest.avatar}
                        vip={guest.vip}
                        showName={true}
                        subtitle={guest.address}
                        size="md"
                      />
                    </td>
                    <td className="p-4 space-y-0.5">
                      <p className="font-semibold text-navy-900">{guest.phone}</p>
                      <p className="text-[11px] text-navy-500">{guest.email}</p>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cream-100 border border-cream-200 rounded-lg text-navy-700 font-mono text-[11px]">
                        <Shield className="w-3 h-3 text-gold-600" />
                        <span>{guest.idType}: {guest.idNumberMasked}</span>
                      </span>
                    </td>
                    <td className="p-4 font-bold text-navy-900">
                      {guest.totalStays} {guest.totalStays === 1 ? 'Stay' : 'Stays'}
                    </td>
                    <td className="p-4 font-bold text-navy-950 font-serif">
                      ₹{guest.totalSpent.toLocaleString()}
                    </td>
                    <td className="p-4">
                      {activeBooking ? (
                        <span className="px-2.5 py-1 bg-navy-50 text-navy-900 border border-navy-200 rounded-full text-xs font-bold inline-flex items-center gap-1">
                          In Stay (Room {activeBooking.roomNumber})
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-cream-100 text-navy-600 rounded-full text-xs font-medium">
                          Registered
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        to={`/guests/${guest.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cream-100 hover:bg-cream-200 text-navy-800 rounded-xl font-bold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-navy-600" />
                        <span>View Profile</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Guest Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New Patron Profile"
        subtitle="Register verified guest information and ID credentials"
        maxWidth="md"
      >
        <form onSubmit={handleCreateGuest} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1">Full Legal Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Vikram Malhotra"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="+91 98000 00000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Email</label>
              <input
                type="email"
                placeholder="patron@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">ID Document Type</label>
              <select
                value={idType}
                onChange={(e) => setIdType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-semibold text-navy-900 focus:outline-none"
              >
                <option value="Passport">Passport</option>
                <option value="Aadhaar">Aadhaar Card</option>
                <option value="Driving License">Driving License</option>
                <option value="National ID">National ID</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">ID Number (Masked)</label>
              <input
                type="text"
                placeholder="Z982••••31"
                value={idNumberMasked}
                onChange={(e) => setIdNumberMasked(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1">Address</label>
            <input
              type="text"
              placeholder="City, Country"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 p-3 bg-gold-50 border border-gold-200 rounded-xl">
            <input
              type="checkbox"
              id="vipCheck"
              checked={vip}
              onChange={(e) => setVip(e.target.checked)}
              className="w-4 h-4 text-gold-600 rounded border-gold-300 focus:ring-gold-400"
            />
            <label htmlFor="vipCheck" className="text-xs font-bold text-gold-950 flex items-center gap-1.5 cursor-pointer">
              <Crown className="w-3.5 h-3.5 text-gold-600" />
              Grant Royal Vista VIP Status
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1">Preferences &amp; Internal Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Synthetic pillows, high floor, sparkling water..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-cream-200">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-navy-600 hover:bg-cream-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="gold-gradient-btn px-5 py-2 text-xs font-bold rounded-xl shadow-sm"
            >
              Create Guest Profile
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
