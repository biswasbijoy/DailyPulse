import api from './api';
import type { AuthResponse, LoginInput, RegisterInput } from '@/types';

export async function loginUser(data: LoginInput): Promise<AuthResponse> {
  const res = await api.post('/auth/login', data);
  return res.data.data;
}

export async function registerUser(data: RegisterInput): Promise<AuthResponse> {
  const res = await api.post('/auth/register', data);
  return res.data.data;
}

export async function logoutUser(): Promise<void> {
  await api.post('/auth/logout');
}
