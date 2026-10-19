import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useHotelData } from '../hooks/useHotelData';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { roomsApi } from '../services/rooms';
import { useNotification } from '../context/NotificationContext';
import { RoomStatus } from '../types';
import {
  BedDouble,
  ChevronLeft,
  Sliders,
  Edit,
  Maximize2,
  Users,
  CheckCircle2,
  Sparkles,
  Wrench,
  ShieldCheck,
  Trash2,
  Loader2,
} from 'lucide-react';

export const RoomDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { rooms, bookings, tasks, maintenance, refreshAll } = useHotelData();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const room = rooms.find((r) => r.id === id || r.number === id);

  // Async States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Status Modal State
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<RoomStatus>(room?.status || 'Available');

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editPrice, setEditPrice] = useState(room?.pricePerNight || 5500);
  const [editBedType, setEditBedType] = useState(room?.bedType || 'King Size');
  const [editDescription, setEditDescription] = useState(room?.description || '');

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (room) {
      setTargetStatus(room.status);
      setEditPrice(room.pricePerNight);
      setEditBedType(room.bedType);
      setEditDescription(room.description);
    }
  }, [room]);

  if (!room) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-cream-200">
        <h3 className="text-lg font-bold text-navy-900">Room Not Found</h3>
        <p className="text-xs text-navy-500 mt-1">The requested room does not exist in inventory.</p>
        <Link to="/rooms" className="mt-4 inline-block gold-gradient-btn px-4 py-2 rounded-xl text-xs font-bold">
          Return to Rooms
        </Link>
      </div>
    );
  }

  const activeBooking = bookings.find(
    (b) => (b.roomId === room.id || b.roomNumber === room.number) && b.status === 'Checked In'
  );

  const roomTasks = tasks.filter((t) => t.roomId === room.id || t.roomNumber === room.number);
  const roomMaintenance = maintenance.filter((m) => m.roomId === room.id || m.roomNumber === room.number);

  const handleUpdateStatus = async () => {
    setIsSubmitting(true);
    try {
      await roomsApi.updateStatus(room.id, targetStatus);
      showToast(`Room ${room.number} Updated`, `Status changed to ${targetStatus}.`);
      setStatusModalOpen(false);
      refreshAll();
    } catch (err: any) {
      showToast('Status Update Failed', err?.message || 'Error updating room status.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await roomsApi.update(room.id, {
        pricePerNight: Number(editPrice),
        bedType: editBedType,
        description: editDescription,
      });
      showToast(`Room ${room.number} Saved`, 'Room details updated.');
      setEditModalOpen(false);
      refreshAll();
    } catch (err: any) {
      showToast('Update Failed', err?.message || 'Error saving room details.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRoom = async () => {
    setIsDeleting(true);
    try {
      await roomsApi.delete(room.id);
      showToast('Room Deleted', `Room ${room.number} has been removed.`);
      setDeleteModalOpen(false);
      refreshAll();
      navigate('/rooms');
    } catch (err: any) {
      showToast('Deletion Failed', err?.message || 'Could not delete room.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Back Button */}
      <Link
        to="/rooms"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-600 hover:text-gold-700 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Rooms Inventory</span>
      </Link>

      {/* Header */}
      <PageHeader
        title={`Room ${room.number} — ${room.type}`}
        subtitle={`Floor ${room.floor} · Max ${room.maxOccupancy} Guests · ${room.sizeSqFt} sq ft`}
        badge={`Floor ${room.floor}`}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditModalOpen(true)}
              className="px-3.5 py-2 bg-cream-100 hover:bg-cream-200 text-navy-800 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-cream-200"
            >
              <Edit className="w-4 h-4 text-navy-600" />
              <span>Edit Details</span>
            </button>
            <button
              onClick={() => {
                setTargetStatus(room.status);
                setStatusModalOpen(true);
              }}
              className="gold-gradient-btn px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-luxury"
            >
              <Sliders className="w-4 h-4" />
              <span>Change Status</span>
            </button>
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl border border-red-200 transition-colors"
              title="Delete Room"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        }
      />

      {/* Top Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: High-Res Hero Photo & Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="luxury-card overflow-hidden bg-white rounded-3xl border border-cream-200">
            <div className="relative h-72 sm:h-96 w-full">
              <img
                src={room.image}
                alt={`Room ${room.number}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-white">
                <div>
                  <span className="text-xs uppercase tracking-widest text-gold-300 font-bold block mb-1">
                    {room.type} Suite
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-bold font-serif">Room {room.number}</h2>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold text-white font-serif">₹{room.pricePerNight.toLocaleString()}</span>
                  <span className="text-xs text-gold-200 block">per night + taxes</span>
                </div>
              </div>
            </div>

            {/* Room Specifications Bar */}
            <div className="p-6">
              <h3 className="text-base font-bold font-serif text-navy-950 mb-2">Description</h3>
              <p className="text-xs sm:text-sm text-navy-600 leading-relaxed">{room.description}</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 mt-6 border-t border-cream-200">
                <div className="p-3 bg-cream-50 rounded-xl border border-cream-200">
                  <span className="text-[10px] uppercase font-bold text-navy-400 block mb-1">Bed Configuration</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-navy-900">
                    <BedDouble className="w-4 h-4 text-gold-600" />
                    <span>{room.bedType}</span>
                  </div>
                </div>

                <div className="p-3 bg-cream-50 rounded-xl border border-cream-200">
                  <span className="text-[10px] uppercase font-bold text-navy-400 block mb-1">Room Dimensions</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-navy-900">
                    <Maximize2 className="w-4 h-4 text-gold-600" />
                    <span>{room.sizeSqFt} sq ft</span>
                  </div>
                </div>

                <div className="p-3 bg-cream-50 rounded-xl border border-cream-200">
                  <span className="text-[10px] uppercase font-bold text-navy-400 block mb-1">Occupancy Limit</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-navy-900">
                    <Users className="w-4 h-4 text-gold-600" />
                    <span>Up to {room.maxOccupancy} Guests</span>
                  </div>
                </div>

                <div className="p-3 bg-cream-50 rounded-xl border border-cream-200">
                  <span className="text-[10px] uppercase font-bold text-navy-400 block mb-1">Floor Level</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-navy-900">
                    <ShieldCheck className="w-4 h-4 text-gold-600" />
                    <span>Floor {room.floor} East Wing</span>
                  </div>
                </div>
              </div>

              {/* Amenities List */}
              <div className="pt-6 mt-6 border-t border-cream-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-navy-400 mb-3">Room Amenities &amp; Features</h4>
                <div className="flex flex-wrap gap-2">
                  {room.amenities.map((amenity, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-cream-100 text-navy-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-cream-200"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-gold-600" />
                      <span>{amenity}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Current Status & Guest Card */}
        <div className="space-y-6">
          {/* Status Box */}
          <div className="luxury-card p-6 bg-white rounded-2xl border border-cream-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy-400 mb-3">Current Status</h3>
            <div className="flex items-center justify-between p-4 bg-cream-50 rounded-xl border border-cream-200">
              <div>
                <p className="text-sm font-bold text-navy-950">Room Status</p>
                <p className="text-xs text-navy-500 mt-0.5">Live operational condition</p>
              </div>
              <StatusBadge status={room.status} size="lg" />
            </div>

            {/* Current Guest if Occupied */}
            {room.status === 'Occupied' && (
              <div className="mt-4 p-4 bg-gold-50/60 border border-gold-200 rounded-xl">
                <span className="text-[10px] font-bold text-gold-800 uppercase tracking-wider block mb-2">
                  Current Occupant
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold-200 text-gold-900 flex items-center justify-center font-bold text-sm">
                    {room.currentGuestName?.[0] || 'G'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-navy-950">{room.currentGuestName || 'In-House Guest'}</p>
                    <p className="text-xs text-navy-600">Booking: {room.currentBookingId || 'BK-7801'}</p>
                  </div>
                </div>
                {activeBooking && (
                  <div className="mt-3 pt-3 border-t border-gold-200/80 text-xs text-navy-700 space-y-1">
                    <p>Check-in: {activeBooking.checkInDate}</p>
                    <p>Check-out: {activeBooking.checkOutDate}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Housekeeping History */}
          <div className="luxury-card p-6 bg-white rounded-2xl border border-cream-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-navy-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-gold-600" />
                Housekeeping Log
              </h3>
            </div>
            {roomTasks.length > 0 ? (
              <div className="space-y-2">
                {roomTasks.map((t) => (
                  <div key={t.id} className="p-3 bg-cream-50 rounded-xl border border-cream-200 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-navy-900">{t.taskType}</span>
                      <StatusBadge status={t.status} size="sm" />
                    </div>
                    <p className="text-navy-500">Staff: {t.assignedStaffName || 'Team Lead'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-navy-400 italic">No pending housekeeping tasks.</p>
            )}
          </div>

          {/* Maintenance History */}
          <div className="luxury-card p-6 bg-white rounded-2xl border border-cream-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-navy-400 flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-navy-600" />
                Maintenance Log
              </h3>
            </div>
            {roomMaintenance.length > 0 ? (
              <div className="space-y-2">
                {roomMaintenance.map((m) => (
                  <div key={m.id} className="p-3 bg-cream-50 rounded-xl border border-cream-200 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-navy-900">{m.title}</span>
                      <StatusBadge status={m.status} size="sm" />
                    </div>
                    <p className="text-navy-500">Tech: {m.assignedStaffName || 'Engineering'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-navy-400 italic">All fixtures and climate systems operating normally.</p>
            )}
          </div>
        </div>
      </div>

      {/* Change Status Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => !isSubmitting && setStatusModalOpen(false)}
        title={`Change Status — Room ${room.number}`}
        subtitle={`${room.type} · Floor ${room.floor}`}
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {(['Available', 'Occupied', 'Cleaning', 'Maintenance'] as RoomStatus[]).map((st) => (
              <button
                key={st}
                type="button"
                disabled={isSubmitting}
                onClick={() => setTargetStatus(st)}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  targetStatus === st
                    ? 'border-gold-500 bg-gold-50 text-gold-950 ring-2 ring-gold-200'
                    : 'border-cream-200 bg-white text-navy-700 hover:bg-cream-50'
                }`}
              >
                <StatusBadge status={st} showDot={false} size="sm" />
                <span className="capitalize">{st}</span>
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-cream-200">
            <button
              disabled={isSubmitting}
              onClick={() => setStatusModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-navy-600 hover:bg-cream-100 rounded-xl disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              disabled={isSubmitting}
              onClick={handleUpdateStatus}
              className="gold-gradient-btn px-5 py-2 text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isSubmitting ? 'Saving...' : 'Save Status'}</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Room Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => !isSubmitting && setEditModalOpen(false)}
        title={`Edit Room ${room.number} Details`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1">Tariff / Night (₹)</label>
            <input
              type="number"
              disabled={isSubmitting}
              value={editPrice}
              onChange={(e) => setEditPrice(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1">Bed Type</label>
            <input
              type="text"
              disabled={isSubmitting}
              value={editBedType}
              onChange={(e) => setEditBedType(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1">Description</label>
            <textarea
              rows={3}
              disabled={isSubmitting}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-cream-200">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-navy-600 hover:bg-cream-100 rounded-xl disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="gold-gradient-btn px-5 py-2 text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => !isDeleting && setDeleteModalOpen(false)}
        title={`Delete Room ${room.number}`}
        subtitle="Are you sure you want to permanently delete this room?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-navy-600">
            This will permanently remove Room <strong>{room.number}</strong> ({room.type}) from the hotel inventory. This action cannot be undone.
          </p>

          <div className="flex justify-end gap-2 pt-4 border-t border-cream-200">
            <button
              disabled={isDeleting}
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-navy-600 hover:bg-cream-100 rounded-xl disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              disabled={isDeleting}
              onClick={handleDeleteRoom}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

