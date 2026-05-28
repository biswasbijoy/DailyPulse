import api from './api';
import { getLocalDateString } from '@/lib/utils';
import type { Task, CreateTaskInput, UpdateTaskInput } from '@/types';

export async function getTodayTasks(): Promise<Task[]> {
  const res = await api.get('/tasks/today', { params: { date: getLocalDateString() } });
  return res.data.data;
}

export async function getTasksByDate(date: string): Promise<Task[]> {
  const res = await api.get(`/tasks/date/${date}`);
  return res.data.data;
}

export async function getTasksByRange(start: string, end: string): Promise<Task[]> {
  const res = await api.get('/tasks/range', { params: { start, end } });
  return res.data.data;
}

export interface FilterParams {
  search?: string;
  priority?: string;
  status?: string;
  category?: string;
  tags?: string;
  dateFrom?: string;
  dateTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  projectId?: string;
}

export async function filterTasks(params: FilterParams): Promise<Task[]> {
  const res = await api.get('/tasks/filter', { params });
  return res.data.data;
}

export async function createTask(data: CreateTaskInput, taskDate?: string): Promise<Task> {
  const res = await api.post('/tasks', { ...data, taskDate: taskDate || getLocalDateString() });
  return res.data.data;
}

export async function updateTask(id: string, data: UpdateTaskInput): Promise<Task> {
  const res = await api.put(`/tasks/${id}`, data);
  return res.data.data;
}

export async function deleteTask(id: string): Promise<void> {
  await api.delete(`/tasks/${id}`);
}

export async function restoreTask(id: string): Promise<Task> {
  const res = await api.patch(`/tasks/${id}/restore`);
  return res.data.data;
}

export async function permanentDeleteTask(id: string): Promise<void> {
  await api.delete(`/tasks/${id}/permanent`);
}

export async function getTrashTasks(): Promise<Task[]> {
  const res = await api.get('/tasks/trash');
  return res.data.data;
}

export async function startTimer(id: string): Promise<Task> {
  const res = await api.post(`/tasks/${id}/timer/start`);
  return res.data.data;
}

export async function stopTimer(id: string): Promise<Task> {
  const res = await api.post(`/tasks/${id}/timer/stop`);
  return res.data.data;
}

export async function completeTask(id: string): Promise<Task> {
  const res = await api.patch(`/tasks/${id}/complete`);
  return res.data.data;
}

export async function postponeTask(id: string, newDate: string): Promise<Task> {
  const res = await api.patch(`/tasks/${id}/postpone`, { newDate });
  return res.data.data;
}

export async function revertPostponeTask(id: string): Promise<Task> {
  const res = await api.patch(`/tasks/${id}/revert`, { today: getLocalDateString() });
  return res.data.data;
}

export async function getPostponedTasks(): Promise<Task[]> {
  const res = await api.get('/tasks/postponed');
  return res.data.data;
}

export async function getPendingTasks(): Promise<Task[]> {
  const res = await api.get('/tasks/filter', { params: { status: 'pending' } });
  return res.data.data;
}

export async function getTaskHistory(): Promise<Task[]> {
  const res = await api.get('/tasks/history');
  return res.data.data;
}
