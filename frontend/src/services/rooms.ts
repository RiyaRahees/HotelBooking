import { mockStore } from './mockStore';
import { Room, RoomStatus, RoomType } from '../types';
import { apiClient } from './apiClient';

// Helper to convert backend uppercase status to frontend title case
export const toFrontendStatus = (status: string): RoomStatus => {
  const map: Record<string, RoomStatus> = {
    AVAILABLE: 'Available',
    RESERVED: 'Reserved',
    OCCUPIED: 'Occupied',
    CLEANING: 'Cleaning',
    INSPECTION: 'Inspection',
    MAINTENANCE: 'Maintenance',
    OUT_OF_SERVICE: 'Out of Service',
  };
  return map[status.toUpperCase()] || (status as RoomStatus);
};

// Helper to convert frontend title case status to backend uppercase
export const toBackendStatus = (status: RoomStatus | string): string => {
  const map: Record<string, string> = {
    Available: 'AVAILABLE',
    Reserved: 'RESERVED',
    Occupied: 'OCCUPIED',
    Cleaning: 'CLEANING',
    Inspection: 'INSPECTION',
    Maintenance: 'MAINTENANCE',
    'Out of Service': 'OUT_OF_SERVICE',
  };
  return map[status] || status.toUpperCase();
};

// Transform backend room document to frontend Room model
export const transformBackendRoom = (doc: any): Room => {
  let typeName: RoomType = 'Deluxe';
  if (doc.roomType) {
    if (typeof doc.roomType === 'object' && doc.roomType.name) {
      typeName = doc.roomType.name as RoomType;
    } else if (typeof doc.roomType === 'string') {
      typeName = doc.roomType as RoomType;
    }
  }

  const currentGuestName = doc.currentGuest
    ? typeof doc.currentGuest === 'object'
      ? `${doc.currentGuest.firstName || ''} ${doc.currentGuest.lastName || ''}`.trim()
      : undefined
    : undefined;

  const currentGuestId = doc.currentGuest
    ? typeof doc.currentGuest === 'object'
      ? doc.currentGuest._id || doc.currentGuest.id
      : doc.currentGuest
    : undefined;

  const currentBookingId = doc.currentBooking
    ? typeof doc.currentBooking === 'object'
      ? doc.currentBooking.bookingId || doc.currentBooking._id
      : doc.currentBooking
    : undefined;

  return {
    id: doc._id || doc.id || `room-${doc.roomNumber}`,
    number: doc.roomNumber || doc.number || '',
    type: typeName,
    floor: doc.floor || 1,
    pricePerNight: doc.pricePerNight || 0,
    status: toFrontendStatus(doc.status || 'AVAILABLE'),
    amenities: doc.amenities || [],
    image: doc.images?.[0] || doc.image || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    maxOccupancy: doc.capacity || doc.maxOccupancy || 2,
    currentGuestId,
    currentGuestName,
    currentBookingId,
    bedType: doc.bedType || 'King Bed',
    sizeSqFt: doc.sizeSqFt || 350,
    description: doc.description || '',
    rating: doc.rating || 4.8,
  };
};

