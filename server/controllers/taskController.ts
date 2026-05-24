import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { taskService } from '../services/taskService';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { getLocalDateString } from '../utils/dateUtils';
import { User } from '../models/User';

export const getTodayTasks = asyncHandler(async (req: AuthRequest, res: Response) => {
  let date = req.query.date as string;
  if (!date) {
    const user = await User.findById(req.userId!).select('timezone');
    date = getLocalDateString(user?.timezone);
  }
  const tasks = await taskService.getByDate(req.userId!, date);
  return sendSuccess(res, tasks);
});

export const getTasksByDate = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { date } = req.params;
  const tasks = await taskService.getByDate(req.userId!, date);
  return sendSuccess(res, tasks);
});

export const createTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const taskDate = req.body.taskDate || new Date().toISOString().split('T')[0];
  const task = await taskService.create(req.userId!, { ...req.body, taskDate });
  return sendSuccess(res, task, 'Task created', 201);
});

export const updateTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const task = await taskService.update(req.userId!, req.params.id, req.body);
  return sendSuccess(res, task, 'Task updated');
});

export const deleteTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  await taskService.hardDelete(req.userId!, req.params.id);
  return sendSuccess(res, null, 'Task deleted');
});

export const completeTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const task = await taskService.complete(req.userId!, req.params.id);
  return sendSuccess(res, task, 'Task completed');
});

export const postponeTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { newDate } = req.body;
  const task = await taskService.postpone(req.userId!, req.params.id, newDate);
  return sendSuccess(res, task, 'Task postponed');
});

export const revertPostponeTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const today = req.body.today || new Date().toISOString().split('T')[0];
  const task = await taskService.revertPostpone(req.userId!, req.params.id, today);
  return sendSuccess(res, task, 'Task reverted to today');
});

export const getPostponedTasks = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tasks = await taskService.getPostponed(req.userId!);
  return sendSuccess(res, tasks);
});

export const getTaskHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tasks = await taskService.getHistory(req.userId!);
  return sendSuccess(res, tasks);
});
