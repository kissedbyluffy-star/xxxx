'use client';

import { useEffect, useMemo, useState } from 'react';
import { ASSETS, NETWORKS, FIAT_CURRENCIES, PAYOUT_METHODS } from '@/lib/constants';

const formatMoney = (value: number, currency: string) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);

export default function ExchangeCard() {
  const [asset, setAsset] = useState(ASSETS[0]);
  const [network, setNetwork] = useState(NETWORKS[0]);
  const [amount, setAmount] = useState('');
  const [fiat, setFiat] = useState(FIAT_CURRENCIES[0]);
  const [method, setMethod] = useState(PAYOUT_METHODS[0]);
  const [rate, setRate] = useState<number | null>(null);
  const [feePct, setFeePct] = useState<number | null>(null);
  const [feeFlat, setFeeFlat] = useState<number | null>(null);
  const [loadingRate, setLoadingRate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchRate = async () => {
      setLoadingRate(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/admin/rates?asset=${asset}&network=${network}&fiat=${fiat}`,
          { headers: { 'x-public-rate': 'true' } }
        );
        if (!res.ok) {
          throw new Error('Rate unavailable');
        }
        const data = await res.json();
        if (!active) return;
        setRate(data?.buy_rate ?? null);
        setFeePct(data?.fee_pct ?? null);
        setFeeFlat(data?.fee_flat ?? null);
      } catch (err) {
        if (!active) return;
        setRate(null);
        setFeePct(null);
        setFeeFlat(null);
        setError('Rate missing. Please try again later.');
      } finally {
        if (active) setLoadingRate(false);
      }
    };
    fetchRate();
    return () => {
      active = false;
    };
  }, [asset, network, fiat]);

  const estimated = useMemo(() => {
    const amountNum = Number(amount);
    if (!rate || !amountNum || Number.isNaN(amountNum)) return null;
    const gross = amountNum * rate;
    const fee = (feePct ?? 0) * gross + (feeFlat ?? 0);
    return Math.max(gross - fee, 0);
  }, [amount, rate, feePct, feeFlat]);

  const submit = async () => {
    setError(null);
    const amountNum = Number(amount);
    if (!rate) {
      setError('Rate missing. Please try another pair.');
      return;
    }
    if (!amountNum || Number.isNaN(amountNum)) {
      setError('Enter a valid amount.');
      return;
    }
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        asset_symbol: asset,
        network,
        amount_crypto: amountNum,
        fiat_currency: fiat,
        payout_method: method
      })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? 'Unable to create order');
      return;
    }
    const data = await res.json();
    window.location.href = `/order/${data.publicId}?t=${data.token}`;
  };

  return (
    <div className="glass rounded-2xl p-6 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Start an exchange</h2>
          <p className="text-xs text-white/60">Automated status updates. Manual payout verified by experts.</p>
        </div>
        {loadingRate ? (
          <span className="text-xs text-white/50">Loading rates...</span>
        ) : rate ? (
          <span className="text-xs text-emerald-300">Live rate loaded</span>
        ) : (
          <span className="text-xs text-rose-300">Rate missing</span>
        )}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs text-white/60">Asset</label>
          <select className="input" value={asset} onChange={(e) => setAsset(e.target.value as typeof asset)}>
            {ASSETS.map((assetOption) => (
              <option key={assetOption} value={assetOption}>
                {assetOption}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-white/60">Network</label>
          <select className="input" value={network} onChange={(e) => setNetwork(e.target.value as typeof network)}>
            {NETWORKS.map((networkOption) => (
              <option key={networkOption} value={networkOption}>
                {networkOption}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-white/60">Amount (crypto)</label>
          <input
            className="input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="text-xs text-white/60">Fiat currency</label>
          <select className="input" value={fiat} onChange={(e) => setFiat(e.target.value as typeof fiat)}>
            {FIAT_CURRENCIES.map((fiatOption) => (
              <option key={fiatOption} value={fiatOption}>
                {fiatOption}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-white/60">Payout method</label>
          <select className="input" value={method} onChange={(e) => setMethod(e.target.value as typeof method)}>
            {PAYOUT_METHODS.map((methodOption) => (
              <option key={methodOption} value={methodOption}>
                {methodOption}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col justify-end rounded-xl border border-white/10 bg-white/5 p-3">
          <span className="text-xs text-white/60">Estimated payout</span>
          <span className="text-lg font-semibold">
            {estimated ? formatMoney(estimated, fiat) : '--'}
          </span>
          <span className="text-[11px] text-white/40">Fees auto-applied</span>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}

      <button
        className="btn-primary mt-6 w-full"
        disabled={!rate || loadingRate}
        onClick={submit}
      >
        Exchange Now
      </button>
    </div>
  );
}
