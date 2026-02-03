'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

type Address = {
  id: string;
  network: string;
  address: string;
  status: string;
};

export default function AdminAddressesPage() {
  const [network, setNetwork] = useState('BTC');
  const [bulk, setBulk] = useState('');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const fetchAddresses = async () => {
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;
    const res = await fetch('/api/admin/addresses', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return;
    const dataJson = await res.json();
    setAddresses(dataJson ?? []);
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const upload = async () => {
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;
    const addressList = bulk
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    const res = await fetch('/api/admin/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ network, addresses: addressList })
    });
    if (!res.ok) {
      setMessage('Upload failed.');
      return;
    }
    setMessage('Addresses uploaded.');
    setBulk('');
    fetchAddresses();
  };

  return (
    <div className="glass rounded-2xl p-6 shadow-card">
      <h2 className="text-lg font-semibold">Address Pool</h2>
      <p className="text-sm text-white/60">Upload deposit addresses for future pool mode.</p>

      <div className="mt-4 grid gap-3">
        <select className="input" value={network} onChange={(e) => setNetwork(e.target.value)}>
          <option value="BTC">BTC</option>
          <option value="ERC20">ERC20</option>
          <option value="BEP20">BEP20</option>
          <option value="TRC20">TRC20</option>
        </select>
        <textarea
          className="input min-h-[120px]"
          placeholder="One address per line"
          value={bulk}
          onChange={(e) => setBulk(e.target.value)}
        />
        <button className="btn-primary" onClick={upload}>
          Upload addresses
        </button>
        {message && <p className="text-sm text-emerald-300">{message}</p>}
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm text-white/70">
          <thead className="text-left text-xs text-white/40">
            <tr>
              <th className="py-2">Network</th>
              <th>Address</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {addresses.map((item) => (
              <tr key={item.id} className="border-t border-white/10">
                <td className="py-3">{item.network}</td>
                <td className="font-mono text-xs">{item.address}</td>
                <td>{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
