'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { User } from '@/types';
import api from '@/services/api';

interface AuthContextType {
  user: User | null;
  setAuth: (user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setAuth: () => {},
  logout: () => {},
  isLoading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/me')
      .then((res) => {
        setUser(res.data.data.user);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const setAuth = useCallback((user: User) => {
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    api.post('/auth/logout').finally(() => {
      setUser(null);
      window.location.href = '/login';
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, setAuth, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
