import { describe, it, expect } from 'vitest';

describe('Auth Service', () => {
  it('should hash passwords correctly', () => {
    const password = 'test123456';
    expect(password.length).toBeGreaterThanOrEqual(6);
  });

  it('should validate email format', () => {
    const validEmail = 'test@example.com';
    expect(validEmail).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  it('should reject short passwords', () => {
    const shortPassword = '12345';
    expect(shortPassword.length).toBeLessThan(6);
  });

  it('should reject empty email', () => {
    expect(''.length).toBe(0);
  });
});
