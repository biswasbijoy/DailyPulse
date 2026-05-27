'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/store/authContext';
import { getTasksByRange } from '@/services/tasks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Task } from '@/types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: { day: number; isCurrentMonth: boolean; date: string }[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const date = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, isCurrentMonth: false, date });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, isCurrentMonth: true, date });
  }

  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    const nextMonth = month + 1 > 11 ? 0 : month + 1;
    const nextYear = month + 1 > 11 ? year + 1 : year;
    const date = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, isCurrentMonth: false, date });
  }

  return cells;
}

function tasksForDate(tasks: Task[], date: string): Task[] {
  return tasks.filter((t) => t.currentDate === date);
}

const priorityDot = {
  high: 'bg-red-400',
  medium: 'bg-amber-400',
  low: 'bg-emerald-400',
};

export default function CalendarPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthStart = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const monthEnd = `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`;

  const days = useMemo(() => getMonthDays(year, month), [year, month]);

  const { data: monthTasks = [], isLoading } = useQuery({
    queryKey: ['tasks', 'range', monthStart, monthEnd],
    queryFn: () => getTasksByRange(monthStart, monthEnd),
    enabled: !!user,
  });

  const { data: dayTasks = [], isLoading: dayLoading } = useQuery({
    queryKey: ['tasks', 'date', selectedDate],
    queryFn: () => getTasksByRange(selectedDate!, selectedDate!),
    enabled: !!selectedDate,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) return null;

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <div className="space-y-6 animate-in stagger-1">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Calendar</h1>
        <p className="text-muted-foreground mt-1">View and manage tasks by date</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-5">
              <Button variant="ghost" size="sm" onClick={prevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-lg font-semibold text-foreground">
                {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <Button variant="ghost" size="sm" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-px bg-secondary rounded-lg overflow-hidden">
              {DAYS.map((d) => (
                <div key={d} className="bg-muted/50 px-2 py-2 text-center text-xs font-semibold text-muted-foreground">
                  {d}
                </div>
              ))}
              {days.map((cell) => {
                const tasks = tasksForDate(monthTasks, cell.date);
                const isToday = cell.date === todayStr;
                const isSelected = cell.date === selectedDate;
                return (
                  <button
                    key={cell.date}
                    onClick={() => setSelectedDate(cell.date)}
                    className={`bg-card px-2 py-2 min-h-[80px] text-left transition-colors hover:bg-accent/50 ${
                      !cell.isCurrentMonth ? 'opacity-40' : ''
                    } ${isSelected ? 'ring-2 ring-blue-500 ring-inset bg-accent' : ''}`}
                  >
                    <span className={`text-xs font-medium mb-1 block ${
                      isToday ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-foreground'
                    }`}>
                      {cell.day}
                    </span>
                    <div className="space-y-0.5">
                      {tasks.slice(0, 3).map((task) => (
                        <div
                          key={task._id}
                          className={`text-[10px] truncate rounded px-1 py-0.5 ${
                            task.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-700 line-through dark:bg-emerald-900/50 dark:text-emerald-300'
                              : task.status === 'postponed'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                              : 'bg-secondary text-foreground'
                          }`}
                        >
                          {task.title}
                        </div>
                      ))}
                      {tasks.length > 3 && (
                        <div className="text-[10px] text-muted-foreground px-1">
                          +{tasks.length - 3} more
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {selectedDate ? (
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">
                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </h3>
                  {selectedDate === todayStr && (
                    <span className="text-xs font-medium bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300 px-2 py-0.5 rounded-full">
                      Today
                    </span>
                  )}
                </div>

                {dayLoading ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : dayTasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tasks for this date.</p>
                ) : (
                  <div className="space-y-2">
                    {dayTasks.map((task) => (
                      <div
                        key={task._id}
                        className={`p-3 rounded-xl border text-sm ${
                          task.status === 'completed'
                            ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800'
                            : task.status === 'postponed'
                            ? 'bg-purple-50 border-purple-200 dark:bg-purple-950/50 dark:border-purple-800'
                            : 'bg-muted/50 border-gray-100 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${priorityDot[task.priority] || 'bg-gray-300'}`} />
                          <p className={`font-medium truncate flex-1 ${task.status === 'completed' ? 'line-through text-emerald-700 dark:text-emerald-300' : 'text-foreground'}`}>
                            {task.title}
                          </p>
                          <span className="text-[10px] text-muted-foreground capitalize">
                            {task.status === 'postponed' ? 'rescheduled' : task.status.replace('_', ' ')}
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-xs text-muted-foreground mt-1 ml-4">{task.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-5 text-center text-sm text-muted-foreground">
                Select a date to view tasks
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
