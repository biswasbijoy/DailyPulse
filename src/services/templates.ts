import api from './api';
import type { TaskTemplate, CreateTaskInput } from '@/types';

export async function getTemplates(): Promise<TaskTemplate[]> {
  const res = await api.get('/templates');
  return res.data.data;
}

export async function createTemplate(data: { name: string; title: string; description?: string; priority?: string; category?: string; dueDateOffset?: number; tags?: string[]; estimatedMinutes?: number; recurrenceType?: string; recurrenceInterval?: number }): Promise<TaskTemplate> {
  const res = await api.post('/templates', data);
  return res.data.data;
}

export async function updateTemplate(id: string, data: any): Promise<TaskTemplate> {
  const res = await api.put(`/templates/${id}`, data);
  return res.data.data;
}

export async function deleteTemplate(id: string): Promise<void> {
  await api.delete(`/templates/${id}`);
}

export async function applyTemplate(id: string, taskDate: string): Promise<CreateTaskInput> {
  const res = await api.post(`/templates/${id}/apply`, { taskDate });
  return res.data.data;
}
