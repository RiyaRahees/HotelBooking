import { mockStore } from './mockStore';
import { Guest } from '../types';

export const guestsApi = {
  getAll: async (): Promise<Guest[]> => {
    await new Promise(r => setTimeout(r, 70));
    return mockStore.getGuests();
  },

  getById: async (id: string): Promise<Guest | undefined> => {
    await new Promise(r => setTimeout(r, 60));
    const guests = mockStore.getGuests();
    return guests.find(g => g.id === id);
  },

  create: async (guest: Omit<Guest, 'id' | 'createdAt' | 'totalStays' | 'totalSpent'>): Promise<Guest> => {
    await new Promise(r => setTimeout(r, 120));
    return mockStore.addGuest(guest);
  },

  update: async (id: string, updates: Partial<Guest>): Promise<Guest | undefined> => {
    await new Promise(r => setTimeout(r, 100));
    const guests = mockStore.getGuests();
    const index = guests.findIndex(g => g.id === id);
    if (index !== -1) {
      guests[index] = { ...guests[index], ...updates };
      mockStore.setGuests(guests);
      return guests[index];
    }
    return undefined;
  }
};
