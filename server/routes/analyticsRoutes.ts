import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getWeeklyAnalytics,
  getMonthlyAnalytics,
  getQuarterlyAnalytics,
  getHalfYearlyAnalytics,
  getYearlyAnalytics,
} from '../controllers/analyticsController';

const router = Router();

router.use(authenticate);

router.get('/weekly', getWeeklyAnalytics);
router.get('/monthly', getMonthlyAnalytics);
router.get('/quarterly', getQuarterlyAnalytics);
router.get('/half-yearly', getHalfYearlyAnalytics);
router.get('/yearly', getYearlyAnalytics);

export default router;
