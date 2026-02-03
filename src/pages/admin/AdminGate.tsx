import { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const { session, loading, login, logout } = useAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    const result = await login(email, password);
    if (!result.success) {
      setError(result.error ?? 'Login failed');
    }
  };

  if (loading) {
    return <div className="text-sm text-white/60">Loading session...</div>;
  }

  if (!session) {
    return (
      <div className="glass rounded-2xl p-6 shadow-card">
        <h2 className="text-lg font-semibold">Admin login</h2>
        <p className="text-sm text-white/60">Authenticate with your admin credentials.</p>
        <div className="mt-4 grid gap-3">
          <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input
            className="input"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-sm text-rose-300">{error}</p>}
          <button className="btn-primary" onClick={handleLogin}>
            Sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/60">
        <span>Signed in as {session.email}</span>
        <button className="btn-secondary" onClick={logout}>
          Sign out
        </button>
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}
