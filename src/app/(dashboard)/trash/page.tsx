'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { AlertTriangle, RotateCcw, Trash2 } from 'lucide-react';
import { useAuth } from '@/store/authContext';
import { getTrashTasks, restoreTask, permanentDeleteTask } from '@/services/tasks';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import type { Task } from '@/types';

const priorityConfig = {
  high: { badge: 'bg-red-50 text-red-600 dark:bg-red-900/50 dark:text-red-300', label: 'High' },
  medium: { badge: 'bg-amber-50 text-amber-600 dark:bg-amber-900/50 dark:text-amber-300', label: 'Medium' },
  low: { badge: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-300', label: 'Low' },
};

export default function TrashPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();
  const [permanentDeleteId, setPermanentDeleteId] = useState<string | null>(null);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', 'trash'],
    queryFn: getTrashTasks,
    enabled: !!user,
  });

  const restoreMutation = useMutation({
    mutationFn: restoreTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'trash'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: permanentDeleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'trash'] });
      setPermanentDeleteId(null);
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) return null;

  return (
    <div className="space-y-6 animate-in stagger-1">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/50 flex items-center justify-center">
          <Trash2 className="w-5 h-5 text-red-500 dark:text-red-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Trash</h1>
          <p className="text-muted-foreground mt-1">Deleted tasks can be restored or permanently removed</p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground text-sm">Loading...</div>
      ) : tasks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Trash2 className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">Trash is empty.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const config = priorityConfig[task.priority] || priorityConfig.low;
            return (
              <Card key={task._id} className="border-red-100 bg-red-50/20 dark:border-red-900/50 dark:bg-red-950/20">
                <CardContent className="flex items-center gap-3 py-3.5">
                  <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 dark:text-red-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${config.badge}`}>
                        {config.label}
                      </span>
                      {task.category && (
                        <span className="text-[11px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                          {task.category}
                        </span>
                      )}
                      {task.deletedAt && (
                        <span className="text-[11px] text-red-400 dark:text-red-300">
                          Deleted {new Date(task.deletedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={restoreMutation.isPending}
                      onClick={() => restoreMutation.mutate(task._id)}
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1" />
                      Restore
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setPermanentDeleteId(task._id)}
                    >
                      Delete Forever
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!permanentDeleteId}
        title="Permanently Delete Task"
        message="This action cannot be undone. The task will be permanently removed."
        onConfirm={() => {
          if (permanentDeleteId) {
            permanentDeleteMutation.mutate(permanentDeleteId);
          }
        }}
        onCancel={() => setPermanentDeleteId(null)}
        loading={permanentDeleteMutation.isPending}
      />
    </div>
  );
}
