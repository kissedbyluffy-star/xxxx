import { useEffect, useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import AdminShell from './AdminShell';

const NETWORKS = ['BTC', 'ERC20', 'BEP20', 'TRC20'];

type AddressRow = {
  id: string;
  network: string;
  address: string;
  status: string;
  assigned_order_id: string | null;
  created_at: string;
};

export default function AdminAddresses() {
  const { session } = useAdmin();
  const [rows, setRows] = useState<AddressRow[]>([]);
  const [network, setNetwork] = useState('BTC');
  const [address, setAddress] = useState('');
  const [bulk, setBulk] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const fetchAddresses = async () => {
    if (!session) return;
    const res = await fetch('/api/admin/addresses', { credentials: 'include' });
    if (!res.ok) return;
    const data = await res.json();
    setRows(data ?? []);
  };

  useEffect(() => {
    fetchAddresses();
  }, [session]);

  const addSingle = async () => {
    if (!session || !address) return;
    const res = await fetch('/api/admin/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-csrf-token': session.csrfToken },
      credentials: 'include',
      body: JSON.stringify({ network, address })
    });
    if (!res.ok) {
      setMessage('Failed to add address.');
      return;
    }
    setAddress('');
    setMessage('Address added.');
    fetchAddresses();
  };

  const addBulk = async () => {
    if (!session || !bulk.trim()) return;
    const addresses = bulk
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    const res = await fetch('/api/admin/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-csrf-token': session.csrfToken },
      credentials: 'include',
      body: JSON.stringify({ network, addresses })
    });
    if (!res.ok) {
      setMessage('Failed to upload bulk addresses.');
      return;
    }
    setBulk('');
    setMessage('Addresses uploaded.');
    fetchAddresses();
  };

  const deleteAddress = async (id: string) => {
    if (!session) return;
    const res = await fetch('/api/admin/addresses', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'x-csrf-token': session.csrfToken },
      credentials: 'include',
      body: JSON.stringify({ id })
    });
    if (!res.ok) {
      setMessage('Failed to delete address.');
      return;
    }
    setMessage('Address removed.');
    fetchAddresses();
  };

  return (
    <AdminShell>
      <div className="glass rounded-2xl p-6 shadow-card">
        <h2 className="text-lg font-semibold">Address pool</h2>
        <p className="text-sm text-white/60">Upload addresses for future pool mode assignments.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs text-white/50">Network</label>
            <select className="input" value={network} onChange={(e) => setNetwork(e.target.value)}>
              {NETWORKS.map((net) => (
                <option key={net} value={net}>
                  {net}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-white/50">Single address</label>
            <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
        </div>
        <button className="btn-primary mt-4" onClick={addSingle}>
          Add address
        </button>

        <div className="mt-6">
          <label className="text-xs text-white/50">Bulk upload (one per line)</label>
          <textarea
            className="input h-32"
            value={bulk}
            onChange={(e) => setBulk(e.target.value)}
          />
          <button className="btn-secondary mt-3" onClick={addBulk}>
            Upload bulk
          </button>
        </div>

        <div className="mt-8 space-y-3">
          {rows.map((row) => (
            <div key={row.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs text-white/50">{row.network}</p>
                  <p className="text-sm font-mono text-white/80 break-all">{row.address}</p>
                  <p className="text-xs text-white/40">Status: {row.status}</p>
                </div>
                <button className="btn-secondary" onClick={() => deleteAddress(row.id)}>
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
