import { mockStore } from './mockStore';
import { AuditLog } from '../types';

export const auditLogsApi = {
  getAll: async (): Promise<AuditLog[]> => {
    await new Promise(r => setTimeout(r, 40));
    return mockStore.getAuditLogs();
  },

  log: async (action: string, module: AuditLog['module'], details: string): Promise<void> => {
    mockStore.logAction(action, module, details);
  }
};
