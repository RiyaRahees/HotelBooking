import React, { useState, useEffect } from 'react';
import { Search, BedDouble as RoomIcon, User, Calendar, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHotelData } from '../../hooks/useHotelData';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const { rooms, guests, bookings } = useHotelData();
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        // Toggle or open
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const filteredGuests = q ? guests.filter(g =>
    g.name.toLowerCase().includes(q) || g.phone.includes(q) || g.email.toLowerCase().includes(q)
  ) : [];

  const filteredRooms = q ? rooms.filter(r =>
    r.number.includes(q) || r.type.toLowerCase().includes(q) || r.status.toLowerCase().includes(q)
  ) : [];

  const filteredBookings = q ? bookings.filter(b =>
    b.id.toLowerCase().includes(q) || b.guestName.toLowerCase().includes(q) || b.roomNumber.includes(q)
  ) : [];

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
    setQuery('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-start justify-center pt-16 sm:pt-24 p-4">
      <div className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-cream-200 overflow-hidden z-10">
        {/* Search Bar Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-cream-200 bg-white">
          <Search className="w-5 h-5 text-gold-600 mr-3 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search guests, rooms, bookings, phone, email... (e.g. 101, John, Deluxe)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-transparent text-navy-900 placeholder-navy-400 text-sm focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-navy-400 hover:text-navy-700">
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="ml-2 text-[10px] uppercase font-bold text-navy-400 bg-cream-100 px-2 py-0.5 rounded border border-cream-200">
            ESC
          </span>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {!q && (
            <div className="py-6 text-center text-navy-400 text-xs">
              <p className="font-semibold text-navy-600 text-sm mb-1">Global Hotel Search</p>
              <p>Type any guest name, phone number, room number, or booking reference to jump straight to the record.</p>
            </div>
          )}

          {q && filteredGuests.length === 0 && filteredRooms.length === 0 && filteredBookings.length === 0 && (
            <div className="py-8 text-center text-navy-500 text-sm">
              No matching records found for "{query}".
            </div>
          )}

          {/* Rooms */}
          {filteredRooms.length > 0 && (
            <div className="mb-4">
              <p className="text-[11px] font-bold text-gold-800 uppercase tracking-wider mb-2 px-2">Rooms</p>
              <div className="space-y-1">
                {filteredRooms.map(r => (
                  <button
                    key={r.id}
                    onClick={() => handleSelect(`/rooms/${r.id}`)}
                    className="w-full flex items-center justify-between p-2.5 hover:bg-gold-50/60 rounded-xl transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-cream-100 rounded-lg text-navy-700 font-bold text-xs">
                        {r.number}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-navy-900">Room {r.number} — {r.type}</p>
                        <p className="text-xs text-navy-500">Floor {r.floor} · ₹{r.pricePerNight.toLocaleString()}/night · <span className="capitalize">{r.status}</span></p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-navy-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Guests */}
          {filteredGuests.length > 0 && (
            <div className="mb-4">
              <p className="text-[11px] font-bold text-gold-800 uppercase tracking-wider mb-2 px-2">Guests</p>
              <div className="space-y-1">
                {filteredGuests.map(g => (
                  <button
                    key={g.id}
                    onClick={() => handleSelect(`/guests/${g.id}`)}
                    className="w-full flex items-center justify-between p-2.5 hover:bg-gold-50/60 rounded-xl transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gold-100 text-gold-900 flex items-center justify-center font-bold text-xs">
                        {g.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-navy-900">{g.name} {g.vip && <span className="text-[10px] bg-gold-100 text-gold-800 px-1.5 py-0.2 rounded font-bold">VIP</span>}</p>
                        <p className="text-xs text-navy-500">{g.phone} · {g.email}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-navy-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bookings */}
          {filteredBookings.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-gold-800 uppercase tracking-wider mb-2 px-2">Bookings</p>
              <div className="space-y-1">
                {filteredBookings.map(b => (
                  <button
                    key={b.id}
                    onClick={() => handleSelect(`/bookings/${b.id}`)}
                    className="w-full flex items-center justify-between p-2.5 hover:bg-gold-50/60 rounded-xl transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-navy-50 rounded-lg text-navy-800 font-bold text-xs">
                        {b.id}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-navy-900">{b.guestName} — Room {b.roomNumber}</p>
                        <p className="text-xs text-navy-500">{b.checkInDate} to {b.checkOutDate} · ₹{b.totalAmount.toLocaleString()} · <span className="capitalize">{b.status}</span></p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-navy-400" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
