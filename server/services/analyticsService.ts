import { Task } from '../models/Task';
import { getLocalDateString, formatDateString } from '../utils/dateUtils';

interface DailyBreakdown {
  date: string;
  completed: number;
  pending: number;
  postponed: number;
  cancelled: number;
  total: number;
}

interface CategoryBreakdown {
  name: string;
  count: number;
  completed: number;
}

interface PriorityDistribution {
  name: string;
  total: number;
  completed: number;
}

interface EstimationAccuracy {
  total: number;
  matched: number;
  overEstimated: number;
  underEstimated: number;
}

interface AnalyticsSummary {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  cancelledTasks: number;
  postponedTasks: number;
  completionRate: number;
  productivityScore: number;
  streak: number;
}

interface AnalyticsData {
  summary: AnalyticsSummary;
  dailyBreakdown: DailyBreakdown[];
  categoryBreakdown: CategoryBreakdown[];
  priorityDistribution: PriorityDistribution[];
  estimationAccuracy: EstimationAccuracy;
}

export class AnalyticsService {
  private async getStreak(userId: string, timezone?: string): Promise<number> {
    const completedDates = await Task.distinct('currentDate', {
      userId,
      status: 'completed',
      isDeleted: false,
    });

    if (completedDates.length === 0) return 0;

    const sorted = completedDates.sort().reverse();
    let streak = 0;
    const today = getLocalDateString(timezone);

    for (let i = 0; i < sorted.length; i++) {
      const expected = new Date(today);
      expected.setDate(expected.getDate() - i);
      const expectedStr = formatDateString(expected, timezone);

      if (sorted[i] === expectedStr || sorted[i] === expected.toISOString().split('T')[0]) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  private async getDailyBreakdown(userId: string, sinceDate: Date, timezone?: string): Promise<DailyBreakdown[]> {
    const tasks = await Task.find({
      userId,
      currentDate: { $gte: formatDateString(sinceDate, timezone) },
      isDeleted: false,
    });

    const grouped: Record<string, { completed: number; pending: number; postponed: number; cancelled: number; total: number }> = {};

    for (const task of tasks) {
      const date = task.currentDate;
      if (!grouped[date]) {
        grouped[date] = { completed: 0, pending: 0, postponed: 0, cancelled: 0, total: 0 };
      }
      grouped[date].total++;
      if (task.status === 'completed') grouped[date].completed++;
      else if (task.status === 'pending') grouped[date].pending++;
      else if (task.status === 'postponed') grouped[date].postponed++;
      else if (task.status === 'cancelled') grouped[date].cancelled++;
    }

    return Object.entries(grouped)
      .map(([date, counts]) => ({ date, ...counts }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async getWeekly(userId: string, timezone?: string): Promise<AnalyticsData> {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    return this.getSummary(userId, weekAgo, timezone);
  }

  async getMonthly(userId: string, timezone?: string): Promise<AnalyticsData> {
    const now = new Date();
    const monthAgo = new Date(now);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    return this.getSummary(userId, monthAgo, timezone);
  }

  async getQuarterly(userId: string, timezone?: string): Promise<AnalyticsData> {
    const now = new Date();
    const quarterAgo = new Date(now);
    quarterAgo.setMonth(quarterAgo.getMonth() - 3);

    return this.getSummary(userId, quarterAgo, timezone);
  }

  async getHalfYearly(userId: string, timezone?: string): Promise<AnalyticsData> {
    const now = new Date();
    const halfYearAgo = new Date(now);
    halfYearAgo.setMonth(halfYearAgo.getMonth() - 6);

    return this.getSummary(userId, halfYearAgo, timezone);
  }

  async getYearly(userId: string, timezone?: string): Promise<AnalyticsData> {
    const now = new Date();
    const yearAgo = new Date(now);
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);

    return this.getSummary(userId, yearAgo, timezone);
  }

  private getCategoryBreakdown(tasks: any[]): CategoryBreakdown[] {
    const grouped: Record<string, { count: number; completed: number }> = {};
    for (const task of tasks) {
      const cat = task.category || 'Uncategorized';
      if (!grouped[cat]) {
        grouped[cat] = { count: 0, completed: 0 };
      }
      grouped[cat].count++;
      if (task.status === 'completed') grouped[cat].completed++;
    }
    return Object.entries(grouped)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count);
  }

  private getPriorityDistribution(tasks: any[]): PriorityDistribution[] {
    const grouped: Record<string, { total: number; completed: number }> = {};
    for (const task of tasks) {
      const pri = task.priority;
      if (!grouped[pri]) {
        grouped[pri] = { total: 0, completed: 0 };
      }
      grouped[pri].total++;
      if (task.status === 'completed') grouped[pri].completed++;
    }
    return ['high', 'medium', 'low'].map((name) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      total: grouped[name]?.total || 0,
      completed: grouped[name]?.completed || 0,
    }));
  }

  private getEstimationAccuracy(tasks: any[]): EstimationAccuracy {
    const withEstimates = tasks.filter((t: any) => t.estimatedMinutes != null && t.actualMinutes != null);
    const total = withEstimates.length;
    let matched = 0;
    let overEstimated = 0;
    let underEstimated = 0;

    for (const task of withEstimates) {
      const diff = task.actualMinutes - task.estimatedMinutes;
      if (Math.abs(diff) <= task.estimatedMinutes * 0.2) {
        matched++;
      } else if (diff > 0) {
        underEstimated++;
      } else {
        overEstimated++;
      }
    }

    return { total, matched, overEstimated, underEstimated };
  }

  private async getSummary(userId: string, sinceDate: Date, timezone?: string): Promise<AnalyticsData> {
    const sinceDateStr = formatDateString(sinceDate, timezone);
    const tasks = await Task.find({
      userId,
      currentDate: { $gte: sinceDateStr },
      isDeleted: false,
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'completed').length;
    const pendingTasks = tasks.filter((t) => t.status === 'pending').length;
    const cancelledTasks = tasks.filter((t) => t.status === 'cancelled').length;
    const postponedTasks = tasks.filter((t) => t.postponedCount > 0).length;

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const productivityScore = completedTasks * 5 - postponedTasks * 2 - cancelledTasks * 1;
    const streak = await this.getStreak(userId, timezone);
    const dailyBreakdown = await this.getDailyBreakdown(userId, sinceDate, timezone);
    const categoryBreakdown = this.getCategoryBreakdown(tasks);
    const priorityDistribution = this.getPriorityDistribution(tasks);
    const estimationAccuracy = this.getEstimationAccuracy(tasks);

    return {
      summary: {
        totalTasks,
        completedTasks,
        pendingTasks,
        cancelledTasks,
        postponedTasks,
        completionRate,
        productivityScore,
        streak,
      },
      dailyBreakdown,
      categoryBreakdown,
      priorityDistribution,
      estimationAccuracy,
    };
  }
}

export const analyticsService = new AnalyticsService();
