'use client';

import { useState, use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FolderKanban, Plus } from 'lucide-react';
import { useAuth } from '@/store/authContext';
import { getProjectById } from '@/services/projects';
import { filterTasks } from '@/services/tasks';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TaskList } from '@/components/TaskList';
import { TaskDetails } from '@/components/TaskDetails';
import { TaskForm } from '@/components/TaskForm';
import type { Task } from '@/types';

export default function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState<Task | undefined>(undefined);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProjectById(projectId),
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', 'project', projectId],
    queryFn: () => filterTasks({ projectId }),
    enabled: !!projectId && !!user,
  });

  if (projectLoading) {
    return <div className="text-muted-foreground text-sm py-8 text-center">Loading project...</div>;
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <FolderKanban className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">Project not found.</p>
        <Link href="/projects" className="text-blue-600 dark:text-blue-400 text-sm mt-2 inline-block hover:underline">
          Back to projects
        </Link>
      </div>
    );
  }

  const handleEdit = (task: Task) => {
    setEditTask(task);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditTask(undefined);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/projects"
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div
            className="w-4 h-4 rounded-full shrink-0"
            style={{ backgroundColor: project.color || '#6366f1' }}
          />
          <div>
            <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
            {project.description && (
              <p className="text-sm text-muted-foreground mt-0.5">{project.description}</p>
            )}
          </div>
        </div>
        <Button variant="gradient" size="sm" onClick={() => { setEditTask(undefined); setShowForm(!showForm); }}>
          <Plus className="w-4 h-4 mr-1.5" />
          {showForm ? 'Cancel' : 'Add Task'}
        </Button>
      </div>

      {showForm && (
        <Card className="border-blue-100 shadow-md shadow-blue-100/50 dark:border-blue-900/50 dark:shadow-blue-950/50 animate-in">
          <CardContent className="pt-6">
            <TaskForm onClose={handleClose} editTask={editTask} defaultProjectId={projectId} />
          </CardContent>
        </Card>
      )}

      {tasksLoading ? (
        <div className="text-muted-foreground text-sm py-8 text-center">Loading tasks...</div>
      ) : (
        <TaskList tasks={tasks} onEdit={handleEdit} onViewDetails={setSelectedTask} showCheckbox />
      )}
      <TaskDetails task={selectedTask} onClose={() => setSelectedTask(null)} />
    </div>
  );
}
