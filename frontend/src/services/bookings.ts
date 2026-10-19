import { mockStore } from './mockStore';
import { Booking, BookingStatus, PaymentStatus, RoomType } from '../types';
import { apiClient } from './apiClient';

// Helper to convert backend uppercase status to frontend title case
export const toFrontendBookingStatus = (status: string): BookingStatus => {
  const map: Record<string, BookingStatus> = {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    CHECKED_IN: 'Checked In',
    CHECKED_OUT: 'Checked Out',
    CANCELLED: 'Cancelled',
    NO_SHOW: 'No-show',
  };
  return map[status?.toUpperCase()] || (status as BookingStatus) || 'Confirmed';
};

// Helper to convert frontend title case status to backend uppercase
export const toBackendBookingStatus = (status: BookingStatus | string): string => {
  const map: Record<string, string> = {
    Pending: 'PENDING',
    Confirmed: 'CONFIRMED',
    'Checked In': 'CHECKED_IN',
    'Checked Out': 'CHECKED_OUT',
    Cancelled: 'CANCELLED',
    'No-show': 'NO_SHOW',
  };
  return map[status] || status?.toUpperCase() || 'CONFIRMED';
};

// Helper to convert backend payment status to frontend title case
export const toFrontendPaymentStatus = (status: string): PaymentStatus => {
  const map: Record<string, PaymentStatus> = {
    PAID: 'Paid',
    PARTIALLY_PAID: 'Partial',
    PENDING: 'Pending',
    REFUNDED: 'Refunded',
    FAILED: 'Failed',
  };
  return map[status?.toUpperCase()] || (status as PaymentStatus) || 'Pending';
};

// Helper to convert frontend payment status to backend uppercase
export const toBackendPaymentStatus = (status: PaymentStatus | string): string => {
  const map: Record<string, string> = {
    Paid: 'PAID',
    Partial: 'PARTIALLY_PAID',
    Pending: 'PENDING',
    Refunded: 'REFUNDED',
    Failed: 'FAILED',
  };
  return map[status] || status?.toUpperCase() || 'PENDING';
};

// Transform backend booking document to frontend Booking model
export const transformBackendBooking = (doc: any): Booking => {
  const guestObj = typeof doc.guest === 'object' && doc.guest !== null ? doc.guest : null;
  const roomObj = typeof doc.room === 'object' && doc.room !== null ? doc.room : null;
  const roomTypeObj = typeof doc.roomType === 'object' && doc.roomType !== null ? doc.roomType : null;

  const guestName = guestObj
    ? `${guestObj.firstName || ''} ${guestObj.lastName || ''}`.trim() || guestObj.fullName || 'Guest'
    : doc.guestName || 'Guest';

  const guestPhone = guestObj?.phone || doc.guestPhone || '';
  const guestEmail = guestObj?.email || doc.guestEmail || '';
  const guestAvatar =
    guestObj?.avatar ||
    doc.guestAvatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';

  const roomNumber = roomObj?.roomNumber || doc.roomNumber || '';
  const roomTypeName = (roomTypeObj?.name ||
    roomObj?.roomType?.name ||
    (typeof doc.roomType === 'string' ? doc.roomType : 'Deluxe')) as RoomType;

  const checkInDate = doc.checkInDate ? new Date(doc.checkInDate).toISOString().split('T')[0] : '';
  const checkOutDate = doc.checkOutDate ? new Date(doc.checkOutDate).toISOString().split('T')[0] : '';

  const formatTime = (dateVal?: any) => {
    if (!dateVal) return undefined;
    try {
      return new Date(dateVal).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return undefined;
    }
  };

  return {
    id: doc.bookingId || doc._id || `BK-${Date.now()}`,
    guestId: guestObj?._id || guestObj?.id || (typeof doc.guest === 'string' ? doc.guest : `guest-${doc.bookingId}`),
    guestName,
    guestPhone,
    guestEmail,
    guestAvatar,
    roomId: roomObj?._id || roomObj?.id || (typeof doc.room === 'string' ? doc.room : `room-${roomNumber}`),
    roomNumber,
    roomType: roomTypeName,
    checkInDate,
    checkOutDate,
    arrivalTime: formatTime(doc.actualCheckIn) || doc.arrivalTime || '02:00 PM',
    departureTime: formatTime(doc.actualCheckOut) || doc.departureTime || '11:00 AM',
    adults: doc.adults || 1,
    children: doc.children || 0,
    totalAmount: doc.totalAmount || 0,
    paidAmount: doc.paidAmount || 0,
    balanceAmount:
      doc.balanceAmount !== undefined
        ? doc.balanceAmount
        : Math.max(0, (doc.totalAmount || 0) - (doc.paidAmount || 0)),
    taxAmount: doc.tax || doc.taxAmount || 0,
    discountAmount: doc.discount || doc.discountAmount || 0,
    paymentStatus: toFrontendPaymentStatus(doc.paymentStatus || 'PENDING'),
    status: toFrontendBookingStatus(doc.bookingStatus || 'CONFIRMED'),
    specialRequests: doc.specialRequests || '',
    notes: doc.notes || '',
    paymentMethod: doc.paymentMethod || 'Card',
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString().split('T')[0] : '',
  };
};

