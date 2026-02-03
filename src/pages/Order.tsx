import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import QRCode from 'qrcode.react';
import StatusTimeline from '@/components/StatusTimeline';
import { STATUS_LABELS } from '@/lib/constants';

type Order = {
  public_id: string;
  asset_symbol: string;
  network: string;
  amount_crypto: number;
  fiat_currency: string;
  payout_method: string;
  payout_details: Record<string, any> | null;
  deposit_address: string;
  status: string;
  txid: string | null;
  explorer_url: string | null;
};

export default function OrderPage() {
  const { publicId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('t');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [txid, setTxid] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('');
  const [payoutDetails, setPayoutDetails] = useState<Record<string, string>>({});
  const [country, setCountry] = useState('');

  const fetchOrder = async () => {
    if (!token || !publicId) return;
    setLoading(true);
    const res = await fetch(`/api/orders/${publicId}?t=${token}`);
    if (!res.ok) {
      setError('Order not found.');
      setLoading(false);
      return;
    }
    const data = await res.json();
    setOrder(data);
    setPayoutMethod(data.payout_method);
    setCountry(data.payout_details?.country ?? '');
    setPayoutDetails(data.payout_details?.details ?? {});
    setTxid(data.txid ?? '');
    setLoading(false);
  };

  useEffect(() => {
    fetchOrder();
  }, [token, publicId]);

  const copyText = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    setMessage(`${label} copied`);
    setTimeout(() => setMessage(null), 2000);
  };

  const updatePayout = async () => {
    if (!token || !publicId) return;
    setError(null);
    const res = await fetch(`/api/orders/${publicId}/payout?t=${token}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payout_method: payoutMethod, country, details: payoutDetails })
      }
    );
    if (!res.ok) {
      setError('Unable to save payout details.');
      return;
    }
    setMessage('Payout details saved');
    setTimeout(() => setMessage(null), 2000);
    fetchOrder();
  };

  const submitTxid = async () => {
    if (!token || !publicId) return;
    setError(null);
    const res = await fetch(`/api/orders/${publicId}/txid?t=${token}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ txid })
    });
    if (!res.ok) {
      setError('Unable to submit TXID.');
      return;
    }
    setMessage('Transaction submitted');
    setTimeout(() => setMessage(null), 2000);
    fetchOrder();
  };

  const payoutFields = useMemo(() => {
    if (payoutMethod === 'UPI') {
      return [
        { key: 'name', label: 'Name' },
        { key: 'upi_id', label: 'UPI ID' }
      ];
    }
    if (payoutMethod === 'Bank Transfer') {
      return [
        { key: 'name', label: 'Account name' },
        { key: 'bank', label: 'Bank name' },
        { key: 'account', label: 'Account number' },
        { key: 'ifsc', label: 'IFSC (India)' },
        { key: 'swift', label: 'SWIFT/BIC' },
        { key: 'iban', label: 'IBAN (optional)' },
        { key: 'notes', label: 'Notes (optional)' }
      ];
    }
    return [{ key: 'notes', label: 'Payout instructions' }];
  }, [payoutMethod]);

  if (loading) {
    return (
      <main className="min-h-screen bg-midnight px-6 py-16">
        <div className="mx-auto max-w-3xl text-white/60">Loading order...</div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-midnight px-6 py-16">
        <div className="mx-auto max-w-3xl text-rose-300">Order not found.</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-midnight px-6 py-16">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="glass rounded-2xl p-6 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs text-white/50">Order #{order.public_id}</p>
              <h1 className="text-2xl font-semibold">Send {order.asset_symbol} via {order.network}</h1>
              <p className="text-sm text-white/60">Status: {STATUS_LABELS[order.status] ?? order.status}</p>
            </div>
            {order.explorer_url && order.txid && (
              <a className="btn-secondary" href={order.explorer_url} target="_blank" rel="noreferrer">
                View on explorer
              </a>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="space-y-6">
            <section className="glass rounded-2xl p-6 shadow-card">
              <h2 className="text-lg font-semibold">Send Crypto</h2>
              <p className="mt-2 text-sm text-white/60">Send only on selected network.</p>
              <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <QRCode value={order.deposit_address} size={120} bgColor="#0B0F14" fgColor="#ffffff" />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-xs text-white/50">Deposit address</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-mono text-white/80 break-all">{order.deposit_address}</p>
                      <button className="btn-secondary" onClick={() => copyText(order.deposit_address, 'Address')}>
                        Copy
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-white/50">Amount</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-mono text-white/80">{order.amount_crypto}</p>
                      <button className="btn-secondary" onClick={() => copyText(String(order.amount_crypto), 'Amount')}>
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="glass rounded-2xl p-6 shadow-card">
              <h2 className="text-lg font-semibold">Payout details</h2>
              <p className="text-sm text-white/60">You can edit payout information until the order is completed or rejected.</p>
              <div className="mt-4 grid gap-4">
                <div>
                  <label className="text-xs text-white/50">Country</label>
                  <input className="input" value={country} onChange={(e) => setCountry(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-white/50">Payout method</label>
                  <select className="input" value={payoutMethod} onChange={(e) => setPayoutMethod(e.target.value)}>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                {payoutFields.map((field) => (
                  <div key={field.key}>
                    <label className="text-xs text-white/50">{field.label}</label>
                    <input
                      className="input"
                      value={payoutDetails[field.key] ?? ''}
                      onChange={(e) =>
                        setPayoutDetails((prev) => ({
                          ...prev,
                          [field.key]: e.target.value
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
              <button className="btn-primary mt-4" onClick={updatePayout}>
                Save payout details
              </button>
            </section>

            <section className="glass rounded-2xl p-6 shadow-card">
              <h2 className="text-lg font-semibold">Submit transaction ID</h2>
              <p className="text-sm text-white/60">Paste the hash once your transfer is sent.</p>
              <input className="input mt-3" value={txid} onChange={(e) => setTxid(e.target.value)} />
              <button className="btn-primary mt-4" onClick={submitTxid}>
                Submit TXID
              </button>
            </section>
          </div>

          <aside className="glass rounded-2xl p-6 shadow-card">
            <h2 className="text-lg font-semibold">Status timeline</h2>
            <StatusTimeline status={order.status} />
            {order.status === 'hold' && (
              <div className="mt-6 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200">
                Your order is on hold. Our team will reach out if more details are required.
              </div>
            )}
            {order.status === 'rejected' && (
              <div className="mt-6 rounded-xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-200">
                This order was rejected. Please contact support.
              </div>
            )}
          </aside>
        </div>

        {message && <p className="text-sm text-emerald-300">{message}</p>}
        {error && <p className="text-sm text-rose-300">{error}</p>}
      </div>
    </main>
  );
}
