import { mockStore } from './mockStore';
import { Payment, Feedback, Staff, HotelSettings } from '../types';

export const paymentsApi = {
  getAll: async (): Promise<Payment[]> => {
    await new Promise(r => setTimeout(r, 60));
    return mockStore.getPayments();
  },

  create: async (payment: Omit<Payment, 'id' | 'transactionId' | 'invoiceNumber' | 'date'>): Promise<Payment> => {
    await new Promise(r => setTimeout(r, 100));
    return mockStore.addPayment(payment);
  }
};

export const feedbackApi = {
  getAll: async (): Promise<Feedback[]> => {
    await new Promise(r => setTimeout(r, 60));
    return mockStore.getFeedback();
  },

  respond: async (feedbackId: string, response: string): Promise<Feedback | undefined> => {
    await new Promise(r => setTimeout(r, 90));
    const list = mockStore.getFeedback();
    const item = list.find(f => f.id === feedbackId);
    if (item) {
      item.response = response;
      mockStore.setFeedback(list);
      return item;
    }
    return undefined;
  }
};

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

export const settingsApi = {
  get: async (): Promise<HotelSettings> => {
    await new Promise(r => setTimeout(r, 50));
    return mockStore.getSettings();
  },

  update: async (settings: HotelSettings): Promise<HotelSettings> => {
    await new Promise(r => setTimeout(r, 90));
    mockStore.setSettings(settings);
    return settings;
  },

  resetAll: async (): Promise<void> => {
    await new Promise(r => setTimeout(r, 150));
    mockStore.resetAllData();
  }
};
