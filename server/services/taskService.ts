import { Task, ITask } from '../models/Task';
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
}

export class TaskService {
  async create(userId: string, data: CreateTaskData): Promise<ITask> {
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

  async hardDelete(userId: string, taskId: string): Promise<void> {
    const result = await Task.deleteOne({ _id: taskId, userId });
    if (result.deletedCount === 0) {
      throw new AppError('Task not found', 404);
    }
  }

  async complete(userId: string, taskId: string): Promise<ITask> {
    const task = await this.getById(userId, taskId);

    if (task.status === 'completed') {
      task.status = 'pending';
      task.completedAt = undefined;
      task.history.push({ action: 'updated', fromDate: 'completed', toDate: 'pending', timestamp: new Date() });
    } else {
      task.status = 'completed';
      task.completedAt = new Date();
      task.history.push({ action: 'completed', timestamp: new Date() });
    }

    await task.save();
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
}

export const taskService = new TaskService();
