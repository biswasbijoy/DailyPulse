import { Task, ITask, RecurrenceType } from '../models/Task';
import { AppError } from '../utils/AppError';

interface CreateTaskData {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  dueDate?: string;
  tags?: string[];
  estimatedMinutes?: number;
  taskDate: string;
  recurrence?: {
    type: RecurrenceType;
    interval?: number;
    endDate?: string;
    daysOfWeek?: number[];
  };
}

interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'postponed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  dueDate?: string;
  tags?: string[];
  estimatedMinutes?: number;
  actualMinutes?: number;
  recurrence?: {
    type: RecurrenceType;
    interval?: number;
    endDate?: string;
    daysOfWeek?: number[];
  };
}

interface FilterParams {
  search?: string;
  priority?: string;
  status?: string;
  category?: string;
  tags?: string;
  dateFrom?: string;
  dateTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
}

export class TaskService {
  async create(userId: string, data: CreateTaskData): Promise<ITask> {
    const recurrence = data.recurrence?.type && data.recurrence.type !== 'none'
      ? { type: data.recurrence.type, interval: data.recurrence.interval || 1, daysOfWeek: data.recurrence.daysOfWeek || [], endDate: data.recurrence.endDate }
      : undefined;

    const task = await Task.create({
      userId,
      title: data.title,
      description: data.description,
      priority: data.priority || 'medium',
      category: data.category,
      taskDate: data.taskDate,
      currentDate: data.taskDate,
      dueDate: data.dueDate,
      tags: data.tags || [],
      estimatedMinutes: data.estimatedMinutes,
      recurrence: recurrence ? { ...recurrence, type: data.recurrence!.type } : { type: 'none', interval: 1, daysOfWeek: [] },
      isRecurrenceInstance: false,
      history: [{ action: 'created', timestamp: new Date() }],
    });
    return task;
  }

  private priorityRank(priority: string): number {
    return priority === 'high' ? 3 : priority === 'medium' ? 2 : 1;
  }

