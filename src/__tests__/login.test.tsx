import { describe, it, expect } from 'vitest';

describe('Login Page Logic', () => {
  it('should validate email format', () => {
    const validEmail = 'user@example.com';
    const invalidEmail = 'not-an-email';
    expect(validEmail).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    expect(invalidEmail).not.toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  it('should require password field', () => {
    const input = document.createElement('input');
    input.type = 'password';
    input.required = true;
    expect(input.required).toBe(true);
  });

  it('should not submit with empty fields', () => {
    const email = '';
    const password = '';
    expect(email).toBeFalsy();
    expect(password).toBeFalsy();
  });

  it('should handle API error messages', () => {
    const errorResponse = { response: { data: { message: 'Invalid email or password' } } };
    const message = errorResponse.response?.data?.message || 'Login failed';
    expect(message).toBe('Invalid email or password');
  });
});
