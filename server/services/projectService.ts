import { Project } from '../models/Project';
import { Task } from '../models/Task';

export async function listProjects(userId: string, includeArchived = false) {
  const filter: any = { userId };
  if (!includeArchived) {
    filter.archived = false;
  }
  return Project.find(filter).sort({ name: 1 });
}

export async function createProject(userId: string, data: { name: string; description?: string; color?: string }) {
  return Project.create({ userId, ...data });
}

export async function updateProject(projectId: string, userId: string, data: any) {
  const project = await Project.findOne({ _id: projectId, userId });
  if (!project) return null;
  Object.assign(project, data);
  await project.save();
  return project;
}

export async function deleteProject(projectId: string, userId: string) {
  const project = await Project.findOne({ _id: projectId, userId });
  if (!project) return false;
  await Task.updateMany({ projectId }, { $unset: { projectId: '' } });
  await project.deleteOne();
  return true;
}
