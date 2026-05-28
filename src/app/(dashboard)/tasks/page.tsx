'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/authContext';
import { getTodayTasks, getPostponedTasks, getPendingTasks } from '@/services/tasks';
import { TaskForm } from '@/components/TaskForm';
import { TaskList } from '@/components/TaskList';
import { TaskDetails } from '@/components/TaskDetails';
import { FilterBar } from '@/components/FilterBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Task } from '@/types';
import type { FilterValues } from '@/components/FilterBar';

function filterTasksLocal(tasks: Task[], filters: FilterValues): Task[] {
  return tasks.filter((task) => {
    if (filters.search) {
      const term = filters.search.toLowerCase();
      const matchesSearch =
        task.title.toLowerCase().includes(term) ||
        (task.description && task.description.toLowerCase().includes(term)) ||
        (task.tags && task.tags.some((tag) => tag.toLowerCase().includes(term)));
      if (!matchesSearch) return false;
    }
    if (filters.priority && task.priority !== filters.priority) return false;
    if (filters.status && task.status !== filters.status) return false;
    if (filters.category && !task.category?.toLowerCase().includes(filters.category.toLowerCase())) return false;
    return true;
  });
}

export default function TasksPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState<Task | undefined>(undefined);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<FilterValues>({
    search: '', priority: '', status: '', category: '', dateFrom: '', dateTo: '',
  });

  const hasActiveFilters = filters.search || filters.priority || filters.status || filters.category || filters.dateFrom || filters.dateTo;

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', 'today'],
    queryFn: getTodayTasks,
    enabled: !!user,
  });

  const { data: postponedTasks = [], isLoading: postponedLoading } = useQuery({
    queryKey: ['tasks', 'postponed'],
    queryFn: getPostponedTasks,
    enabled: !!user,
  });

  const { data: pendingTasks = [], isLoading: pendingLoading } = useQuery({
    queryKey: ['tasks', 'pending'],
    queryFn: getPendingTasks,
    enabled: !!user,
  });

  const todayStr = new Date().toISOString().slice(0, 10);
  const pastPendingTasks = useMemo(() => {
    return pendingTasks.filter((t) => t.currentDate < todayStr);
  }, [pendingTasks, todayStr]);

  const displayTasks = useMemo(() => {
    if (!hasActiveFilters) return tasks;
    return filterTasksLocal([...tasks, ...postponedTasks], filters);
  }, [tasks, postponedTasks, filters, hasActiveFilters]);

  const handleFilter = useCallback((newFilters: Partial<FilterValues>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) return null;

  const handleEdit = (task: Task) => {
    setEditTask(task);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditTask(undefined);
  };

  const handleViewDetails = (task: Task) => setSelectedTask(task);

  return (
    <>
    <div className="space-y-6 animate-in stagger-1">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Daily Tasks</h1>
          <p className="text-muted-foreground mt-1">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <Button
          variant="gradient"
          onClick={() => { setEditTask(undefined); setShowForm(!showForm); }}
        >
          {showForm ? 'Cancel' : '+ Add Task'}
        </Button>
      </div>

      {showForm && (
        <Card className="border-blue-100 shadow-md shadow-blue-100/50 dark:border-blue-900/50 dark:shadow-blue-950/50 animate-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">+</span>
              {editTask ? 'Edit Task' : 'New Task'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TaskForm onClose={handleClose} editTask={editTask} />
          </CardContent>
        </Card>
      )}

      <FilterBar onFilter={handleFilter} />

      {isLoading ? (
        <div className="text-muted-foreground text-sm">Loading tasks...</div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[10px]">T</span>
                {hasActiveFilters ? 'Filtered Tasks' : "Today's Tasks"}
                <span className="ml-auto text-sm font-normal text-muted-foreground">{displayTasks.length} task{displayTasks.length !== 1 ? 's' : ''}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TaskList tasks={displayTasks} onEdit={handleEdit} onViewDetails={handleViewDetails} showCheckbox />
            </CardContent>
          </Card>

          {!hasActiveFilters && (pendingLoading ? (
            <div className="text-muted-foreground text-sm">Loading...</div>
          ) : pastPendingTasks.length > 0 ? (
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-muted-foreground">
                  <span className="w-5 h-5 rounded-md bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-[10px]">⏳</span>
                  Pending Tasks
                  <span className="ml-auto text-sm font-normal text-muted-foreground">{pastPendingTasks.length} task{pastPendingTasks.length !== 1 ? 's' : ''}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TaskList tasks={pastPendingTasks} onEdit={handleEdit} onViewDetails={handleViewDetails} showCheckbox />
              </CardContent>
            </Card>
          ) : null)}

          {!hasActiveFilters && (postponedLoading ? (
            <div className="text-muted-foreground text-sm">Loading...</div>
          ) : postponedTasks.length > 0 ? (
            <Card className="border-yellow-100 dark:border-yellow-900/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                  <span className="w-5 h-5 rounded-md bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-[10px]">↻</span>
                  Rescheduled Tasks
                  <span className="ml-auto text-sm font-normal text-yellow-500 dark:text-yellow-400">{postponedTasks.length} task{postponedTasks.length !== 1 ? 's' : ''}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TaskList tasks={postponedTasks} onEdit={handleEdit} onViewDetails={handleViewDetails} showRevert />
              </CardContent>
            </Card>
          ) : null)}
        </>
      )}
      </div>
      <TaskDetails task={selectedTask} onClose={() => setSelectedTask(null)} />
    </>
  );
}