export const roomsApi = {
  // GET /api/rooms
  getAll: async (params?: { status?: string; roomType?: string; floor?: string; search?: string }): Promise<Room[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status && params.status !== 'All') queryParams.append('status', toBackendStatus(params.status));
      if (params?.roomType && params.roomType !== 'All') queryParams.append('roomType', params.roomType);
      if (params?.floor && params.floor !== 'All') queryParams.append('floor', params.floor);
      if (params?.search) queryParams.append('search', params.search);

      const endpoint = queryParams.toString() ? `/rooms?${queryParams.toString()}` : '/rooms';
      const res = await apiClient.get<any[]>(endpoint);

      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const transformed = res.data.map(transformBackendRoom);
        mockStore.setRooms(transformed);
        return transformed;
      }
      // Fall back to local store if backend returned empty array
      return mockStore.getRooms();
    } catch (err) {
      console.warn('[roomsApi.getAll] Backend unreachable, using mockStore:', err);
      return mockStore.getRooms();
    }
  },

  // GET /api/rooms/:id
  getById: async (id: string): Promise<Room | undefined> => {
    try {
      const res = await apiClient.get<any>(`/rooms/${id}`);
      if (res.success && res.data) {
        return transformBackendRoom(res.data);
      }
    } catch (err) {
      console.warn(`[roomsApi.getById] Backend lookup for '${id}' failed:`, err);
    }
    const rooms = mockStore.getRooms();
    return rooms.find((r) => r.id === id || r.number === id);
  },

  // POST /api/rooms
  create: async (roomData: Omit<Room, 'id'>): Promise<Room> => {
    let createdRoom: Room | undefined;

    try {
      const payload = {
        roomNumber: roomData.number,
        roomType: roomData.type,
        floor: Number(roomData.floor),
        pricePerNight: Number(roomData.pricePerNight),
        capacity: roomData.maxOccupancy || 2,
        amenities: roomData.amenities || [],
        images: roomData.image ? [roomData.image] : [],
        description: roomData.description || '',
        bedType: roomData.bedType || 'King Bed',
        sizeSqFt: Number(roomData.sizeSqFt) || 350,
        status: toBackendStatus(roomData.status || 'Available'),
      };

      const res = await apiClient.post<any>('/rooms', payload);
      if (res.success && res.data) {
        createdRoom = transformBackendRoom(res.data);
      }
    } catch (err) {
      console.warn('[roomsApi.create] Backend creation failed, saving locally:', err);
    }

    if (!createdRoom) {
      createdRoom = {
        ...roomData,
        id: `room-${roomData.number}`,
      };
    }

    const rooms = mockStore.getRooms();
    const existingIdx = rooms.findIndex((r) => r.number === createdRoom!.number);
    if (existingIdx !== -1) {
      rooms[existingIdx] = createdRoom;
    } else {
      rooms.unshift(createdRoom);
    }
    mockStore.setRooms(rooms);

    return createdRoom;
  },

  // PUT /api/rooms/:id
  update: async (id: string, updates: Partial<Room>): Promise<Room | undefined> => {
    let updatedRoom: Room | undefined;

    try {
      const payload: any = {};
      if (updates.number) payload.roomNumber = updates.number;
      if (updates.type) payload.roomType = updates.type;
      if (updates.floor !== undefined) payload.floor = Number(updates.floor);
      if (updates.pricePerNight !== undefined) payload.pricePerNight = Number(updates.pricePerNight);
      if (updates.maxOccupancy !== undefined) payload.capacity = Number(updates.maxOccupancy);
      if (updates.amenities) payload.amenities = updates.amenities;
      if (updates.image) payload.images = [updates.image];
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.bedType !== undefined) payload.bedType = updates.bedType;
      if (updates.sizeSqFt !== undefined) payload.sizeSqFt = Number(updates.sizeSqFt);
      if (updates.status) payload.status = toBackendStatus(updates.status);

      const res = await apiClient.put<any>(`/rooms/${id}`, payload);
      if (res.success && res.data) {
        updatedRoom = transformBackendRoom(res.data);
      }
    } catch (err) {
      console.warn(`[roomsApi.update] Backend update for '${id}' failed:`, err);
    }

    const rooms = mockStore.getRooms();
    const index = rooms.findIndex((r) => r.id === id || r.number === id);
    if (index !== -1) {
      const merged = updatedRoom || { ...rooms[index], ...updates };
      rooms[index] = merged;
      mockStore.setRooms(rooms);
      return merged;
    }

    return updatedRoom;
  },

  // PATCH /api/rooms/:id/status
  updateStatus: async (
    id: string,
    status: RoomStatus,
    guestInfo?: { guestId?: string; guestName?: string; bookingId?: string }
  ): Promise<Room | undefined> => {
    try {
      await apiClient.patch<any>(`/rooms/${id}/status`, {
        status: toBackendStatus(status),
      });
    } catch (err) {
      console.warn(`[roomsApi.updateStatus] Backend status update for '${id}' failed:`, err);
    }

    return mockStore.updateRoomStatus(id, status, guestInfo);
  },

  // DELETE /api/rooms/:id
  delete: async (id: string): Promise<boolean> => {
    try {
      const res = await apiClient.delete<any>(`/rooms/${id}`);
      if (res.success) {
        const rooms = mockStore.getRooms().filter((r) => r.id !== id && r.number !== id);
        mockStore.setRooms(rooms);
        return true;
      }
    } catch (err) {
      console.warn(`[roomsApi.delete] Backend deletion for '${id}' failed:`, err);
    }

    const rooms = mockStore.getRooms().filter((r) => r.id !== id && r.number !== id);
    mockStore.setRooms(rooms);
    return true;
  },
};
