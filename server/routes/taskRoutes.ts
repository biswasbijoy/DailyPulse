import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createTaskSchema, updateTaskSchema, postponeTaskSchema } from '../utils/validation';
import {
  getTodayTasks,
  getTasksByDate,
  createTask,
  updateTask,
  deleteTask,
  completeTask,
  postponeTask,
  revertPostponeTask,
  getPostponedTasks,
  getTaskHistory,
} from '../controllers/taskController';

const router = Router();

router.use(authenticate);

router.get('/today', getTodayTasks);
router.get('/postponed', getPostponedTasks);
router.get('/history', getTaskHistory);
router.get('/date/:date', getTasksByDate);
router.post('/', validate(createTaskSchema), createTask);
router.put('/:id', validate(updateTaskSchema), updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/complete', completeTask);
router.patch('/:id/postpone', validate(postponeTaskSchema), postponeTask);
router.patch('/:id/revert', revertPostponeTask);

export default router;
