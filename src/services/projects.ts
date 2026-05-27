import api from './api';
import type { Project } from '@/types';

export async function getProjects(includeArchived = false): Promise<Project[]> {
  const res = await api.get(`/projects?includeArchived=${includeArchived}`);
  return res.data.data.projects;
}

export async function getProjectById(id: string): Promise<Project> {
  const res = await api.get(`/projects/${id}`);
  return res.data.data.project;
}

export async function createProject(data: { name: string; description?: string; color?: string }): Promise<Project> {
  const res = await api.post('/projects', data);
  return res.data.data;
}

export async function updateProject(id: string, data: { name?: string; description?: string; color?: string; archived?: boolean }): Promise<Project> {
  const res = await api.put(`/projects/${id}`, data);
  return res.data.data;
}

export async function deleteProject(id: string): Promise<void> {
  await api.delete(`/projects/${id}`);
}
