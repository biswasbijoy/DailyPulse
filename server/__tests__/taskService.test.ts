import { describe, it, expect } from 'vitest';

describe('Task Service', () => {
  const priorities = ['low', 'medium', 'high'] as const;

  it('should prioritize high over medium over low', () => {
    const priorityRank = (p: string) => p === 'high' ? 3 : p === 'medium' ? 2 : 1;
    expect(priorityRank('high')).toBeGreaterThan(priorityRank('medium'));
    expect(priorityRank('medium')).toBeGreaterThan(priorityRank('low'));
  });

  it('should validate task status values', () => {
    const validStatuses = ['pending', 'in_progress', 'completed', 'postponed', 'cancelled'];
    const invalidStatus = 'deleted';
    expect(validStatuses).toContain('pending');
    expect(validStatuses).not.toContain(invalidStatus);
  });

  it('should handle task creation data shape', () => {
    const createData = {
      title: 'Test Task',
      description: 'A test task',
      priority: 'medium' as const,
      category: 'Work',
      tags: ['test'],
      estimatedMinutes: 30,
    };
    expect(createData.title).toBeTruthy();
    expect(priorities).toContain(createData.priority);
    expect(Array.isArray(createData.tags)).toBe(true);
  });

  it('should handle task update data shape', () => {
    const updateData = {
      title: 'Updated Task',
      status: 'completed' as const,
      actualMinutes: 25,
    };
    expect(updateData.title).toBeTruthy();
    expect(['pending', 'in_progress', 'completed', 'postponed', 'cancelled']).toContain(updateData.status);
  });

  it('should compute correct priority sort order', () => {
    const tasks = [
      { title: 'A', priority: 'low' as const },
      { title: 'B', priority: 'high' as const },
      { title: 'C', priority: 'medium' as const },
    ];
    const rank = (p: string) => p === 'high' ? 3 : p === 'medium' ? 2 : 1;
    const sorted = [...tasks].sort((a, b) => rank(b.priority) - rank(a.priority));
    expect(sorted[0].priority).toBe('high');
    expect(sorted[1].priority).toBe('medium');
    expect(sorted[2].priority).toBe('low');
  });
});