  private async sortByPriority(tasks: ITask[]): Promise<ITask[]> {
    return tasks.sort((a, b) => {
      const rankDiff = this.priorityRank(b.priority) - this.priorityRank(a.priority);
      if (rankDiff !== 0) return rankDiff;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  async getToday(userId: string): Promise<ITask[]> {
    const today = new Date().toISOString().split('T')[0];
    const tasks = await Task.find({
      userId,
      currentDate: today,
      isDeleted: false,
    });
    return this.sortByPriority(tasks);
  }

  async getByDate(userId: string, date: string): Promise<ITask[]> {
    const tasks = await Task.find({
      userId,
      currentDate: date,
      isDeleted: false,
    });
    return this.sortByPriority(tasks);
  }

  async getById(userId: string, taskId: string): Promise<ITask> {
    const task = await Task.findOne({ _id: taskId, userId, isDeleted: false });
    if (!task) {
      throw new AppError('Task not found', 404);
    }
    return task;
  }

  async update(userId: string, taskId: string, data: UpdateTaskData): Promise<ITask> {
    const task = await this.getById(userId, taskId);

    Object.assign(task, data);
    task.history.push({ action: 'updated', timestamp: new Date() });
    await task.save();

    return task;
  }

  async softDelete(userId: string, taskId: string): Promise<void> {
    const task = await this.getById(userId, taskId);
    task.isDeleted = true;
    task.deletedAt = new Date();
    task.history.push({ action: 'cancelled', timestamp: new Date() });
    await task.save();
  }

  async restore(userId: string, taskId: string): Promise<ITask> {
    const task = await Task.findOne({ _id: taskId, userId, isDeleted: true });
    if (!task) {
      throw new AppError('Task not found in trash', 404);
    }
    task.isDeleted = false;
    task.deletedAt = undefined;
    task.history.push({ action: 'updated', timestamp: new Date() });
    await task.save();
    return task;
  }

  async permanentDelete(userId: string, taskId: string): Promise<void> {
    const result = await Task.deleteOne({ _id: taskId, userId });
    if (result.deletedCount === 0) {
      throw new AppError('Task not found', 404);
    }
  }

  async getTrash(userId: string): Promise<ITask[]> {
    const tasks = await Task.find({
      userId,
      isDeleted: true,
    }).sort({ deletedAt: -1 });
    return this.sortByPriority(tasks);
  }

  async startTimer(userId: string, taskId: string): Promise<ITask> {
    const task = await this.getById(userId, taskId);
    task.timerStartedAt = new Date();
    task.status = 'in_progress';
    task.history.push({ action: 'in_progress', timestamp: new Date() });
    await task.save();
    return task;
  }

  async stopTimer(userId: string, taskId: string): Promise<ITask> {
    const task = await this.getById(userId, taskId);
    if (!task.timerStartedAt) {
      throw new AppError('Timer was not running', 400);
    }
    const elapsedMs = Date.now() - task.timerStartedAt.getTime();
    const elapsedMinutes = Math.round(elapsedMs / 60000);
    task.actualMinutes = (task.actualMinutes || 0) + elapsedMinutes;
    task.timerStartedAt = undefined;
    task.history.push({ action: 'updated', timestamp: new Date() });
    await task.save();
    return task;
  }

  private computeNextRecurrenceDate(task: ITask): string | null {
    if (task.recurrence.type === 'none') return null;

    const current = new Date(task.currentDate + 'T00:00:00');
    const nextDate = new Date(current);

    if (task.recurrence.type === 'daily') {
      nextDate.setDate(nextDate.getDate() + task.recurrence.interval);
    } else if (task.recurrence.type === 'weekdays') {
      nextDate.setDate(nextDate.getDate() + 1);
      while (nextDate.getDay() === 0 || nextDate.getDay() === 6) {
        nextDate.setDate(nextDate.getDate() + 1);
      }
    } else if (task.recurrence.type === 'weekly') {
      nextDate.setDate(nextDate.getDate() + (7 * task.recurrence.interval));
    } else if (task.recurrence.type === 'monthly') {
      nextDate.setMonth(nextDate.getMonth() + task.recurrence.interval);
    }

    const nextStr = nextDate.toISOString().split('T')[0];
    if (task.recurrence.endDate && nextStr > task.recurrence.endDate) return null;

    return nextStr;
  }

  async complete(userId: string, taskId: string): Promise<ITask> {
    const task = await this.getById(userId, taskId);

    if (task.status === 'completed') {
      task.status = 'pending';
      task.completedAt = undefined;
      task.history.push({ action: 'updated', fromDate: 'completed', toDate: 'pending', timestamp: new Date() });
      await task.save();
      return task;
    }

    task.status = 'completed';
    task.completedAt = new Date();
    task.history.push({ action: 'completed', timestamp: new Date() });
    await task.save();

    if (task.recurrence.type !== 'none') {
      const nextDate = this.computeNextRecurrenceDate(task);
      if (nextDate) {
        await Task.create({
          userId: task.userId,
          title: task.title,
          description: task.description,
          priority: task.priority,
          category: task.category,
          taskDate: nextDate,
          currentDate: nextDate,
          dueDate: task.dueDate,
          tags: task.tags,
          estimatedMinutes: task.estimatedMinutes,
          recurrence: { ...task.recurrence } as any,
          parentRecurrenceId: task.parentRecurrenceId || task._id,
          isRecurrenceInstance: true,
          history: [{ action: 'created', timestamp: new Date() }],
        });
      }
    }

    return task;
  }

  async markInProgress(userId: string, taskId: string): Promise<ITask> {
    const task = await this.getById(userId, taskId);
    task.status = 'in_progress';
    task.history.push({ action: 'in_progress', timestamp: new Date() });
    await task.save();
    return task;
  }

  async postpone(userId: string, taskId: string, newDate: string): Promise<ITask> {
    const task = await this.getById(userId, taskId);

    const oldDate = task.currentDate;
    task.currentDate = newDate;
    task.status = 'postponed';
    task.postponedCount += 1;
    task.history.push({
      action: 'postponed',
      fromDate: oldDate,
      toDate: newDate,
      timestamp: new Date(),
    });
    await task.save();

    return task;
  }

  async revertPostpone(userId: string, taskId: string, today: string): Promise<ITask> {
    const task = await this.getById(userId, taskId);
    const oldDate = task.currentDate;
    task.currentDate = today;
    task.status = 'pending';
    task.history.push({
      action: 'reverted',
      fromDate: oldDate,
      toDate: today,
      timestamp: new Date(),
    });
    await task.save();

    return task;
  }

  async getHistory(userId: string): Promise<ITask[]> {
    const tasks = await Task.find({
      userId,
      isDeleted: false,
    }).sort({ currentDate: -1, createdAt: -1 }).limit(100);
    return this.sortByPriority(tasks);
  }

  async getPostponed(userId: string): Promise<ITask[]> {
    const tasks = await Task.find({
      userId,
      status: 'postponed',
      isDeleted: false,
    });
    return this.sortByPriority(tasks);
  }

  async getByRange(userId: string, start: string, end: string): Promise<ITask[]> {
    const tasks = await Task.find({
      userId,
      currentDate: { $gte: start, $lte: end },
      isDeleted: false,
    }).sort({ currentDate: 1, priority: -1, createdAt: -1 });
    return tasks;
  }

  async search(userId: string, query: string): Promise<ITask[]> {
    const tasks = await Task.find({
      userId,
      isDeleted: false,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } },
      ],
    });
    return this.sortByPriority(tasks);
  }

  async filterByStatus(userId: string, status: string): Promise<ITask[]> {
    const tasks = await Task.find({
      userId,
      status,
      isDeleted: false,
    });
    return this.sortByPriority(tasks);
  }

  async filter(userId: string, params: FilterParams): Promise<ITask[]> {
    const query: any = { userId, isDeleted: false };

    if (params.search) {
      query.$or = [
        { title: { $regex: params.search, $options: 'i' } },
        { description: { $regex: params.search, $options: 'i' } },
        { tags: { $regex: params.search, $options: 'i' } },
      ];
    }
    if (params.priority) query.priority = params.priority;
    if (params.status) query.status = params.status;
    if (params.category) query.category = params.category;
    if (params.tags) query.tags = { $in: params.tags.split(',').map((t) => t.trim()) };
    if (params.dateFrom || params.dateTo) {
      query.currentDate = {};
      if (params.dateFrom) query.currentDate.$gte = params.dateFrom;
      if (params.dateTo) query.currentDate.$lte = params.dateTo;
    }
    if (params.dueDateFrom || params.dueDateTo) {
      query.dueDate = {};
      if (params.dueDateFrom) query.dueDate.$gte = params.dueDateFrom;
      if (params.dueDateTo) query.dueDate.$lte = params.dueDateTo;
    }

    const tasks = await Task.find(query);
    return this.sortByPriority(tasks);
  }
}

export const taskService = new TaskService();
