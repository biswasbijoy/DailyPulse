'use client';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, PieChart, Pie, Cell,
} from 'recharts';
import { BarChart3, PieChart as PieChartIcon, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ChartsProps {
  dailyBreakdown: any[];
  categoryBreakdown: any[];
  priorityDistribution: any[];
  estimationAccuracy: any;
}

export function AnalyticsCharts({ dailyBreakdown, categoryBreakdown, priorityDistribution, estimationAccuracy }: ChartsProps) {
  return (
    <>
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

      {categoryBreakdown?.length > 0 && (
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
                      data={categoryBreakdown}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryBreakdown.map((_: any, idx: number) => (
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
                  <BarChart data={priorityDistribution} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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

      {estimationAccuracy?.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-500" />
              Estimation Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-xl bg-muted/50">
                <p className="text-2xl font-bold text-foreground">{estimationAccuracy.total}</p>
                <p className="text-xs text-muted-foreground mt-1">Tracked Tasks</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-300">{estimationAccuracy.matched}</p>
                <p className="text-xs text-emerald-500 dark:text-emerald-400 mt-1">On Target</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-amber-50 dark:bg-amber-950/50">
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-300">{estimationAccuracy.overEstimated}</p>
                <p className="text-xs text-amber-500 dark:text-amber-400 mt-1">Overestimated</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-red-50 dark:bg-red-950/50">
                <p className="text-2xl font-bold text-red-600 dark:text-red-300">{estimationAccuracy.underEstimated}</p>
                <p className="text-xs text-red-500 dark:text-red-400 mt-1">Underestimated</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
