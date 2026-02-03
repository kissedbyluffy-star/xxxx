'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined;

const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export default function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const login = async () => {
    if (!supabase) return;
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
    }
  };

  const logout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  if (!supabase) {
    return (
      <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200">
        Missing Supabase public environment variables.
      </div>
    );
  }

  if (loading) {
    return <div className="text-sm text-white/60">Loading session...</div>;
  }

  if (!session) {
    return (
      <div className="glass rounded-2xl p-6 shadow-card">
        <h2 className="text-lg font-semibold">Admin login</h2>
        <p className="text-sm text-white/60">Authenticate with Supabase Auth.</p>
        <div className="mt-4 grid gap-3">
          <input
            className="input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="input"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-sm text-rose-300">{error}</p>}
          <button className="btn-primary" onClick={login}>
            Sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/60">
        <span>Signed in as {session.user.email}</span>
        <button className="btn-secondary" onClick={logout}>
          Sign out
        </button>
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}
