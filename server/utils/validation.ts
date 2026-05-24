import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const recurrenceSchema = z.object({
  type: z.enum(['none', 'daily', 'weekly', 'monthly', 'weekdays']).default('none'),
  interval: z.number().int().min(1).default(1),
  endDate: z.string().optional(),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
});

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  category: z.string().max(100).optional(),
  taskDate: z.string().optional(),
  dueDate: z.string().optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  estimatedMinutes: z.number().int().positive().optional(),
  recurrence: recurrenceSchema.optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'postponed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  category: z.string().max(100).optional(),
  dueDate: z.string().optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  estimatedMinutes: z.number().int().positive().optional(),
  actualMinutes: z.number().int().positive().optional(),
  recurrence: recurrenceSchema.optional(),
});

export const postponeTaskSchema = z.object({
  newDate: z.string().min(1, 'New date is required'),
});

export const filterTaskSchema = z.object({
  search: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'postponed', 'cancelled']).optional(),
  category: z.string().optional(),
  tags: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  dueDateFrom: z.string().optional(),
  dueDateTo: z.string().optional(),
});
