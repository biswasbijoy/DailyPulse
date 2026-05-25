'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/authContext';
import { getTaskHistory, postponeTask, revertPostponeTask, filterTasks } from '@/services/tasks';
import { getLocalDateString } from '@/lib/utils';
import { exportTasksToExcel } from '@/lib/exportToExcel';
import { FilterBar } from '@/components/FilterBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TaskDetails } from '@/components/TaskDetails';
import type { Task } from '@/types';
import type { FilterValues } from '@/components/FilterBar';

function StatusIcon({ status }: { status: string }) {
  if (status === 'completed') {
    return (
      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm shadow-emerald-200 shrink-0">
        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  }
  if (status === 'in_progress') {
    return (
      <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center shadow-sm shadow-amber-200 shrink-0">
        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    );
  }
  if (status === 'postponed') {
    return (
      <div className="w-6 h-6 rounded-full bg-purple-400 flex items-center justify-center shadow-sm shadow-purple-200 shrink-0">
        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </div>
    );
  }
  return (
    <div className="w-6 h-6 rounded-full border-2 border-[#FF7F00] flex items-center justify-center shrink-0">
      <svg viewBox="0 0 24 24" className="w-4 h-4">
        <circle cx="7" cy="12" r="1.5" fill="#FF7F00" />
        <circle cx="12" cy="12" r="1.5" fill="#FF7F00" />
        <circle cx="17" cy="12" r="1.5" fill="#FF7F00" />
      </svg>
    </div>
  );
}

const priorityConfig = {
  high: { badge: 'bg-red-50 text-red-600' },
  medium: { badge: 'bg-amber-50 text-amber-600' },
  low: { badge: 'bg-emerald-50 text-emerald-600' },
};

export default function HistoryPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();
  const [postponeDate, setPostponeDate] = useState<Record<string, string>>({});
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({
    search: '', priority: '', status: '', category: '', dateFrom: '', dateTo: '',
  });

  const hasActiveFilters = filters.search || filters.priority || filters.status || filters.category || filters.dateFrom || filters.dateTo;
  const todayStr = getLocalDateString();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', 'history'],
    queryFn: getTaskHistory,
    enabled: !!user && !hasActiveFilters,
  });

  const { data: filteredTasks = [], isLoading: filterLoading } = useQuery({
    queryKey: ['tasks', 'filter', filters],
    queryFn: () => filterTasks({
      search: filters.search || undefined,
      priority: filters.priority || undefined,
      status: filters.status || undefined,
      category: filters.category || undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
    }),
    enabled: !!user && !!hasActiveFilters,
  });

  const handleFilter = useCallback((newFilters: FilterValues) => {
    setFilters(newFilters);
  }, []);

  const displayTasks = hasActiveFilters ? filteredTasks : tasks;
  const loading = hasActiveFilters ? filterLoading : isLoading;

  const postponeMutation = useMutation({
    mutationFn: ({ id, date }: { id: string; date: string }) => postponeTask(id, date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'history'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const revertMutation = useMutation({
    mutationFn: (id: string) => revertPostponeTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'history'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  if (authLoading) return null;

  if (!user) {
    router.push('/login');
    return null;
  }

  const grouped = displayTasks.reduce<Record<string, Task[]>>((acc, task) => {
    const date = task.currentDate;
    if (!acc[date]) acc[date] = [];
    acc[date].push(task);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportTasksToExcel(displayTasks);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  const formatGroupDate = (date: string) => {
    return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6 animate-in stagger-1">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Task History</h1>
          <p className="text-muted-foreground mt-1">All tasks grouped by date</p>
        </div>
        <Button
          variant="gradient"
          onClick={handleExport}
          disabled={exporting || displayTasks.length === 0}
        >
          {exporting ? 'Exporting...' : 'Export to Excel'}
        </Button>
      </div>

      <FilterBar onFilter={handleFilter} showDateFilter />

      {loading ? (
        <div className="text-muted-foreground text-sm">Loading history...</div>
      ) : displayTasks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mb-3 flex justify-center">
              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <p className="text-muted-foreground text-sm">No tasks found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {sortedDates.map((date) => {
            const isPast = date < todayStr;
            const dateTasks = grouped[date];
            const completedCount = dateTasks.filter((t) => t.status === 'completed').length;

            return (
              <div key={date} className="animate-in stagger-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                  <div className="flex items-center gap-3 shrink-0">
                    <h2 className="text-base font-semibold text-gray-800">{formatGroupDate(date)}</h2>
                    <span className="text-xs text-muted-foreground bg-secondary px-2.5 py-0.5 rounded-full">
                      {completedCount}/{dateTasks.length} done
                    </span>
                    {date === todayStr && (
                      <span className="text-xs font-medium bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-0.5 rounded-full shadow-sm">
                        Today
                      </span>
                    )}
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                </div>

                <div className="space-y-2.5">
                  {dateTasks.map((task) => {
                    const config = priorityConfig[task.priority] || priorityConfig.low;
                    const isCompleted = task.status === 'completed';
                    return (
                      <Card
                        key={task._id}
                        className={`transition-all duration-200 hover:shadow-md ${isCompleted ? 'bg-emerald-50/40 border-emerald-200' : ''}`}
                      >
                        <CardContent className="flex items-center gap-3 py-3">
                          <StatusIcon status={task.status} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${isCompleted ? 'text-emerald-700' : 'text-gray-800'}`}>
                              {task.title}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {task.category && (
                                <span className="text-[11px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                                  {task.category}
                                </span>
                              )}
                              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full capitalize ${config.badge}`}>
                                {task.priority}
                              </span>
                              {isCompleted && (
                                <span className="text-[11px] text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full font-medium">
                                  Completed
                                </span>
                              )}
                              {!isCompleted && (
                                <span className="text-[11px] text-muted-foreground capitalize">
                                  {task.status === 'postponed' ? 'rescheduled' : task.status.replace('_', ' ')}
                                </span>
                              )}
                              {task.status === 'postponed' && (
                                <span className="text-[11px] text-purple-500">
                                  &middot; Rescheduled to {task.currentDate}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedTask(task)}
                            >
                              Details
                            </Button>
                            {task.status === 'postponed' && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={revertMutation.isPending}
                                onClick={() => revertMutation.mutate(task._id)}
                              >
                                Revert
                              </Button>
                            )}
                            {isPast && task.status !== 'completed' && task.status !== 'postponed' && (
                              <>
                                <input
                                  type="date"
                                  min={todayStr}
                                  value={postponeDate[task._id] || ''}
                                  onChange={(e) =>
                                    setPostponeDate((prev) => ({ ...prev, [task._id]: e.target.value }))
                                  }
                                  className="h-8 w-[120px] rounded-lg border border-gray-200 bg-white px-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={!postponeDate[task._id] || postponeMutation.isPending}
                                  onClick={() =>
                                    postponeMutation.mutate({ id: task._id, date: postponeDate[task._id] })
                                  }
                                >
                                  Reschedule
                                </Button>
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TaskDetails task={selectedTask} onClose={() => setSelectedTask(null)} />
    </div>
  );
}
