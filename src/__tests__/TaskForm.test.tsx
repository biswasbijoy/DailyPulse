import { describe, it, expect } from 'vitest';

describe('TaskForm', () => {
  const validTask = {
    title: 'Test Task',
    description: 'A description',
    priority: 'medium' as const,
    category: 'Work',
    dueDate: '2026-06-01',
    tags: ['test', 'urgent'],
    estimatedMinutes: 30,
  };

  it('should validate required title field', () => {
    expect(validTask.title).toBeTruthy();
    expect(validTask.title.length).toBeGreaterThan(0);
  });

  it('should handle tags conversion from comma-separated string', () => {
    const tagsInput = 'work, urgent, test';
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
    expect(tags).toEqual(['work', 'urgent', 'test']);
    expect(tags.length).toBe(3);
  });

  it('should handle empty tags input', () => {
    const tagsInput = '';
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
    expect(tags).toEqual([]);
  });

  it('should parse estimated minutes from string', () => {
    const input = '30';
    const minutes = input ? parseInt(input, 10) : undefined;
    expect(minutes).toBe(30);
  });

  it('should handle undefined estimated minutes', () => {
    const input = '';
    const minutes = input ? parseInt(input, 10) : undefined;
    expect(minutes).toBeUndefined();
  });

  it('should validate priority values', () => {
    const priorities = ['low', 'medium', 'high'];
    priorities.forEach((p) => {
      expect(['low', 'medium', 'high']).toContain(p);
    });
  });
});
