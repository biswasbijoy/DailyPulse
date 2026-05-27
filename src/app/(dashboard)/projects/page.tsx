'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProjects, createProject, updateProject, deleteProject } from '@/services/projects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { FolderKanban, Plus, Trash2, Archive, Eye, EyeOff, ChevronRight } from 'lucide-react';
import type { Project } from '@/types';

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects', showArchived],
    queryFn: () => getProjects(showArchived),
  });

  const createMutation = useMutation({
    mutationFn: () => createProject({ name, description: description || undefined, color }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setName('');
      setDescription('');
      setColor('#6366f1');
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200">
            <FolderKanban className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Projects</h1>
            <p className="text-sm text-muted-foreground">Organize tasks into projects</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
          >
            {showArchived ? <EyeOff className="w-4 h-4 mr-1.5" /> : <Eye className="w-4 h-4 mr-1.5" />}
            {showArchived ? 'Hide Archived' : 'Show Archived'}
          </Button>
          <Button variant="gradient" size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-1.5" />
            New Project
          </Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Project Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Work, Side Project" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring resize-none"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Color</label>
                <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-20 p-1" />
              </div>
              <div className="flex gap-2">
                <Button type="submit" variant="gradient" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <p className="text-muted-foreground text-center py-8">Loading projects...</p>
      ) : projects.length === 0 ? (
        <div className="text-center py-12">
          <FolderKanban className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No projects yet. Create your first project!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((project: Project) => (
            <Card key={project._id} className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-center justify-between py-4">
                <Link href={`/projects/${project._id}`} className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: project.color || '#6366f1' }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">{project.name}</h3>
                    {project.description && (
                      <p className="text-sm text-muted-foreground truncate">{project.description}</p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </Link>
                <div className="flex items-center gap-2 ml-3 shrink-0">
                  {project.archived && (
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-lg">Archived</span>
                  )}
                  <button
                    onClick={() => updateMutation.mutate({ id: project._id, data: { archived: !project.archived } })}
                    className="p-2 text-muted-foreground hover:text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-all"
                    title={project.archived ? 'Unarchive' : 'Archive'}
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(project._id)}
                    className="p-2 text-muted-foreground hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
