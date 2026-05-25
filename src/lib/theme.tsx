'use client';

import { ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from '@/store/authContext';

export function applyTheme(theme: 'light' | 'dark' | 'system') {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else if (theme === 'light') {
    root.classList.remove('dark');
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', prefersDark);
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const theme = user?.settings?.theme || 'system';

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  return <>{children}</>;
}

export function useApplyTheme() {
  const { user, refreshUser } = useAuth();
  return useCallback(async () => {
    applyTheme(user?.settings?.theme || 'system');
    await refreshUser();
  }, [user?.settings?.theme, refreshUser]);
}
