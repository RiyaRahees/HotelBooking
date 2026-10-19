import { mockStore } from './mockStore';
import { HousekeepingTask, HousekeepingStatus } from '../types';

export const housekeepingApi = {
  getAll: async (): Promise<HousekeepingTask[]> => {
    await new Promise(r => setTimeout(r, 60));
    return mockStore.getHousekeepingTasks();
  },

  getById: async (id: string): Promise<HousekeepingTask | undefined> => {
    await new Promise(r => setTimeout(r, 50));
    return mockStore.getHousekeepingTasks().find(t => t.id === id);
  },

  updateStatus: async (taskId: string, status: HousekeepingStatus): Promise<HousekeepingTask | undefined> => {
    await new Promise(r => setTimeout(r, 80));
    return mockStore.updateHousekeepingTask(taskId, { status });
  },

  updateChecklist: async (taskId: string, checklist: HousekeepingTask['checklist']): Promise<HousekeepingTask | undefined> => {
    await new Promise(r => setTimeout(r, 70));
    const allChecked = checklist.every(i => i.completed);
    return mockStore.updateHousekeepingTask(taskId, { 
      checklist,
      status: allChecked ? 'Inspection' : 'In Progress' 
    });
  },

  updateTask: async (taskId: string, updates: Partial<HousekeepingTask>): Promise<HousekeepingTask | undefined> => {
    await new Promise(r => setTimeout(r, 80));
    return mockStore.updateHousekeepingTask(taskId, updates);
  },

  inspectRoom: async (taskId: string, approved: boolean, notes: string, inspectorName: string): Promise<HousekeepingTask | undefined> => {
    await new Promise(r => setTimeout(r, 100));
    return mockStore.inspectRoom(taskId, approved, notes, inspectorName);
  },

  create: async (task: Omit<HousekeepingTask, 'id' | 'updatedAt'>): Promise<HousekeepingTask> => {
    await new Promise(r => setTimeout(r, 90));
    const tasks = mockStore.getHousekeepingTasks();
    const newTask: HousekeepingTask = {
      ...task,
      id: `hk-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    tasks.unshift(newTask);
    mockStore.setHousekeepingTasks(tasks);
    return newTask;
  }
};
