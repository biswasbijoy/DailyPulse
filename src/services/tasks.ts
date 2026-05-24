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

export async function createTask(data: CreateTaskInput): Promise<Task> {
  const res = await api.post('/tasks', { ...data, taskDate: getLocalDateString() });
  return res.data.data;
}

export async function updateTask(id: string, data: UpdateTaskInput): Promise<Task> {
  const res = await api.put(`/tasks/${id}`, data);
  return res.data.data;
}

export async function deleteTask(id: string): Promise<void> {
  await api.delete(`/tasks/${id}`);
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

export async function getTaskHistory(): Promise<Task[]> {
  const res = await api.get('/tasks/history');
  return res.data.data;
}
