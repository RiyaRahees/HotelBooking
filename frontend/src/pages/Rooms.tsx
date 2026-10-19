import React, { useState, useEffect, useCallback } from 'react';
import { useHotelData } from '../hooks/useHotelData';
import { PageHeader } from '../components/common/PageHeader';
import { RoomCard } from '../components/common/RoomCard';
import { Modal } from '../components/common/Modal';
import { StatusBadge } from '../components/common/StatusBadge';
import { Room, RoomStatus, RoomType } from '../types';
import { roomsApi } from '../services/rooms';
import { useNotification } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import {
  BedDouble,
  Plus,
  Search,
  LayoutGrid,
  List,
  Eye,
  Trash2,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export const Rooms: React.FC = () => {
  const { rooms, refreshAll } = useHotelData();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  // Async States
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [floorFilter, setFloorFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal States
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [statusModalRoom, setStatusModalRoom] = useState<Room | null>(null);
  const [targetStatus, setTargetStatus] = useState<RoomStatus>('Available');
  const [deleteConfirmRoom, setDeleteConfirmRoom] = useState<Room | null>(null);

  // Form State for Add Room
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newRoomType, setNewRoomType] = useState<RoomType>('Deluxe');
  const [newRoomFloor, setNewRoomFloor] = useState(1);
  const [newRoomPrice, setNewRoomPrice] = useState(5500);
  const [newBedType, setNewBedType] = useState('King Size');
  const [newSize, setNewSize] = useState(420);
  const [newAmenities, setNewAmenities] = useState('High-Speed Wi-Fi, Smart TV, Mini Bar, Marble Bath');

  // Load rooms from backend API on mount
  const loadRooms = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      await roomsApi.getAll();
      refreshAll();
    } catch (err: any) {
      const msg = err?.message || 'Failed to fetch rooms from backend';
      setFetchError(msg);
      showToast('Error Loading Rooms', msg, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [refreshAll, showToast]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  // Filter Logic
  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (room.currentGuestName && room.currentGuestName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = typeFilter === 'All' || room.type === typeFilter;
    const matchesFloor = floorFilter === 'All' || room.floor.toString() === floorFilter;
    const matchesStatus = statusFilter === 'All' || room.status === statusFilter;

    return matchesSearch && matchesType && matchesFloor && matchesStatus;
  });

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomNumber.trim()) {
      showToast('Validation Error', 'Please enter a room number.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await roomsApi.create({
        number: newRoomNumber.trim(),
        type: newRoomType,
        floor: Number(newRoomFloor),
        pricePerNight: Number(newRoomPrice),
        status: 'Available',
        amenities: newAmenities.split(',').map((s) => s.trim()).filter(Boolean),
        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
        maxOccupancy: newRoomType === 'Suite' || newRoomType === 'Executive Suite' || newRoomType === 'Presidential Suite' ? 4 : 2,
        bedType: newBedType,
        sizeSqFt: Number(newSize),
        description: `Luxury ${newRoomType.toLowerCase()} accommodation on floor ${newRoomFloor}.`,
        rating: 5.0,
      });

      showToast('Room Added', `Room ${newRoomNumber} created successfully.`);
      setAddModalOpen(false);
      setNewRoomNumber('');
      await loadRooms();
    } catch (err: any) {
      showToast('Failed to Create Room', err?.message || 'Error occurred while saving room.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!statusModalRoom) return;
    setIsSubmitting(true);
    try {
      await roomsApi.updateStatus(statusModalRoom.id, targetStatus);
      showToast(`Room ${statusModalRoom.number} Updated`, `Status changed to ${targetStatus}.`);
      setStatusModalRoom(null);
      await loadRooms();
    } catch (err: any) {
      showToast('Status Update Failed', err?.message || 'Error updating room status.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRoom = async () => {
    if (!deleteConfirmRoom) return;
    setIsSubmitting(true);
    try {
      await roomsApi.delete(deleteConfirmRoom.id);
      showToast('Room Deleted', `Room ${deleteConfirmRoom.number} removed successfully.`);
      setDeleteConfirmRoom(null);
      await loadRooms();
    } catch (err: any) {
      showToast('Deletion Failed', err?.message || 'Error deleting room.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Page Header */}
      <PageHeader
        title="Rooms Management"
        subtitle="Manage room configurations, live status, floor assignments and rates"
        icon={BedDouble}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={loadRooms}
              disabled={isLoading}
              className="px-3.5 py-2.5 bg-cream-100 hover:bg-cream-200 text-navy-800 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-cream-200 transition-colors disabled:opacity-50"
              title="Refresh Rooms"
            >
              <RefreshCw className={`w-4 h-4 text-navy-600 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={() => setAddModalOpen(true)}
              className="gold-gradient-btn px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-luxury"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Room</span>
            </button>
          </div>
        }
      />

      {/* Error Banner */}
      {fetchError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between text-xs text-red-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{fetchError}</span>
          </div>
          <button
            onClick={loadRooms}
            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-900 rounded-lg font-bold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="luxury-card p-4 bg-white rounded-2xl border border-cream-200 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
          <input
            type="text"
            placeholder="Search room number, type, guest..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-cream-50 border border-cream-200 rounded-xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-400"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Room Type */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-cream-50 border border-cream-200 rounded-xl text-xs font-semibold text-navy-800 focus:outline-none"
          >
            <option value="All">All Room Types</option>
            <option value="Standard">Standard</option>
            <option value="Deluxe">Deluxe</option>
            <option value="Suite">Suite</option>
            <option value="Executive Suite">Executive Suite</option>
            <option value="Presidential Suite">Presidential Suite</option>
          </select>

          {/* Floor */}
          <select
            value={floorFilter}
            onChange={(e) => setFloorFilter(e.target.value)}
            className="px-3 py-2 bg-cream-50 border border-cream-200 rounded-xl text-xs font-semibold text-navy-800 focus:outline-none"
          >
            <option value="All">All Floors</option>
            <option value="1">Floor 1</option>
            <option value="2">Floor 2</option>
            <option value="3">Floor 3</option>
            <option value="4">Floor 4</option>
          </select>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-cream-100 rounded-xl border border-cream-200">
            {(['All', 'Available', 'Occupied', 'Cleaning', 'Maintenance'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === st
                    ? 'bg-white text-navy-950 shadow-sm'
                    : 'text-navy-600 hover:text-navy-950'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-cream-100 rounded-xl border border-cream-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white text-navy-950 shadow-sm' : 'text-navy-400'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-white text-navy-950 shadow-sm' : 'text-navy-400'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading State Overlay / Skeleton */}
      {isLoading && rooms.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-cream-200 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-gold-500 animate-spin mb-3" />
          <p className="text-xs font-bold text-navy-800">Loading hotel rooms from backend...</p>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-cream-200">
          <BedDouble className="w-10 h-10 text-navy-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-navy-900">No Rooms Found</h3>
          <p className="text-xs text-navy-500 mt-1">Try adjusting your filters or search keywords.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onStatusClick={(r) => {
                setStatusModalRoom(r);
                setTargetStatus(r.status);
              }}
              onEditClick={(r) => navigate(`/rooms/${r.id}`)}
            />
          ))}
        </div>
      ) : (
        /* Responsive Table View */
        <div className="luxury-card bg-white rounded-2xl border border-cream-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50/70 border-b border-cream-200 text-navy-400 uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-4">Room</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Floor</th>
                  <th className="p-4">Tariff / Night</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Current Guest</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {filteredRooms.map((room) => (
                  <tr key={room.id} className="hover:bg-cream-50/50 transition-colors">
                    <td className="p-4 font-bold text-navy-900 flex items-center gap-3">
                      <img
                        src={room.image}
                        alt={room.number}
                        className="w-10 h-10 rounded-lg object-cover border border-cream-200"
                      />
                      <div>
                        <span className="text-sm font-serif font-bold text-navy-950 block">
                          Room {room.number}
                        </span>
                        <span className="text-[10px] text-navy-400">{room.bedType}</span>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-navy-800">{room.type}</td>
                    <td className="p-4 text-navy-600">Floor {room.floor}</td>
                    <td className="p-4 font-bold text-navy-900">₹{room.pricePerNight.toLocaleString()}</td>
                    <td className="p-4">
                      <StatusBadge status={room.status} size="sm" />
                    </td>
                    <td className="p-4">
                      {room.currentGuestName ? (
                        <span className="font-semibold text-navy-900">{room.currentGuestName}</span>
                      ) : (
                        <span className="text-navy-400 italic">—</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setStatusModalRoom(room);
                            setTargetStatus(room.status);
                          }}
                          className="px-2.5 py-1 bg-gold-50 hover:bg-gold-100 text-gold-900 rounded-lg font-bold border border-gold-300"
                        >
                          Status
                        </button>
                        <button
                          onClick={() => navigate(`/rooms/${room.id}`)}
                          className="p-1.5 bg-cream-100 hover:bg-cream-200 text-navy-700 rounded-lg"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmRoom(room)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-200 transition-colors"
                          title="Delete Room"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Room Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => !isSubmitting && setAddModalOpen(false)}
        title="Add New Hotel Room"
        subtitle="Register room inventory with specifications"
        maxWidth="md"
      >
        <form onSubmit={handleCreateRoom} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Room Number *</label>
              <input
                type="text"
                required
                disabled={isSubmitting}
                placeholder="e.g. 205"
                value={newRoomNumber}
                onChange={(e) => setNewRoomNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Room Type</label>
              <select
                disabled={isSubmitting}
                value={newRoomType}
                onChange={(e) => setNewRoomType(e.target.value as RoomType)}
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-400 font-semibold"
              >
                <option value="Standard">Standard</option>
                <option value="Deluxe">Deluxe</option>
                <option value="Suite">Suite</option>
                <option value="Executive Suite">Executive Suite</option>
                <option value="Presidential Suite">Presidential Suite</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Floor</label>
              <input
                type="number"
                min="1"
                max="10"
                disabled={isSubmitting}
                value={newRoomFloor}
                onChange={(e) => setNewRoomFloor(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Price / Night (₹)</label>
              <input
                type="number"
                min="1000"
                disabled={isSubmitting}
                value={newRoomPrice}
                onChange={(e) => setNewRoomPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Size (Sq Ft)</label>
              <input
                type="number"
                disabled={isSubmitting}
                value={newSize}
                onChange={(e) => setNewSize(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1">Bed Type</label>
            <input
              type="text"
              disabled={isSubmitting}
              value={newBedType}
              onChange={(e) => setNewBedType(e.target.value)}
              placeholder="King Size, Queen, Twin Beds"
              className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1">Amenities (Comma-separated)</label>
            <textarea
              rows={2}
              disabled={isSubmitting}
              value={newAmenities}
              onChange={(e) => setNewAmenities(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-cream-200">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setAddModalOpen(false)}
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
              <span>{isSubmitting ? 'Adding...' : 'Add Room'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Change Status Modal */}
      <Modal
        isOpen={!!statusModalRoom}
        onClose={() => !isSubmitting && setStatusModalRoom(null)}
        title={`Update Room ${statusModalRoom?.number} Status`}
        subtitle={`${statusModalRoom?.type} · Floor ${statusModalRoom?.floor}`}
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
              onClick={() => setStatusModalRoom(null)}
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmRoom}
        onClose={() => !isSubmitting && setDeleteConfirmRoom(null)}
        title={`Delete Room ${deleteConfirmRoom?.number}`}
        subtitle="Are you sure you want to permanently remove this room?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-navy-600">
            This will permanently remove Room <strong>{deleteConfirmRoom?.number}</strong> ({deleteConfirmRoom?.type}) from the hotel inventory. This action cannot be undone.
          </p>

          <div className="flex justify-end gap-2 pt-4 border-t border-cream-200">
            <button
              disabled={isSubmitting}
              onClick={() => setDeleteConfirmRoom(null)}
              className="px-4 py-2 text-xs font-semibold text-navy-600 hover:bg-cream-100 rounded-xl disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              disabled={isSubmitting}
              onClick={handleDeleteRoom}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isSubmitting ? 'Deleting...' : 'Confirm Delete'}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

