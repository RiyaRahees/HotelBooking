import { mockStore } from './mockStore';
import { HotelSettings } from '../types';

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
