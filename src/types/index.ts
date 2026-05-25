export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'postponed' | 'cancelled';

export type TaskPriority = 'low' | 'medium' | 'high';

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'weekdays';

export interface TaskHistoryEntry {
  action: 'created' | 'updated' | 'completed' | 'postponed' | 'cancelled' | 'in_progress';
  fromDate?: string;
  toDate?: string;
  timestamp: string;
}

export interface Recurrence {
  type: RecurrenceType;
  interval: number;
  endDate?: string;
  daysOfWeek?: number[];
}

export interface Project {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  color?: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskTemplate {
  _id: string;
  userId: string;
  name: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  category?: string;
  dueDateOffset?: number;
  tags: string[];
  estimatedMinutes?: number;
  recurrenceType: RecurrenceType;
  recurrenceInterval: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
}

export interface Task {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  category?: string;
  taskDate: string;
  currentDate: string;
  dueDate?: string;
  completedAt?: string;
  postponedCount: number;
  tags: string[];
  estimatedMinutes?: number;
  actualMinutes?: number;
  timerStartedAt?: string;
  reminderAt?: string;
  projectId?: string;
  templateFromId?: string;
  history: TaskHistoryEntry[];
  isDeleted: boolean;
  deletedAt?: string;
  recurrence: Recurrence;
  parentRecurrenceId?: string;
  isRecurrenceInstance: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  category?: string;
  dueDate?: string;
  tags?: string[];
  estimatedMinutes?: number;
  recurrence?: Recurrence;
  projectId?: string;
  reminderAt?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: string;
  dueDate?: string;
  tags?: string[];
  estimatedMinutes?: number;
  actualMinutes?: number;
  recurrence?: Recurrence;
  projectId?: string;
  reminderAt?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  timezone: string;
  settings: UserSettings;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface AnalyticsSummary {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  cancelledTasks: number;
  postponedTasks: number;
  completionRate: number;
  productivityScore: number;
  streak: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface CategoryBreakdown {
  name: string;
  count: number;
  completed: number;
}

export interface PriorityDistribution {
  name: string;
  total: number;
  completed: number;
}

export interface EstimationAccuracy {
  total: number;
  matched: number;
  overEstimated: number;
  underEstimated: number;
}

export interface AnalyticsData {
  period: string;
  summary: AnalyticsSummary;
  dailyBreakdown: {
    date: string;
    completed: number;
    pending: number;
    postponed: number;
    cancelled: number;
    total: number;
  }[];
  categoryBreakdown: CategoryBreakdown[];
  priorityDistribution: PriorityDistribution[];
  estimationAccuracy: EstimationAccuracy;
}
