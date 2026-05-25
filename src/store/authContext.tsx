'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/types';
import api from '@/services/api';

interface AuthContextType {
  user: User | null;
  setAuth: (user: User) => void;
  logout: () => void;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setAuth: () => {},
  logout: () => {},
  isLoading: true,
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.data.user);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    fetchUser().finally(() => setIsLoading(false));
  }, [fetchUser]);

  const setAuth = useCallback((user: User) => {
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    api.post('/auth/logout').finally(() => {
      setUser(null);
      router.push('/login');
    });
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, setAuth, logout, isLoading, refreshUser: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
