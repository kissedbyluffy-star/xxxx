'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

type SettingsForm = {
  deposit_mode: 'fixed' | 'pool';
  fallback_to_fixed: boolean;
  fixed_addresses: Record<string, string>;
  explorer_templates: Record<string, string>;
};

const defaultSettings: SettingsForm = {
  deposit_mode: 'fixed',
  fallback_to_fixed: true,
  fixed_addresses: { BTC: '', ERC20: '', BEP20: '', TRC20: '' },
  explorer_templates: {
    BTC: 'https://www.blockchain.com/explorer/transactions/btc/{txid}',
    ERC20: 'https://etherscan.io/tx/{txid}',
    BEP20: 'https://bscscan.com/tx/{txid}',
    TRC20: 'https://tronscan.org/#/transaction/{txid}'
  }
};

export default function AdminSettingsPage() {
  const [form, setForm] = useState<SettingsForm>(defaultSettings);
  const [message, setMessage] = useState<string | null>(null);

  const fetchSettings = async () => {
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;
    const res = await fetch('/api/admin/settings', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return;
    const dataJson = await res.json();
    setForm({ ...defaultSettings, ...dataJson });
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const saveSettings = async () => {
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form)
    });
    if (!res.ok) {
      setMessage('Failed to save settings.');
      return;
    }
    setMessage('Settings saved.');
  };

  return (
    <div className="glass rounded-2xl p-6 shadow-card">
      <h2 className="text-lg font-semibold">Deposit Settings</h2>
      <p className="text-sm text-white/60">Control deposit mode, fixed addresses, and explorer templates.</p>

      <div className="mt-6 grid gap-4">
        <div>
          <label className="text-xs text-white/50">Deposit mode</label>
          <select
            className="input"
            value={form.deposit_mode}
            onChange={(e) => setForm((prev) => ({ ...prev, deposit_mode: e.target.value as SettingsForm['deposit_mode'] }))}
          >
            <option value="fixed">Fixed addresses</option>
            <option value="pool">Address pool</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-white/70">
          <input
            type="checkbox"
            checked={form.fallback_to_fixed}
            onChange={(e) => setForm((prev) => ({ ...prev, fallback_to_fixed: e.target.checked }))}
          />
          Fallback to fixed addresses if pool is empty
        </label>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h3 className="text-sm font-semibold">Fixed deposit addresses</h3>
          {Object.keys(form.fixed_addresses).map((network) => (
            <div key={network} className="mt-3">
              <label className="text-xs text-white/50">{network}</label>
              <input
                className="input"
                value={form.fixed_addresses[network]}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    fixed_addresses: { ...prev.fixed_addresses, [network]: e.target.value }
                  }))
                }
              />
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h3 className="text-sm font-semibold">Explorer URL templates</h3>
          {Object.keys(form.explorer_templates).map((network) => (
            <div key={network} className="mt-3">
              <label className="text-xs text-white/50">{network}</label>
              <input
                className="input"
                value={form.explorer_templates[network]}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    explorer_templates: { ...prev.explorer_templates, [network]: e.target.value }
                  }))
                }
              />
            </div>
          ))}
        </div>
      </div>

      <button className="btn-primary mt-6" onClick={saveSettings}>
        Save settings
      </button>
      {message && <p className="mt-2 text-sm text-emerald-300">{message}</p>}
    </div>
  );
}
