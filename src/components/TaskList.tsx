'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { completeTask, postponeTask, revertPostponeTask, deleteTask, startTimer, stopTimer } from '@/services/tasks';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import type { Task } from '@/types';

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  showRevert?: boolean;
  showCheckbox?: boolean;
}

const priorityConfig = {
  high: { badge: 'bg-red-50 text-red-600', label: 'High' },
  medium: { badge: 'bg-amber-50 text-amber-600', label: 'Medium' },
  low: { badge: 'bg-emerald-50 text-emerald-600', label: 'Low' },
};

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

export function TaskList({ tasks, onEdit, showRevert, showCheckbox }: TaskListProps) {
  const queryClient = useQueryClient();
  const [postponeDate, setPostponeDate] = useState<Record<string, string>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

  const completeMutation = useMutation({
    mutationFn: (id: string) => completeTask(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const timerStartMutation = useMutation({
    mutationFn: (id: string) => startTimer(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const timerStopMutation = useMutation({
    mutationFn: (id: string) => stopTimer(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const postponeMutation = useMutation({
    mutationFn: ({ id, date }: { id: string; date: string }) => postponeTask(id, date),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const revertMutation = useMutation({
    mutationFn: (id: string) => revertPostponeTask(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  if (tasks.length === 0) {
    return (
      <div className="text-center py-10">
        <svg className="w-10 h-10 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
        <p className="text-gray-400 text-sm">No tasks found. Add one above!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const config = priorityConfig[task.priority] || priorityConfig.low;
        const isCompleted = task.status === 'completed';
        return (
          <Card
            key={task._id}
            className={`transition-all duration-200 hover:shadow-md ${isCompleted ? 'bg-emerald-50/40 border-emerald-200' : ''}`}
          >
            <CardContent className="flex items-center gap-3 py-3.5">
              {showCheckbox ? (
                <label className="relative flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={isCompleted}
                    onChange={() => completeMutation.mutate(task._id)}
                    className="peer sr-only"
                  />
                  {isCompleted ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm shadow-emerald-200 transition-all duration-200 peer-active:scale-90">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center transition-all duration-200 hover:border-emerald-400 peer-active:scale-90">
                      {task.status === 'in_progress' ? (
                        <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" className="w-4 h-4">
                          <circle cx="7" cy="12" r="1.5" fill="#FF7F00" />
                          <circle cx="12" cy="12" r="1.5" fill="#FF7F00" />
                          <circle cx="17" cy="12" r="1.5" fill="#FF7F00" />
                        </svg>
                      )}
                    </div>
                  )}
                </label>
              ) : (
                <StatusIcon status={task.status} />
              )}

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isCompleted ? 'text-emerald-700' : 'text-gray-800'}`}>
                  {task.title}
                </p>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${config.badge}`}>
                    {config.label}
                  </span>
                  {task.category && (
                    <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {task.category}
                    </span>
                  )}
                  {isCompleted && (
                    <span className="text-[11px] text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full font-medium">
                      Completed
                    </span>
                  )}
                  {task.status === 'in_progress' && (
                    <span className="text-[11px] text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full font-medium">
                      In Progress
                    </span>
                  )}
                  {task.status === 'pending' && (
                    <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      Pending
                    </span>
                  )}
                  {task.status === 'postponed' && (
                    <span className="text-[11px] text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full">
                      Rescheduled to {task.currentDate}
                    </span>
                  )}
                  {task.postponedCount > 0 && task.status !== 'postponed' && (
                    <span className="text-[11px] text-gray-400">
                      Rescheduled {task.postponedCount}x
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {task.status === 'postponed' && showRevert && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={revertMutation.isPending}
                    onClick={() => revertMutation.mutate(task._id)}
                  >
                    Revert
                  </Button>
                )}
                {!isCompleted && task.status !== 'postponed' && (
                  <>
                    <input
                      type="date"
                      min={minDate}
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
                {!isCompleted && task.status !== 'postponed' && (
                  <Button
                    size="sm"
                    variant={task.timerStartedAt ? 'default' : 'outline'}
                    disabled={timerStartMutation.isPending || timerStopMutation.isPending}
                    onClick={() =>
                      task.timerStartedAt
                        ? timerStopMutation.mutate(task._id)
                        : timerStartMutation.mutate(task._id)
                    }
                  >
                    {task.timerStartedAt ? 'Stop' : 'Timer'}
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => onEdit(task)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setDeleteConfirm({ id: task._id, title: task.title })}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete Task"
        message={`Are you sure you want to permanently delete "${deleteConfirm?.title}"?`}
        onConfirm={() => {
          if (deleteConfirm) {
            deleteMutation.mutate(deleteConfirm.id);
            setDeleteConfirm(null);
          }
        }}
        onCancel={() => setDeleteConfirm(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
