import { json } from '../lib/utils';
import type { Env } from '../lib/admin';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const asset = url.searchParams.get('asset');
  const network = url.searchParams.get('network');
  const fiat = url.searchParams.get('fiat');

  if (!asset || !network || !fiat) {
    return json({ error: 'Missing parameters.' }, { status: 400 });
  }

  const rate = await env.DB.prepare(
    'SELECT id, asset_symbol, network, fiat_currency, buy_rate, fee_pct, fee_flat, updated_at FROM rates WHERE asset_symbol = ? AND network = ? AND fiat_currency = ? ORDER BY updated_at DESC LIMIT 1'
  )
    .bind(asset, network, fiat)
    .first();

  if (!rate) {
    return json({ error: 'Rate unavailable.' }, { status: 404 });
  }

  return json(rate);
};
