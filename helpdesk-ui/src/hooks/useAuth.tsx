import React, { createContext, useContext, useState, useCallback } from 'react';
import type { User, Role } from '../types';
import { apiLogin } from '../lib/apiClient';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: false,
  error: null,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = sessionStorage.getItem('hd_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const u = await apiLogin(email, password);
      setUser(u);
      sessionStorage.setItem('hd_user', JSON.stringify(u));
    } catch (e) {
      setError((e as Error).message || 'Login failed');
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem('hd_user');
    import('../lib/apiClient').then(m => m.apiLogout());
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }

export function getRoleHome(role: Role): string {
  switch (role) {
    case 'employee': return '/my-tickets';
    case 'agent':    return '/queue';
    case 'manager':  return '/sla-dashboard';
    case 'admin':    return '/knowledge-base';
  }
}
