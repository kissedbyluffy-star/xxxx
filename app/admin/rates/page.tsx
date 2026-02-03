'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

type Rate = {
  id: string;
  asset_symbol: string;
  network: string;
  fiat_currency: string;
  buy_rate: number;
  fee_pct: number | null;
  fee_flat: number | null;
};

export default function AdminRatesPage() {
  const [rates, setRates] = useState<Rate[]>([]);
  const [form, setForm] = useState({
    asset_symbol: 'BTC',
    network: 'BTC',
    fiat_currency: 'USD',
    buy_rate: '',
    fee_pct: '',
    fee_flat: ''
  });
  const [message, setMessage] = useState<string | null>(null);

  const fetchRates = async () => {
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;
    const res = await fetch('/api/admin/rates', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return;
    const dataJson = await res.json();
    setRates(dataJson ?? []);
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const saveRate = async () => {
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;
    const res = await fetch('/api/admin/rates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        ...form,
        buy_rate: Number(form.buy_rate),
        fee_pct: form.fee_pct ? Number(form.fee_pct) : null,
        fee_flat: form.fee_flat ? Number(form.fee_flat) : null
      })
    });
    if (!res.ok) {
      setMessage('Failed to save rate.');
      return;
    }
    setMessage('Rate saved.');
    setForm({ ...form, buy_rate: '', fee_pct: '', fee_flat: '' });
    fetchRates();
  };

  const deleteRate = async (id: string) => {
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;
    await fetch(`/api/admin/rates?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchRates();
  };

  return (
    <div className="glass rounded-2xl p-6 shadow-card">
      <h2 className="text-lg font-semibold">Rates</h2>
      <p className="text-sm text-white/60">Maintain payout rates per asset, network, and fiat.</p>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <select className="input" value={form.asset_symbol} onChange={(e) => setForm((prev) => ({ ...prev, asset_symbol: e.target.value }))}>
          <option value="BTC">BTC</option>
          <option value="ETH">ETH</option>
          <option value="USDT">USDT</option>
        </select>
        <select className="input" value={form.network} onChange={(e) => setForm((prev) => ({ ...prev, network: e.target.value }))}>
          <option value="BTC">BTC</option>
          <option value="ERC20">ERC20</option>
          <option value="BEP20">BEP20</option>
          <option value="TRC20">TRC20</option>
        </select>
        <select className="input" value={form.fiat_currency} onChange={(e) => setForm((prev) => ({ ...prev, fiat_currency: e.target.value }))}>
          <option value="USD">USD</option>
          <option value="INR">INR</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
        </select>
        <input
          className="input"
          placeholder="Buy rate"
          value={form.buy_rate}
          onChange={(e) => setForm((prev) => ({ ...prev, buy_rate: e.target.value }))}
        />
        <input
          className="input"
          placeholder="Fee % (optional)"
          value={form.fee_pct}
          onChange={(e) => setForm((prev) => ({ ...prev, fee_pct: e.target.value }))}
        />
        <input
          className="input"
          placeholder="Fee flat (optional)"
          value={form.fee_flat}
          onChange={(e) => setForm((prev) => ({ ...prev, fee_flat: e.target.value }))}
        />
      </div>

      <button className="btn-primary mt-4" onClick={saveRate}>
        Save rate
      </button>
      {message && <p className="mt-2 text-sm text-emerald-300">{message}</p>}

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm text-white/70">
          <thead className="text-left text-xs text-white/40">
            <tr>
              <th className="py-2">Asset</th>
              <th>Network</th>
              <th>Fiat</th>
              <th>Buy rate</th>
              <th>Fee %</th>
              <th>Fee flat</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rates.map((rate) => (
              <tr key={rate.id} className="border-t border-white/10">
                <td className="py-3">{rate.asset_symbol}</td>
                <td>{rate.network}</td>
                <td>{rate.fiat_currency}</td>
                <td>{rate.buy_rate}</td>
                <td>{rate.fee_pct ?? '-'}</td>
                <td>{rate.fee_flat ?? '-'}</td>
                <td>
                  <button className="btn-secondary" onClick={() => deleteRate(rate.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
