export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'postponed' | 'cancelled';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface TaskHistoryEntry {
  action: 'created' | 'updated' | 'completed' | 'postponed' | 'cancelled' | 'in_progress';
  fromDate?: string;
  toDate?: string;
  timestamp: string;
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
  history: TaskHistoryEntry[];
  isDeleted: boolean;
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
}

export interface User {
  _id: string;
  name: string;
  email: string;
  timezone: string;
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

export interface AnalyticsData {
  period: string;
  summary: AnalyticsSummary;
  dailyBreakdown?: {
    date: string;
    completed: number;
    total: number;
  }[];
}
