import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type AdminSession = {
  email: string;
  csrfToken: string;
};

type AdminContextValue = {
  session: AdminSession | null;
  loading: boolean;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
};

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/session', { credentials: 'include' });
    if (!res.ok) {
      setSession(null);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setSession({ email: data.email, csrfToken: data.csrfToken });
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { success: false, error: data?.error ?? 'Login failed' };
    }
    await refresh();
    return { success: true };
  }, [refresh]);

  const logout = useCallback(async () => {
    if (!session) return;
    await fetch('/api/admin/logout', {
      method: 'POST',
      headers: { 'x-csrf-token': session.csrfToken },
      credentials: 'include'
    });
    setSession(null);
  }, [session]);

  const value = useMemo(() => ({ session, loading, refresh, login, logout }), [session, loading, refresh, login, logout]);

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
}
