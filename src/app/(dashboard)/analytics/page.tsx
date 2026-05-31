'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/authContext';
import { BarChart3, CheckCircle2, TrendingUp, Flame, Clock, RotateCcw, Trophy } from 'lucide-react';
import { getWeeklyAnalytics, getMonthlyAnalytics, getYearlyAnalytics } from '@/services/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AnalyticsCharts = dynamic(() => import('@/components/AnalyticsCharts').then((mod) => ({ default: mod.AnalyticsCharts })), {
  ssr: false,
  loading: () => <div className="text-muted-foreground text-sm py-8 text-center">Loading charts...</div>,
});

const periods = ['weekly', 'monthly', 'yearly'] as const;
type Period = typeof periods[number];

const fetchers: Record<Period, () => Promise<any>> = {
  weekly: getWeeklyAnalytics,
  monthly: getMonthlyAnalytics,
  yearly: getYearlyAnalytics,
};

function StatCard({ label, value, gradient, icon: Icon, subtitle }: { label: string; value: string | number; gradient: string; icon: React.ComponentType<{ className?: string }>; subtitle?: string }) {
  return (
    <div className={`rounded-2xl p-5 text-white ${gradient} shadow-lg shadow-black/10 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 animate-in`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm font-medium text-white/80">{label}</span>
        <Icon className="w-5 h-5 opacity-80" />
      </div>
      <p className="text-3xl font-bold">{value}</p>
      {subtitle && <p className="text-xs text-white/70 mt-1">{subtitle}</p>}
    </div>
  );
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [period, setPeriod] = useState<Period>('weekly');

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', period],
    queryFn: fetchers[period],
    enabled: !!user,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) return null;

  const summary = data?.summary;
  const dailyBreakdown = data?.dailyBreakdown || [];

  return (
    <div className="space-y-6 animate-in stagger-1">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1">Track your productivity</p>
        </div>
        <div className="flex gap-1 bg-secondary p-1 rounded-xl">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                period === p
                  ? 'bg-white text-blue-600 shadow-sm dark:bg-card dark:text-blue-400'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground text-sm">Loading analytics...</div>
      ) : summary ? (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Tasks"
              value={summary.totalTasks}
              icon={BarChart3}
              gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
            />
            <StatCard
              label="Completed"
              value={summary.completedTasks}
              icon={CheckCircle2}
              gradient="bg-gradient-to-br from-emerald-400 to-teal-500"
              subtitle={`${summary.completionRate}% rate`}
            />
            <StatCard
              label="Completion Rate"
              value={`${summary.completionRate}%`}
              icon={TrendingUp}
              gradient="bg-gradient-to-br from-amber-400 to-orange-500"
            />
            <StatCard
              label="Current Streak"
              value={`${summary.streak} days`}
              icon={Flame}
              gradient="bg-gradient-to-br from-rose-400 to-pink-500"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Pending</p>
                    <p className="text-2xl font-bold text-foreground">{summary.pendingTasks}</p>
                  </div>
                </div>
                <div className="w-full bg-secondary rounded-full h-1.5">
                  <div className="bg-gray-400 h-1.5 rounded-full" style={{ width: `${summary.totalTasks ? Math.round((summary.pendingTasks / summary.totalTasks) * 100) : 0}%` }} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-yellow-50 dark:bg-yellow-900/30 flex items-center justify-center">
                      <RotateCcw className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Rescheduled</p>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{summary.postponedTasks}</p>
                  </div>
                </div>
                <div className="w-full bg-yellow-100 dark:bg-yellow-900/30 rounded-full h-1.5">
                  <div className="bg-yellow-400 dark:bg-yellow-500 h-1.5 rounded-full" style={{ width: `${summary.totalTasks ? Math.round((summary.postponedTasks / summary.totalTasks) * 100) : 0}%` }} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Productivity Score</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{summary.productivityScore}</p>
                  </div>
                </div>
                <div className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-full h-1.5">
                  <div className="bg-blue-500 dark:bg-blue-400 h-1.5 rounded-full" style={{ width: `${Math.min(summary.productivityScore, 100)}%` }} />
                </div>
              </CardContent>
            </Card>
          </div>

          <AnalyticsCharts
            dailyBreakdown={dailyBreakdown}
            categoryBreakdown={data?.categoryBreakdown}
            priorityDistribution={data?.priorityDistribution}
            estimationAccuracy={data?.estimationAccuracy}
          />
        </>
      ) : null}
    </div>
  );
}
