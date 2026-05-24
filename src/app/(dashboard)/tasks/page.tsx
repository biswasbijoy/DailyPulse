'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/authContext';
import { getTodayTasks, getPostponedTasks, filterTasks } from '@/services/tasks';
import { TaskForm } from '@/components/TaskForm';
import { TaskList } from '@/components/TaskList';
import { FilterBar } from '@/components/FilterBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Task } from '@/types';
import type { FilterValues } from '@/components/FilterBar';

export default function TasksPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState<Task | undefined>(undefined);
  const [filters, setFilters] = useState<FilterValues>({
    search: '', priority: '', status: '', category: '', dateFrom: '', dateTo: '',
  });

  const hasActiveFilters = filters.search || filters.priority || filters.status || filters.category || filters.dateFrom || filters.dateTo;

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', 'today'],
    queryFn: getTodayTasks,
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

  const { data: postponedTasks = [], isLoading: postponedLoading } = useQuery({
    queryKey: ['tasks', 'postponed'],
    queryFn: getPostponedTasks,
    enabled: !!user,
  });

  const handleFilter = useCallback((newFilters: FilterValues) => {
    setFilters(newFilters);
  }, []);

  if (authLoading) return null;

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleEdit = (task: Task) => {
    setEditTask(task);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditTask(undefined);
  };

  const displayTasks = hasActiveFilters ? filteredTasks : tasks;
  const loading = hasActiveFilters ? filterLoading : isLoading;

  return (
    <div className="space-y-6 animate-in stagger-1">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Daily Tasks</h1>
          <p className="text-gray-500 mt-1">
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
        <Card className="border-blue-100 shadow-md shadow-blue-100/50 animate-in">
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

      {loading ? (
        <div className="text-gray-400 text-sm">Loading tasks...</div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[10px]">T</span>
                {hasActiveFilters ? 'Filtered Tasks' : "Today's Tasks"}
                <span className="ml-auto text-sm font-normal text-gray-400">{displayTasks.length} task{displayTasks.length !== 1 ? 's' : ''}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TaskList tasks={displayTasks} onEdit={handleEdit} showCheckbox />
            </CardContent>
          </Card>

          {!hasActiveFilters && (postponedLoading ? (
            <div className="text-gray-400 text-sm">Loading...</div>
          ) : postponedTasks.length > 0 ? (
            <Card className="border-yellow-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-700">
                  <span className="w-5 h-5 rounded-md bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-[10px]">↻</span>
                  Rescheduled Tasks
                  <span className="ml-auto text-sm font-normal text-yellow-500">{postponedTasks.length} task{postponedTasks.length !== 1 ? 's' : ''}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TaskList tasks={postponedTasks} onEdit={handleEdit} showRevert />
              </CardContent>
            </Card>
          ) : null)}
        </>
      )}
    </div>
  );
}
