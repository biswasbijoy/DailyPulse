'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/authContext';
import { getTodayTasks } from '@/services/tasks';
import { ClipboardList, CheckCircle2, PlayCircle, Clock, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

function StatCard({ label, value, gradient, icon: Icon, subtitle }: { label: string; value: string | number; gradient: string; icon: React.ComponentType<{ className?: string }>; subtitle?: string }) {
  return (
    <div className={`rounded-2xl p-5 text-white ${gradient} shadow-lg shadow-black/10 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm font-medium text-white/80">{label}</span>
        <Icon className="w-5 h-5 opacity-80" />
      </div>
      <p className="text-3xl font-bold">{value}</p>
      {subtitle && <p className="text-xs text-white/70 mt-1">{subtitle}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', 'today'],
    queryFn: getTodayTasks,
    enabled: !!user,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) return null;

  const completed = tasks.filter((t) => t.status === 'completed').length;
  const pending = tasks.filter((t) => t.status === 'pending').length;
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
  const completionRate = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

  const statusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✓';
      case 'in_progress': return '→';
      case 'pending': return '○';
      case 'postponed': return '↻';
      default: return '·';
    }
  };

  return (
    <div className="space-y-8">
      <div className="animate-in stagger-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, <span className="font-medium text-foreground">{user.name}</span>
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 animate-in stagger-2">
        <StatCard
          label="Today's Tasks"
          value={tasks.length}
          icon={ClipboardList}
          gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
          subtitle="Total tasks for today"
        />
        <StatCard
          label="Completed"
          value={completed}
          icon={CheckCircle2}
          gradient="bg-gradient-to-br from-emerald-400 to-teal-500"
          subtitle={`${completionRate}% of all tasks`}
        />
        <StatCard
          label="In Progress"
          value={inProgress}
          icon={PlayCircle}
          gradient="bg-gradient-to-br from-amber-400 to-orange-500"
          subtitle="Currently active"
        />
        <StatCard
          label="Pending"
          value={pending}
          icon={Clock}
          gradient="bg-gradient-to-br from-sky-400 to-cyan-500"
          subtitle="Waiting to start"
        />
      </div>

      <Card className="animate-in stagger-3">
        <CardContent className="p-0">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Today's Overview</h3>
          </div>
          {isLoading ? (
            <div className="p-5 text-muted-foreground text-sm">Loading...</div>
          ) : tasks.length === 0 ? (
            <div className="p-5 text-center">
              <Target className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground text-sm">No tasks for today. Add one to get started!</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {tasks.slice(0, 5).map((task) => (
                <Link
                  key={task._id}
                  href="/tasks"
                  className="flex items-center gap-3 px-5 py-3 hover:bg-accent/50 focus-visible:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset transition-colors"
                >
                  <span className={cn(
                    'w-2 h-2 rounded-full shrink-0',
                    task.status === 'completed' ? 'bg-emerald-400' :
                    task.status === 'in_progress' ? 'bg-amber-400' :
                    task.status === 'postponed' ? 'bg-purple-400' : 'bg-muted-foreground/50'
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-sm truncate',
                      task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'
                    )}>
                      {task.title}
                    </p>
                  </div>
                  <span className={cn(
                    'text-xs font-medium capitalize px-2.5 py-0.5 rounded-full',
                    task.status === 'completed' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-300' :
                    task.status === 'in_progress' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/50 dark:text-amber-300' :
                    task.status === 'postponed' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/50 dark:text-purple-300' :
                    'bg-secondary text-muted-foreground'
                  )}>
                    {task.status === 'postponed' ? 'rescheduled' : task.status.replace('_', ' ')}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
