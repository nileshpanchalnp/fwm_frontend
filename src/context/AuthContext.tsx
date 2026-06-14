import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi, User } from '../api/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>(null!);
const SESSION_KEY = 'lms_session_active';

// ✅ Clears all browser cache, sessionStorage, and any cached API responses
const clearAppCache = async () => {
  // 1. Clear sessionStorage
  sessionStorage.clear();

  // 2. Clear localStorage (if anything is stored)
  localStorage.clear();

  // 3. Clear Cache API (service worker cache)
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    } catch {
      // ignore if not supported
    }
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const sessionActive = sessionStorage.getItem(SESSION_KEY);

      if (!sessionActive) {
        // Browser was closed — clear everything and force login
        await clearAppCache();
        await authApi.logout().catch(() => {});
        setUser(null);
        return;
      }

      const data: any = await authApi.me();
      if (data?.user) {
        setUser(data.user);
      } else {
        await clearAppCache();
        setUser(null);
      }
    } catch {
      await clearAppCache();
      setUser(null);
    }
  }, []);

  // On mount
  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  // Re-check when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshUser();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [refreshUser]);

  // ✅ Prevent browser back button showing cached dashboard after logout
  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      // persisted = true means page was restored from back/forward cache
      if (e.persisted) {
        const sessionActive = sessionStorage.getItem(SESSION_KEY);
        if (!sessionActive) {
          // Page was cached but user is logged out — force reload to login
          window.location.reload();
        }
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  // ✅ Clear cache when browser/tab is closing
  useEffect(() => {
    const handleBeforeUnload = () => {
      const sessionActive = sessionStorage.getItem(SESSION_KEY);
      if (!sessionActive) {
        // Already logged out — clear everything on close
        localStorage.clear();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const login = async (email: string, password: string) => {
    setUser(null);
    try {
      const data: any = await authApi.login({ email, password });
      if (!data?.user) throw new Error('Invalid response from server.');
      sessionStorage.setItem(SESSION_KEY, 'true');
      setUser(data.user);
    } catch (error) {
      setUser(null);
      sessionStorage.removeItem(SESSION_KEY);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    return await authApi.register({ name, email, password });
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      // ✅ Clear ALL cache on logout
      await clearAppCache();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);