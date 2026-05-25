import { Request, Response } from 'express';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import type { AuthRequest } from '../middleware/auth';
import * as templateService from '../services/templateService';

export const list = asyncHandler(async (req: AuthRequest, res: Response) => {
  const templates = await templateService.listTemplates(req.userId!);
  return sendSuccess(res, { templates });
});

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const template = await templateService.createTemplate(req.userId!, req.body);
  return sendSuccess(res, { template }, 'Template created', 201);
});

export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
  const template = await templateService.updateTemplate(req.params.id, req.userId!, req.body);
  if (!template) throw new AppError('Template not found', 404);
  return sendSuccess(res, { template }, 'Template updated');
});

export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
  const deleted = await templateService.deleteTemplate(req.params.id, req.userId!);
  if (!deleted) throw new AppError('Template not found', 404);
  return sendSuccess(res, null, 'Template deleted');
});

export const apply = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { taskDate } = req.body;
  if (!taskDate) throw new AppError('taskDate is required', 400);
  const task = await templateService.applyTemplate(req.params.id, req.userId!, taskDate);
  if (!task) throw new AppError('Template not found', 404);
  return sendSuccess(res, { task }, 'Task created from template', 201);
});
