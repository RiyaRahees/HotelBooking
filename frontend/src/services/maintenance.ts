import { mockStore } from './mockStore';
import { MaintenanceIssue, MaintenanceStatus } from '../types';

export const maintenanceApi = {
  getAll: async (): Promise<MaintenanceIssue[]> => {
    await new Promise(r => setTimeout(r, 70));
    return mockStore.getMaintenanceIssues();
  },

  getById: async (id: string): Promise<MaintenanceIssue | undefined> => {
    await new Promise(r => setTimeout(r, 50));
    return mockStore.getMaintenanceIssues().find(i => i.id === id);
  },

  create: async (issue: Omit<MaintenanceIssue, 'id' | 'reportedAt'>): Promise<MaintenanceIssue> => {
    await new Promise(r => setTimeout(r, 120));
    return mockStore.addMaintenanceIssue(issue);
  },

  updateStatus: async (id: string, status: MaintenanceStatus): Promise<MaintenanceIssue | undefined> => {
    await new Promise(r => setTimeout(r, 100));
    return mockStore.updateMaintenanceIssue(id, { status });
  },

  update: async (id: string, updates: Partial<MaintenanceIssue>): Promise<MaintenanceIssue | undefined> => {
    await new Promise(r => setTimeout(r, 100));
    return mockStore.updateMaintenanceIssue(id, updates);
  }
};
