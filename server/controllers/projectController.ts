import { Response } from 'express';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import type { AuthRequest } from '../middleware/auth';
import * as projectService from '../services/projectService';

export const list = asyncHandler(async (req: AuthRequest, res: Response) => {
  const includeArchived = req.query.includeArchived === 'true';
  const projects = await projectService.listProjects(req.userId!, includeArchived);
  return sendSuccess(res, { projects });
});

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const project = await projectService.createProject(req.userId!, req.body);
  return sendSuccess(res, { project }, 'Project created', 201);
});

export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
  const project = await projectService.updateProject(req.params.id, req.userId!, req.body);
  if (!project) throw new AppError('Project not found', 404);
  return sendSuccess(res, { project }, 'Project updated');
});

export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
  const deleted = await projectService.deleteProject(req.params.id, req.userId!);
  if (!deleted) throw new AppError('Project not found', 404);
  return sendSuccess(res, null, 'Project deleted');
});
