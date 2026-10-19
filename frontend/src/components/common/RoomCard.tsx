import React from 'react';
import { Room } from '../../types';
import { StatusBadge } from './StatusBadge';
import { BedDouble, Maximize2, User, Eye, Edit, Sliders } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RoomCardProps {
  room: Room;
  onStatusClick?: (room: Room) => void;
  onEditClick?: (room: Room) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onStatusClick, onEditClick }) => {
  return (
    <div className="luxury-card overflow-hidden bg-white border border-[#EFE8DA] rounded-2xl flex flex-col group transition-all duration-300 hover:shadow-card">
      {/* Room Image with Badges */}
      <div className="relative h-44 w-full overflow-hidden bg-cream-100">
        <img
          src={room.image}
          alt={`Room ${room.number}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-lg text-xs font-bold text-navy-900 shadow-sm">
            Floor {room.floor}
          </span>
          <StatusBadge status={room.status} />
        </div>

        {/* Bottom Image Info */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-gold-300">{room.type}</p>
            <h4 className="text-xl font-bold font-serif">Room {room.number}</h4>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-white">₹{room.pricePerNight.toLocaleString()}</span>
            <span className="text-[11px] text-gray-200 block">/night</span>
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Room Specs */}
          <div className="flex items-center gap-4 text-xs text-navy-600 mb-3 pb-3 border-b border-cream-200">
            <div className="flex items-center gap-1.5">
              <BedDouble className="w-3.5 h-3.5 text-gold-600" />
              <span>{room.bedType}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-gold-600" />
              <span>{room.sizeSqFt} sq ft</span>
            </div>
          </div>

          {/* Current Occupant or Cleanliness state */}
          {room.status === 'Occupied' && room.currentGuestName ? (
            <div className="p-2.5 bg-cream-50 border border-cream-200 rounded-xl mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gold-100 text-gold-800 rounded-lg">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-semibold text-navy-500">Current Guest</p>
                  <p className="text-xs font-bold text-navy-900 truncate">{room.currentGuestName}</p>
                </div>
              </div>
              <span className="text-[11px] font-medium text-gold-700 bg-gold-50 px-2 py-0.5 rounded border border-gold-200">
                In Stay
              </span>
            </div>
          ) : room.status === 'Cleaning' ? (
            <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl mb-3 text-xs text-amber-900 flex items-center justify-between">
              <span className="font-medium">Housekeeping required</span>
              <span className="text-[11px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold">Priority</span>
            </div>
          ) : room.status === 'Maintenance' ? (
            <div className="p-2.5 bg-red-50/70 border border-red-200 rounded-xl mb-3 text-xs text-red-900 flex items-center justify-between">
              <span className="font-medium">Maintenance ticket active</span>
              <span className="text-[11px] bg-red-100 text-red-800 px-2 py-0.5 rounded font-semibold">Service</span>
            </div>
          ) : (
            <div className="p-2.5 bg-emerald-50/60 border border-emerald-200/80 rounded-xl mb-3 text-xs text-emerald-900 flex items-center justify-between">
              <span className="font-medium">Ready for immediate check-in</span>
              <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">Cleaned</span>
            </div>
          )}

          {/* Amenities preview tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {room.amenities.slice(0, 3).map((amenity, i) => (
              <span
                key={i}
                className="text-[10px] font-medium px-2 py-0.5 bg-cream-100 text-navy-700 rounded-md border border-cream-200"
              >
                {amenity}
              </span>
            ))}
            {room.amenities.length > 3 && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 bg-cream-100 text-navy-500 rounded-md">
                +{room.amenities.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-cream-200">
          <Link
            to={`/rooms/${room.id}`}
            className="flex items-center justify-center gap-1 py-1.5 px-2 bg-cream-50 hover:bg-cream-100 text-navy-800 text-xs font-semibold rounded-lg border border-cream-200 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-navy-600" />
            <span>View</span>
          </Link>

          <button
            onClick={() => onEditClick?.(room)}
            className="flex items-center justify-center gap-1 py-1.5 px-2 bg-cream-50 hover:bg-cream-100 text-navy-800 text-xs font-semibold rounded-lg border border-cream-200 transition-colors"
          >
            <Edit className="w-3.5 h-3.5 text-navy-600" />
            <span>Edit</span>
          </button>

          <button
            onClick={() => onStatusClick?.(room)}
            className="flex items-center justify-center gap-1 py-1.5 px-2 bg-gold-50 hover:bg-gold-100 text-gold-900 text-xs font-semibold rounded-lg border border-gold-200 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-gold-700" />
            <span>Status</span>
          </button>
        </div>
      </div>
    </div>
  );
};
