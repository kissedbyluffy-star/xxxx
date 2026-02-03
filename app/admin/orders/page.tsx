'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

type Order = {
  id: string;
  public_id: string;
  status: string;
  asset_symbol: string;
  network: string;
  amount_crypto: number;
  fiat_currency: string;
  txid: string | null;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState('');
  const [network, setNetwork] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (network) params.set('network', network);
    if (search) params.set('search', search);
    const res = await fetch(`/api/admin/orders?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      setLoading(false);
      return;
    }
    const dataJson = await res.json();
    setOrders(dataJson ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [status, network]);

  const filtered = useMemo(() => {
    if (!search) return orders;
    return orders.filter((order) =>
      `${order.public_id} ${order.txid ?? ''}`.toLowerCase().includes(search.toLowerCase())
    );
  }, [orders, search]);

  return (
    <div className="glass rounded-2xl p-6 shadow-card">
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold">Orders</h2>
          <p className="text-sm text-white/60">Track incoming deposits and payout progress.</p>
        </div>
        <div className="ml-auto flex flex-wrap gap-3">
          <input
            className="input"
            placeholder="Search public ID or TXID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All status</option>
            <option value="pending_deposit">Pending deposit</option>
            <option value="detecting">Detecting</option>
            <option value="confirming">Confirming</option>
            <option value="payout_processing">Processing payout</option>
            <option value="completed">Completed</option>
            <option value="hold">Hold</option>
            <option value="rejected">Rejected</option>
          </select>
          <select className="input" value={network} onChange={(e) => setNetwork(e.target.value)}>
            <option value="">All networks</option>
            <option value="BTC">BTC</option>
            <option value="ERC20">ERC20</option>
            <option value="BEP20">BEP20</option>
            <option value="TRC20">TRC20</option>
          </select>
          <button className="btn-secondary" onClick={fetchOrders}>
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-white/60">Loading orders...</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm text-white/70">
            <thead className="text-left text-xs text-white/40">
              <tr>
                <th className="py-2">Public ID</th>
                <th>Asset</th>
                <th>Network</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Fiat</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id} className="border-t border-white/10">
                  <td className="py-3 font-mono text-white/90">
                    <a className="text-blue-300 hover:text-blue-200" href={`/admin/orders/${order.id}`}>
                      {order.public_id}
                    </a>
                  </td>
                  <td>{order.asset_symbol}</td>
                  <td>{order.network}</td>
                  <td>{order.status}</td>
                  <td>{order.amount_crypto}</td>
                  <td>{order.fiat_currency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
