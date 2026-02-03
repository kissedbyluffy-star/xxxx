import { useEffect, useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import AdminShell from './AdminShell';

const NETWORKS = ['BTC', 'ERC20', 'BEP20', 'TRC20'];

type SettingsState = {
  deposit_mode: string;
  fallback_to_fixed: boolean;
  fixed_addresses: Record<string, string>;
  explorer_templates: Record<string, string>;
};

export default function AdminSettings() {
  const { session } = useAdmin();
  const [settings, setSettings] = useState<SettingsState>({
    deposit_mode: 'fixed',
    fallback_to_fixed: true,
    fixed_addresses: {},
    explorer_templates: {}
  });
  const [message, setMessage] = useState<string | null>(null);

  const fetchSettings = async () => {
    if (!session) return;
    const res = await fetch('/api/admin/settings', { credentials: 'include' });
    if (!res.ok) return;
    const data = await res.json();
    setSettings({
      deposit_mode: data.deposit_mode ?? 'fixed',
      fallback_to_fixed: data.fallback_to_fixed ?? true,
      fixed_addresses: data.fixed_addresses ?? {},
      explorer_templates: data.explorer_templates ?? {}
    });
  };

  useEffect(() => {
    fetchSettings();
  }, [session]);

  const updateSettings = async () => {
    if (!session) return;
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-csrf-token': session.csrfToken },
      credentials: 'include',
      body: JSON.stringify(settings)
    });
    if (!res.ok) {
      setMessage('Failed to save settings.');
      return;
    }
    setMessage('Settings saved.');
  };

  return (
    <AdminShell>
      <div className="glass rounded-2xl p-6 shadow-card">
        <h2 className="text-lg font-semibold">Settings</h2>
        <p className="text-sm text-white/60">Configure deposit addresses, explorers, and behavior.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs text-white/50">Deposit mode</label>
            <select
              className="input"
              value={settings.deposit_mode}
              onChange={(e) => setSettings((prev) => ({ ...prev, deposit_mode: e.target.value }))}
            >
              <option value="fixed">Fixed</option>
              <option value="pool">Pool (future)</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.fallback_to_fixed}
              onChange={(e) => setSettings((prev) => ({ ...prev, fallback_to_fixed: e.target.checked }))}
            />
            <span className="text-sm text-white/60">Fallback to fixed addresses if pool empty</span>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-sm font-semibold">Fixed deposit addresses</h3>
            <div className="mt-3 space-y-3">
              {NETWORKS.map((network) => (
                <div key={network}>
                  <label className="text-xs text-white/50">{network} address</label>
                  <input
                    className="input"
                    value={settings.fixed_addresses?.[network] ?? ''}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        fixed_addresses: { ...prev.fixed_addresses, [network]: e.target.value }
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-sm font-semibold">Explorer templates</h3>
            <p className="text-xs text-white/50">Use {`{txid}`} as placeholder.</p>
            <div className="mt-3 space-y-3">
              {NETWORKS.map((network) => (
                <div key={network}>
                  <label className="text-xs text-white/50">{network} explorer</label>
                  <input
                    className="input"
                    value={settings.explorer_templates?.[network] ?? ''}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        explorer_templates: { ...prev.explorer_templates, [network]: e.target.value }
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <button className="btn-primary mt-6" onClick={updateSettings}>
          Save settings
        </button>
        {message && <p className="mt-2 text-sm text-emerald-300">{message}</p>}
      </div>
    </AdminShell>
  );
}
