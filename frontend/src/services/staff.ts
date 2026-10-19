import { mockStore } from './mockStore';
import { Staff } from '../types';

export const staffApi = {
  getAll: async (): Promise<Staff[]> => {
    await new Promise(r => setTimeout(r, 60));
    return mockStore.getStaff();
  },

  create: async (member: Omit<Staff, 'id' | 'joinDate' | 'lastActive'>): Promise<Staff> => {
    await new Promise(r => setTimeout(r, 110));
    return mockStore.addStaff(member);
  },

  update: async (id: string, updates: Partial<Staff>): Promise<Staff | undefined> => {
    await new Promise(r => setTimeout(r, 90));
    return mockStore.updateStaff(id, updates);
  }
};
