import { mockStore } from './mockStore';
import { Feedback } from '../types';

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
