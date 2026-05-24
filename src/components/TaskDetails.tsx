'use client';

import type { Task } from '@/types';
import { Button } from '@/components/ui/button';

interface TaskDetailsProps {
  task: Task | null;
  onClose: () => void;
}

const statusColors: Record<string, string> = {
  completed: 'bg-emerald-50 text-emerald-600',
  in_progress: 'bg-amber-50 text-amber-600',
  pending: 'bg-gray-100 text-gray-500',
  postponed: 'bg-purple-50 text-purple-600',
};

const priorityColors: Record<string, string> = {
  high: 'bg-red-50 text-red-600',
  medium: 'bg-amber-50 text-amber-600',
  low: 'bg-emerald-50 text-emerald-600',
};

export function TaskDetails({ task, onClose }: TaskDetailsProps) {
  if (!task) return null;

  const formatDate = (d: string | Date | undefined) => {
    if (!d) return '—';
    return new Date(d).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-50 w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-white border border-gray-100 shadow-2xl shadow-black/10 p-6">
        <div className="flex items-start justify-between mb-5">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{task.title}</h3>
            <div className="flex gap-2 mt-2">
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full capitalize ${statusColors[task.status] || ''}`}>
                {task.status === 'postponed' ? 'rescheduled' : task.status.replace('_', ' ')}
              </span>
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full capitalize ${priorityColors[task.priority] || ''}`}>
                {task.priority}
              </span>
              {task.category && (
                <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">
                  {task.category}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors shrink-0"
          >
            ✕
          </button>
        </div>

        {task.description && (
          <p className="text-sm text-gray-500 mb-5 bg-gray-50 rounded-xl p-3">{task.description}</p>
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
            <p className="text-xs text-gray-400 mb-2 font-medium">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {task.tags.map((tag, i) => (
                <span key={i} className="text-xs bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {task.history && task.history.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Activity History
            </h4>
            <div className="space-y-2">
              {task.history.map((entry, i) => (
                <div key={i} className="flex items-start gap-3 text-xs">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-blue-400 mt-1" />
                    {i < task.history.length - 1 && <div className="w-px h-full bg-blue-100" />}
                  </div>
                  <div className="flex-1 pb-2">
                    <span className="font-medium text-gray-700 capitalize">
                      {entry.action === 'postponed' ? 'rescheduled' : entry.action.replace('_', ' ')}
                    </span>
                    {entry.fromDate && entry.toDate && entry.fromDate !== entry.toDate && (
                      <span className="text-gray-400"> ({entry.fromDate} → {entry.toDate})</span>
                    )}
                    <p className="text-gray-400 mt-0.5">{formatDate(entry.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}
