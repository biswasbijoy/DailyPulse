'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/authContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, CheckCircle2, TrendingUp, Flame, Clock, RotateCcw, Trophy, PieChart as PieChartIcon } from 'lucide-react';
import { getWeeklyAnalytics, getMonthlyAnalytics, getYearlyAnalytics } from '@/services/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

  if (authLoading) return null;

  if (!user) {
    router.push('/login');
    return null;
  }

  const summary = data?.summary;
  const dailyBreakdown = data?.dailyBreakdown || [];

  return (
    <div className="space-y-6 animate-in stagger-1">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Analytics</h1>
          <p className="text-muted-foreground mt-1">Track your productivity</p>
        </div>
        <div className="flex gap-1 bg-secondary p-1 rounded-xl">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                period === p
                  ? 'bg-white text-blue-600 shadow-sm'
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
                    <p className="text-2xl font-bold text-gray-900">{summary.pendingTasks}</p>
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
                  <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center">
                    <RotateCcw className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Rescheduled</p>
                    <p className="text-2xl font-bold text-yellow-600">{summary.postponedTasks}</p>
                  </div>
                </div>
                <div className="w-full bg-yellow-100 rounded-full h-1.5">
                  <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: `${summary.totalTasks ? Math.round((summary.postponedTasks / summary.totalTasks) * 100) : 0}%` }} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Productivity Score</p>
                    <p className="text-2xl font-bold text-blue-600">{summary.productivityScore}</p>
                  </div>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-1.5">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.min(summary.productivityScore, 100)}%` }} />
                </div>
              </CardContent>
            </Card>
          </div>

          {dailyBreakdown.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  Daily Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyBreakdown} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '12px',
                          border: '1px solid #e5e7eb',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="pending" name="Pending" fill="#6b7280" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="postponed" name="Rescheduled" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {data?.categoryBreakdown && data.categoryBreakdown.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5 text-indigo-500" />
                    Category Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.categoryBreakdown}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {data.categoryBreakdown.map((_: any, idx: number) => (
                            <Cell key={idx} fill={['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][idx % 6]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-amber-500" />
                    Priority Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.priorityDistribution} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                        <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }} />
                        <Legend />
                        <Bar dataKey="total" name="Total" fill="#6b7280" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {data?.estimationAccuracy && data.estimationAccuracy.total > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-cyan-500" />
                  Estimation Accuracy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-xl bg-muted/50">
                    <p className="text-2xl font-bold text-gray-900">{data.estimationAccuracy.total}</p>
                    <p className="text-xs text-muted-foreground mt-1">Tracked Tasks</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-emerald-50">
                    <p className="text-2xl font-bold text-emerald-600">{data.estimationAccuracy.matched}</p>
                    <p className="text-xs text-emerald-500 mt-1">On Target</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-amber-50">
                    <p className="text-2xl font-bold text-amber-600">{data.estimationAccuracy.overEstimated}</p>
                    <p className="text-xs text-amber-500 mt-1">Overestimated</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-red-50">
                    <p className="text-2xl font-bold text-red-600">{data.estimationAccuracy.underEstimated}</p>
                    <p className="text-xs text-red-500 mt-1">Underestimated</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : null}
    </div>
  );
}
