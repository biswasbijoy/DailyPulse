import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { analyticsService } from '../services/analyticsService';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { User } from '../models/User';

async function getTimezone(userId: string): Promise<string | undefined> {
  const user = await User.findById(userId).select('timezone');
  return user?.timezone;
}

export const getWeeklyAnalytics = asyncHandler(async (req: AuthRequest, res: Response) => {
  const timezone = await getTimezone(req.userId!);
  const data = await analyticsService.getWeekly(req.userId!, timezone);
  return sendSuccess(res, { period: 'weekly', ...data });
});

export const getMonthlyAnalytics = asyncHandler(async (req: AuthRequest, res: Response) => {
  const timezone = await getTimezone(req.userId!);
  const data = await analyticsService.getMonthly(req.userId!, timezone);
  return sendSuccess(res, { period: 'monthly', ...data });
});

export const getQuarterlyAnalytics = asyncHandler(async (req: AuthRequest, res: Response) => {
  const timezone = await getTimezone(req.userId!);
  const data = await analyticsService.getQuarterly(req.userId!, timezone);
  return sendSuccess(res, { period: 'quarterly', ...data });
});

export const getHalfYearlyAnalytics = asyncHandler(async (req: AuthRequest, res: Response) => {
  const timezone = await getTimezone(req.userId!);
  const data = await analyticsService.getHalfYearly(req.userId!, timezone);
  return sendSuccess(res, { period: 'half-yearly', ...data });
});

export const getYearlyAnalytics = asyncHandler(async (req: AuthRequest, res: Response) => {
  const timezone = await getTimezone(req.userId!);
  const data = await analyticsService.getYearly(req.userId!, timezone);
  return sendSuccess(res, { period: 'yearly', ...data });
});
