import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createTaskSchema, updateTaskSchema, postponeTaskSchema } from '../utils/validation';
import {
  getTodayTasks,
  getTasksByDate,
  getTasksByRange,
  filterTasks,
  createTask,
  updateTask,
  deleteTask,
  restoreTask,
  permanentDeleteTask,
  getTrashTasks,
  completeTask,
  postponeTask,
  revertPostponeTask,
  startTimer,
  stopTimer,
  getPostponedTasks,
  getTaskHistory,
} from '../controllers/taskController';

const router = Router();

router.use(authenticate);

router.get('/today', getTodayTasks);
router.get('/range', getTasksByRange);
router.get('/filter', filterTasks);
router.get('/postponed', getPostponedTasks);
router.get('/history', getTaskHistory);
router.get('/trash', getTrashTasks);
router.get('/date/:date', getTasksByDate);
router.post('/', validate(createTaskSchema), createTask);
router.put('/:id', validate(updateTaskSchema), updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/restore', restoreTask);
router.delete('/:id/permanent', permanentDeleteTask);
router.patch('/:id/complete', completeTask);
router.patch('/:id/postpone', validate(postponeTaskSchema), postponeTask);
router.patch('/:id/revert', revertPostponeTask);
router.post('/:id/timer/start', startTimer);
router.post('/:id/timer/stop', stopTimer);

export default router;