export const bookingsApi = {
  // GET /api/bookings
  getAll: async (params?: {
    status?: string;
    paymentStatus?: string;
    search?: string;
    roomId?: string;
    guestId?: string;
  }): Promise<Booking[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status && params.status !== 'All') {
        queryParams.append('status', toBackendBookingStatus(params.status));
      }
      if (params?.paymentStatus && params.paymentStatus !== 'All') {
        queryParams.append('paymentStatus', toBackendPaymentStatus(params.paymentStatus));
      }
      if (params?.search) {
        queryParams.append('search', params.search);
      }
      if (params?.roomId) {
        queryParams.append('roomId', params.roomId);
      }
      if (params?.guestId) {
        queryParams.append('guestId', params.guestId);
      }

      const endpoint = queryParams.toString() ? `/bookings?${queryParams.toString()}` : '/bookings';
      const res = await apiClient.get<any[]>(endpoint);

      if (res.success && Array.isArray(res.data)) {
        const transformed = res.data.map(transformBackendBooking);
        mockStore.setBookings(transformed);
        return transformed;
      }
      return mockStore.getBookings();
    } catch (err) {
      console.warn('[bookingsApi.getAll] Backend unreachable, using mockStore:', err);
      return mockStore.getBookings();
    }
  },

  // GET /api/bookings/:id
  getById: async (id: string): Promise<Booking | undefined> => {
    try {
      const res = await apiClient.get<any>(`/bookings/${id}`);
      if (res.success && res.data) {
        return transformBackendBooking(res.data);
      }
    } catch (err) {
      console.warn(`[bookingsApi.getById] Backend lookup for '${id}' failed:`, err);
    }
    const bookings = mockStore.getBookings();
    return bookings.find((b) => b.id === id);
  },

  // GET /api/bookings/available-rooms
  getAvailableRooms: async (
    checkInOrParams: string | { checkIn?: string; checkOut?: string; checkInDate?: string; checkOutDate?: string; roomType?: string },
    checkOut?: string,
    roomTypeParam?: string
  ): Promise<any[]> => {
    try {
      let checkInDate = '';
      let checkOutDate = '';
      let roomType: string | undefined = roomTypeParam;

      if (typeof checkInOrParams === 'object') {
        checkInDate = checkInOrParams.checkInDate || checkInOrParams.checkIn || '';
        checkOutDate = checkInOrParams.checkOutDate || checkInOrParams.checkOut || '';
        roomType = checkInOrParams.roomType;
      } else {
        checkInDate = checkInOrParams;
        checkOutDate = checkOut || '';
      }

      const queryParams = new URLSearchParams();
      if (checkInDate) queryParams.append('checkInDate', checkInDate);
      if (checkOutDate) queryParams.append('checkOutDate', checkOutDate);
      if (roomType && roomType !== 'All') {
        queryParams.append('roomType', roomType);
      }

      const endpoint = queryParams.toString() ? `/bookings/available-rooms?${queryParams.toString()}` : '/bookings/available-rooms';
      const res = await apiClient.get<any[]>(endpoint);
      if (res.success && Array.isArray(res.data)) {
        return res.data;
      }
    } catch (err) {
      console.warn('[bookingsApi.getAvailableRooms] Failed to check room availability:', err);
    }
    return [];
  },

  // POST /api/bookings
  create: async (
    bookingData: Partial<Booking> & {
      guestId?: string;
      newGuest?: any;
      guestName: string;
      guestPhone: string;
      guestEmail?: string;
      roomId: string;
      checkInDate: string;
      checkOutDate: string;
    }
  ): Promise<Booking> => {
    let createdBooking: Booking | undefined;

    try {
      const payload = {
        guestId: bookingData.guestId?.startsWith('guest-') ? undefined : bookingData.guestId,
        newGuest: bookingData.newGuest,
        guestName: bookingData.guestName,
        guestPhone: bookingData.guestPhone,
        guestEmail: bookingData.guestEmail,
        roomId: bookingData.roomId,
        checkInDate: bookingData.checkInDate,
        checkOutDate: bookingData.checkOutDate,
        adults: Number(bookingData.adults) || 1,
        children: Number(bookingData.children) || 0,
        specialRequests: bookingData.specialRequests || '',
        notes: bookingData.notes || '',
        discount: Number(bookingData.discountAmount) || 0,
        advanceAmount: Number(bookingData.paidAmount) || 0,
        source: 'Direct Front Desk',
        paymentMethod: (bookingData.paymentMethod?.toUpperCase() as any) || 'CARD',
      };

      const res = await apiClient.post<any>('/bookings', payload);
      if (res.success && res.data) {
        createdBooking = transformBackendBooking(res.data);
      }
    } catch (err) {
      console.warn('[bookingsApi.create] Backend reservation failed, fallback to local store:', err);
      throw err;
    }

    if (!createdBooking) {
      createdBooking = mockStore.addBooking(bookingData as any);
    } else {
      const bookings = mockStore.getBookings();
      const existingIdx = bookings.findIndex((b) => b.id === createdBooking!.id);
      if (existingIdx !== -1) {
        bookings[existingIdx] = createdBooking;
      } else {
        bookings.unshift(createdBooking);
      }
      mockStore.setBookings(bookings);
    }

    return createdBooking;
  },

  // PUT /api/bookings/:id
  update: async (id: string, updates: Partial<Booking>): Promise<Booking | undefined> => {
    let updatedBooking: Booking | undefined;

    try {
      const payload: any = {};
      if (updates.specialRequests !== undefined) payload.specialRequests = updates.specialRequests;
      if (updates.notes !== undefined) payload.notes = updates.notes;
      if (updates.adults !== undefined) payload.adults = Number(updates.adults);
      if (updates.children !== undefined) payload.children = Number(updates.children);
      if (updates.discountAmount !== undefined) payload.discount = Number(updates.discountAmount);
      if (updates.status) payload.bookingStatus = toBackendBookingStatus(updates.status);

      const res = await apiClient.put<any>(`/bookings/${id}`, payload);
      if (res.success && res.data) {
        updatedBooking = transformBackendBooking(res.data);
      }
    } catch (err) {
      console.warn(`[bookingsApi.update] Backend update for '${id}' failed:`, err);
    }

    const bookings = mockStore.getBookings();
    const index = bookings.findIndex((b) => b.id === id);
    if (index !== -1) {
      const merged = updatedBooking || { ...bookings[index], ...updates };
      bookings[index] = merged;
      mockStore.setBookings(bookings);
      return merged;
    }

    return updatedBooking;
  },

  // PATCH /api/bookings/:id/status
  updateStatus: async (id: string, status: BookingStatus, paidAdd?: number): Promise<Booking | undefined> => {
    let updatedBooking: Booking | undefined;

    try {
      if (status === 'Checked In') {
        const res = await apiClient.patch<any>(`/bookings/${id}/check-in`, {
          collectAmount: paidAdd || 0,
        });
        if (res.success && res.data) {
          updatedBooking = transformBackendBooking(res.data);
        }
      } else if (status === 'Checked Out') {
        const res = await apiClient.patch<any>(`/bookings/${id}/check-out`, {
          settleAmount: paidAdd || 0,
        });
        if (res.success && res.data) {
          updatedBooking = transformBackendBooking(res.data);
        }
      } else if (status === 'Cancelled') {
        const res = await apiClient.patch<any>(`/bookings/${id}/cancel`);
        if (res.success && res.data) {
          updatedBooking = transformBackendBooking(res.data);
        }
      } else {
        const res = await apiClient.patch<any>(`/bookings/${id}/status`, {
          status: toBackendBookingStatus(status),
        });
        if (res.success && res.data) {
          updatedBooking = transformBackendBooking(res.data);
        }
      }
    } catch (err) {
      console.warn(`[bookingsApi.updateStatus] Backend status update for '${id}' failed:`, err);
    }

    return updatedBooking || mockStore.updateBookingStatus(id, status, paidAdd);
  },

  // PATCH /api/bookings/:id/check-in
  checkIn: async (id: string, payload?: { collectAmount?: number; paymentMethod?: string }): Promise<Booking> => {
    const res = await apiClient.patch<any>(`/bookings/${id}/check-in`, payload || {});
    if (res.success && res.data) {
      const transformed = transformBackendBooking(res.data);
      const bookings = mockStore.getBookings();
      const idx = bookings.findIndex((b) => b.id === id);
      if (idx !== -1) {
        bookings[idx] = transformed;
        mockStore.setBookings(bookings);
      }
      return transformed;
    }
    throw new Error(res.message || 'Check-in failed');
  },

  // PATCH /api/bookings/:id/check-out
  checkOut: async (
    id: string,
    payload?: {
      foodCharges?: number;
      laundryCharges?: number;
      serviceCharges?: number;
      additionalDiscount?: number;
      settleAmount?: number;
      paymentMethod?: string;
    }
  ): Promise<Booking> => {
    const res = await apiClient.patch<any>(`/bookings/${id}/check-out`, payload || {});
    if (res.success && res.data) {
      const transformed = transformBackendBooking(res.data);
      const bookings = mockStore.getBookings();
      const idx = bookings.findIndex((b) => b.id === id);
      if (idx !== -1) {
        bookings[idx] = transformed;
        mockStore.setBookings(bookings);
      }
      return transformed;
    }
    throw new Error(res.message || 'Check-out failed');
  },

  // PATCH /api/bookings/:id/cancel
  cancel: async (id: string, reason?: string): Promise<Booking> => {
    const res = await apiClient.patch<any>(`/bookings/${id}/cancel`, { reason });
    if (res.success && res.data) {
      const transformed = transformBackendBooking(res.data);
      const bookings = mockStore.getBookings();
      const idx = bookings.findIndex((b) => b.id === id);
      if (idx !== -1) {
        bookings[idx] = transformed;
        mockStore.setBookings(bookings);
      }
      return transformed;
    }
    throw new Error(res.message || 'Cancellation failed');
  },

  // DELETE /api/bookings/:id
  delete: async (id: string): Promise<boolean> => {
    try {
      const res = await apiClient.delete<any>(`/bookings/${id}`);
      if (res.success) {
        const bookings = mockStore.getBookings().filter((b) => b.id !== id);
        mockStore.setBookings(bookings);
        return true;
      }
    } catch (err) {
      console.warn(`[bookingsApi.delete] Backend deletion for '${id}' failed:`, err);
    }
    const bookings = mockStore.getBookings().filter((b) => b.id !== id);
    mockStore.setBookings(bookings);
    return true;
  },
};
