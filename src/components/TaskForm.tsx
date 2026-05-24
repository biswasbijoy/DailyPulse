'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTask, updateTask } from '@/services/tasks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { CreateTaskInput, UpdateTaskInput, Task, RecurrenceType } from '@/types';

interface TaskFormProps {
  onClose: () => void;
  editTask?: Task;
}

const RECURRENCE_LABELS: Record<string, string> = {
  none: 'No repeat',
  daily: 'Daily',
  weekdays: 'Weekdays',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

export function TaskForm({ onClose, editTask }: TaskFormProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(editTask?.title || '');
  const [description, setDescription] = useState(editTask?.description || '');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(
    editTask?.priority || 'medium'
  );
  const [category, setCategory] = useState(editTask?.category || '');
  const [dueDate, setDueDate] = useState(editTask?.dueDate || '');
  const [tagsInput, setTagsInput] = useState(editTask?.tags?.join(', ') || '');
  const [estimatedMinutes, setEstimatedMinutes] = useState(editTask?.estimatedMinutes?.toString() || '');
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>(editTask?.recurrence?.type || 'none');
  const [recurrenceInterval, setRecurrenceInterval] = useState(editTask?.recurrence?.interval?.toString() || '1');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState(editTask?.recurrence?.endDate || '');

  const mutation = useMutation({
    mutationFn: async (data: CreateTaskInput | UpdateTaskInput) => {
      if (editTask) {
        return updateTask(editTask._id, data);
      }
      return createTask(data as CreateTaskInput);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    mutation.mutate({
      title,
      description: description || undefined,
      priority,
      category: category || undefined,
      dueDate: dueDate || undefined,
      tags: tags.length > 0 ? tags : undefined,
      estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes, 10) : undefined,
      recurrence: recurrenceType !== 'none' ? {
        type: recurrenceType,
        interval: parseInt(recurrenceInterval, 10) || 1,
        endDate: recurrenceEndDate || undefined,
      } : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What do you need to do?"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional details"
          rows={3}
          className="flex w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
            className="flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
          <Input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Work, Personal"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Due Date</label>
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Est. Minutes</label>
          <Input
            type="number"
            min={1}
            value={estimatedMinutes}
            onChange={(e) => setEstimatedMinutes(e.target.value)}
            placeholder="e.g. 30"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags</label>
        <Input
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="Comma-separated tags, e.g. work, urgent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Repeat</label>
        <div className="grid grid-cols-5 gap-2">
          {['none', 'daily', 'weekdays', 'weekly', 'monthly'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRecurrenceType(r as RecurrenceType)}
              className={`px-2 py-1.5 text-xs font-medium rounded-lg transition-all ${
                recurrenceType === r
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {RECURRENCE_LABELS[r]}
            </button>
          ))}
        </div>
      </div>
      {recurrenceType !== 'none' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Every</label>
            <Input
              type="number"
              min={1}
              value={recurrenceInterval}
              onChange={(e) => setRecurrenceInterval(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date</label>
            <Input
              type="date"
              value={recurrenceEndDate}
              onChange={(e) => setRecurrenceEndDate(e.target.value)}
            />
          </div>
        </div>
      )}
      <div className="flex gap-2 pt-2">
        <Button type="submit" variant="gradient" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : editTask ? 'Update Task' : 'Add Task'}
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
