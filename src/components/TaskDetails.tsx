'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Task } from '@/types';

interface TaskDetailsProps {
  task: Task | null;
  onClose: () => void;
}

const statusColors: Record<string, string> = {
  completed: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-300',
  in_progress: 'bg-amber-50 text-amber-600 dark:bg-amber-900/50 dark:text-amber-300',
  pending: 'bg-secondary text-muted-foreground',
  postponed: 'bg-purple-50 text-purple-600 dark:bg-purple-900/50 dark:text-purple-300',
};

const priorityColors: Record<string, string> = {
  high: 'bg-red-50 text-red-600 dark:bg-red-900/50 dark:text-red-300',
  medium: 'bg-amber-50 text-amber-600 dark:bg-amber-900/50 dark:text-amber-300',
  low: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-300',
};

export function TaskDetails({ task, onClose }: TaskDetailsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!task) return null;

  const formatDate = (d: string | Date | undefined) => {
    if (!d) return '—';
    return new Date(d).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto p-4 sm:p-6">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-[101] mx-auto my-4 w-full max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl bg-card border border-border shadow-2xl shadow-black/10 p-6 sm:my-8 sm:max-h-[calc(100dvh-4rem)]">
        <div className="flex items-start justify-between mb-5">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-foreground truncate">{task.title}</h3>
            <div className="flex gap-2 mt-2">
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full capitalize ${statusColors[task.status] || ''}`}>
                {task.status === 'postponed' ? 'rescheduled' : task.status.replace('_', ' ')}
              </span>
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full capitalize ${priorityColors[task.priority] || ''}`}>
                {task.priority}
              </span>
              {task.category && (
                <span className="text-xs text-muted-foreground bg-secondary px-2.5 py-0.5 rounded-full">
                  {task.category}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-secondary hover:bg-accent flex items-center justify-center text-muted-foreground transition-colors shrink-0"
          >
            ✕
          </button>
        </div>

        {task.description && (
          <p className="text-sm text-muted-foreground mb-5 bg-muted rounded-xl p-3">{task.description}</p>
        )}

        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm mb-5">
          <DetailItem label="Original Date" value={task.taskDate} />
          <DetailItem label="Current Date" value={task.currentDate} />
          <DetailItem label="Due Date" value={task.dueDate || '—'} />
          <DetailItem label="Rescheduled" value={`${task.postponedCount}x`} />
          <DetailItem label="Est. Minutes" value={task.estimatedMinutes?.toString() ?? '—'} />
          <DetailItem label="Actual Minutes" value={task.actualMinutes?.toString() ?? '—'} />
          <DetailItem label="Created" value={formatDate(task.createdAt)} />
          <DetailItem label="Updated" value={formatDate(task.updatedAt)} />
          {task.completedAt && (
            <DetailItem label="Completed At" value={formatDate(task.completedAt)} />
          )}
        </div>

        {task.tags && task.tags.length > 0 && (
          <div className="mb-5">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {task.tags.map((tag, i) => (
                <span key={i} className="text-xs bg-secondary text-muted-foreground px-2.5 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {task.history && task.history.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Activity History
            </h4>
            <div className="space-y-2">
              {task.history.map((entry, i) => (
                <div key={i} className="flex items-start gap-3 text-xs">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-blue-400 mt-1" />
                    {i < task.history.length - 1 && <div className="w-px h-full bg-blue-100 dark:bg-blue-900" />}
                  </div>
                  <div className="flex-1 pb-2">
                    <span className="font-medium text-foreground capitalize">
                      {entry.action === 'postponed' ? 'rescheduled' : entry.action.replace('_', ' ')}
                    </span>
                    {entry.fromDate && entry.toDate && entry.fromDate !== entry.toDate && (
                      <span className="text-muted-foreground"> ({entry.fromDate} → {entry.toDate})</span>
                    )}
                    <p className="text-muted-foreground mt-0.5">{formatDate(entry.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
