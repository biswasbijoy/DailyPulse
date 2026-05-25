import api from './api';
import type { AuthResponse, LoginInput, RegisterInput, UserSettings } from '@/types';

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

export async function updateProfile(data: { name?: string; timezone?: string }): Promise<AuthResponse> {
  const res = await api.put('/auth/profile', data);
  return res.data.data;
}

export async function changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
  await api.put('/auth/password', data);
}

export async function updateSettings(data: Partial<UserSettings>): Promise<{ settings: UserSettings }> {
  const res = await api.put('/auth/settings', data);
  return res.data.data;
}
