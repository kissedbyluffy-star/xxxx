import { useEffect, useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import AdminShell from './AdminShell';
import { ASSETS, NETWORKS, FIAT_CURRENCIES } from '@/lib/constants';

type Rate = {
  id: string;
  asset_symbol: string;
  network: string;
  fiat_currency: string;
  buy_rate: number;
  fee_pct: number | null;
  fee_flat: number | null;
  updated_at: string;
};

export default function AdminRates() {
  const { session } = useAdmin();
  const [rates, setRates] = useState<Rate[]>([]);
  const [form, setForm] = useState({
    asset_symbol: ASSETS[0],
    network: NETWORKS[0],
    fiat_currency: FIAT_CURRENCIES[0],
    buy_rate: '',
    fee_pct: '',
    fee_flat: ''
  });
  const [message, setMessage] = useState<string | null>(null);

  const fetchRates = async () => {
    if (!session) return;
    const res = await fetch('/api/admin/rates', { credentials: 'include' });
    if (!res.ok) return;
    const data = await res.json();
    setRates(data ?? []);
  };

  useEffect(() => {
    fetchRates();
  }, [session]);

  const createRate = async () => {
    if (!session) return;
    const payload = {
      ...form,
      buy_rate: Number(form.buy_rate),
      fee_pct: form.fee_pct ? Number(form.fee_pct) : null,
      fee_flat: form.fee_flat ? Number(form.fee_flat) : null
    };
    const res = await fetch('/api/admin/rates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-csrf-token': session.csrfToken },
      credentials: 'include',
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      setMessage('Failed to add rate.');
      return;
    }
    setForm({ ...form, buy_rate: '', fee_pct: '', fee_flat: '' });
    setMessage('Rate added.');
    fetchRates();
  };

  const updateRate = async (rate: Rate) => {
    if (!session) return;
    const res = await fetch('/api/admin/rates', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-csrf-token': session.csrfToken },
      credentials: 'include',
      body: JSON.stringify(rate)
    });
    if (!res.ok) {
      setMessage('Failed to update rate.');
      return;
    }
    setMessage('Rate updated.');
    fetchRates();
  };

  const deleteRate = async (id: string) => {
    if (!session) return;
    const res = await fetch('/api/admin/rates', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'x-csrf-token': session.csrfToken },
      credentials: 'include',
      body: JSON.stringify({ id })
    });
    if (!res.ok) {
      setMessage('Failed to delete rate.');
      return;
    }
    setMessage('Rate removed.');
    fetchRates();
  };

  return (
    <AdminShell>
      <div className="glass rounded-2xl p-6 shadow-card">
        <h2 className="text-lg font-semibold">Rates</h2>
        <p className="text-sm text-white/60">Manage buy rates and fees for every pair.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs text-white/50">Asset</label>
            <select
              className="input"
              value={form.asset_symbol}
              onChange={(e) => setForm((prev) => ({ ...prev, asset_symbol: e.target.value }))}
            >
              {ASSETS.map((asset) => (
                <option key={asset} value={asset}>
                  {asset}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-white/50">Network</label>
            <select
              className="input"
              value={form.network}
              onChange={(e) => setForm((prev) => ({ ...prev, network: e.target.value }))}
            >
              {NETWORKS.map((network) => (
                <option key={network} value={network}>
                  {network}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-white/50">Fiat currency</label>
            <select
              className="input"
              value={form.fiat_currency}
              onChange={(e) => setForm((prev) => ({ ...prev, fiat_currency: e.target.value }))}
            >
              {FIAT_CURRENCIES.map((fiat) => (
                <option key={fiat} value={fiat}>
                  {fiat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-white/50">Buy rate</label>
            <input
              className="input"
              value={form.buy_rate}
              onChange={(e) => setForm((prev) => ({ ...prev, buy_rate: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs text-white/50">Fee %</label>
            <input
              className="input"
              value={form.fee_pct}
              onChange={(e) => setForm((prev) => ({ ...prev, fee_pct: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs text-white/50">Fee flat</label>
            <input
              className="input"
              value={form.fee_flat}
              onChange={(e) => setForm((prev) => ({ ...prev, fee_flat: e.target.value }))}
            />
          </div>
        </div>
        <button className="btn-primary mt-4" onClick={createRate}>
          Add rate
        </button>

        <div className="mt-8 space-y-3">
          {rates.map((rate) => (
            <div key={rate.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
                <span>{rate.asset_symbol}</span>
                <span>• {rate.network}</span>
                <span>• {rate.fiat_currency}</span>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <div>
                  <label className="text-xs text-white/50">Buy rate</label>
                  <input
                    className="input"
                    value={rate.buy_rate}
                    onChange={(e) =>
                      setRates((prev) =>
                        prev.map((item) => (item.id === rate.id ? { ...item, buy_rate: Number(e.target.value) } : item))
                      )
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50">Fee %</label>
                  <input
                    className="input"
                    value={rate.fee_pct ?? ''}
                    onChange={(e) =>
                      setRates((prev) =>
                        prev.map((item) =>
                          item.id === rate.id ? { ...item, fee_pct: e.target.value ? Number(e.target.value) : null } : item
                        )
                      )
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50">Fee flat</label>
                  <input
                    className="input"
                    value={rate.fee_flat ?? ''}
                    onChange={(e) =>
                      setRates((prev) =>
                        prev.map((item) =>
                          item.id === rate.id ? { ...item, fee_flat: e.target.value ? Number(e.target.value) : null } : item
                        )
                      )
                    }
                  />
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button className="btn-secondary" onClick={() => updateRate(rate)}>
                  Save
                </button>
                <button className="btn-secondary" onClick={() => deleteRate(rate.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        {message && <p className="mt-3 text-sm text-emerald-300">{message}</p>}
      </div>
    </AdminShell>
  );
}
