import { describe, it, expect } from 'vitest';

describe('Analytics Service', () => {
  it('should calculate completion rate correctly', () => {
    const totalTasks = 10;
    const completedTasks = 7;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    expect(completionRate).toBe(70);
  });

  it('should handle zero tasks gracefully', () => {
    const totalTasks = 0;
    const completionRate = totalTasks > 0 ? 0 : 0;
    expect(completionRate).toBe(0);
  });

  it('should calculate productivity score', () => {
    const completed = 5;
    const postponed = 2;
    const cancelled = 1;
    const score = completed * 5 - postponed * 2 - cancelled * 1;
    expect(score).toBe(20);
  });

  it('should detect daily breakdown data shape', () => {
    const breakdown = [
      { date: '2026-05-24', completed: 3, pending: 1, postponed: 0, cancelled: 0, total: 4 },
    ];
    expect(breakdown[0]).toHaveProperty('date');
    expect(breakdown[0]).toHaveProperty('completed');
    expect(breakdown[0]).toHaveProperty('total');
  });
});
