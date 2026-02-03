import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAdmin } from '@/context/AdminContext';
import AdminShell from './AdminShell';

type OrderDetail = {
  id: string;
  public_id: string;
  status: string;
  asset_symbol: string;
  network: string;
  amount_crypto: number;
  fiat_currency: string;
  payout_method: string;
  payout_details_json: string | null;
  txid: string | null;
  explorer_url: string | null;
  confirmations_current: number;
  payout_reference: string | null;
  admin_note: string | null;
};

export default function AdminOrderDetail() {
  const { id } = useParams();
  const { session } = useAdmin();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [status, setStatus] = useState('');
  const [confirmations, setConfirmations] = useState(0);
  const [payoutReference, setPayoutReference] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const payoutDetails = useMemo(() => {
    if (!order?.payout_details_json) return {};
    try {
      return JSON.parse(order.payout_details_json);
    } catch {
      return {};
    }
  }, [order]);

  const fetchOrder = async () => {
    if (!id || !session) return;
    const res = await fetch(`/api/admin/orders/${id}`, { credentials: 'include' });
    if (!res.ok) return;
    const dataJson = await res.json();
    setOrder(dataJson);
    setStatus(dataJson.status);
    setConfirmations(dataJson.confirmations_current ?? 0);
    setPayoutReference(dataJson.payout_reference ?? '');
    setAdminNote(dataJson.admin_note ?? '');
  };

  useEffect(() => {
    fetchOrder();
  }, [session, id]);

  const updateOrder = async () => {
    if (!id || !session) return;
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-csrf-token': session.csrfToken },
      credentials: 'include',
      body: JSON.stringify({
        status,
        confirmations_current: confirmations,
        payout_reference: payoutReference || null,
        admin_note: adminNote || null
      })
    });
    if (!res.ok) {
      setMessage('Failed to update order.');
      return;
    }
    setMessage('Order updated.');
    fetchOrder();
  };

  if (!order) {
    return (
      <AdminShell>
        <div className="text-sm text-white/60">Loading order...</div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="glass rounded-2xl p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Order {order.public_id}</h2>
            <p className="text-sm text-white/60">
              {order.asset_symbol} • {order.network} • {order.amount_crypto}
            </p>
          </div>
          {order.explorer_url && order.txid && (
            <a className="btn-secondary" href={order.explorer_url} target="_blank" rel="noreferrer">
              View explorer
            </a>
          )}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-sm font-semibold">Payout details</h3>
            <pre className="mt-2 whitespace-pre-wrap text-xs text-white/60">
              {JSON.stringify(payoutDetails, null, 2)}
            </pre>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-sm font-semibold">Transaction</h3>
            <p className="mt-2 text-xs text-white/60">TXID: {order.txid ?? 'Not submitted'}</p>
            <p className="mt-1 text-xs text-white/60">Status: {order.status}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs text-white/50">Status</label>
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="pending_deposit">Pending deposit</option>
              <option value="detecting">Detecting</option>
              <option value="confirming">Confirming</option>
              <option value="payout_processing">Processing payout</option>
              <option value="completed">Completed</option>
              <option value="hold">Hold</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-white/50">Confirmations</label>
            <input
              className="input"
              type="number"
              value={confirmations}
              onChange={(e) => setConfirmations(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="text-xs text-white/50">Payout reference</label>
            <input className="input" value={payoutReference} onChange={(e) => setPayoutReference(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-white/50">Admin note</label>
            <input className="input" value={adminNote} onChange={(e) => setAdminNote(e.target.value)} />
          </div>
        </div>

        <button className="btn-primary mt-4" onClick={updateOrder}>
          Save updates
        </button>
        {message && <p className="mt-2 text-sm text-emerald-300">{message}</p>}
      </div>
    </AdminShell>
  );
}
