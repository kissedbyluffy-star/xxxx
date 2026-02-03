import { z } from 'zod';
import { json, getClientIp, randomHex } from '../lib/utils';
import { rateLimit } from '../lib/rateLimit';
import { getSettings } from '../lib/settings';
import type { Env } from '../lib/admin';

const createOrderSchema = z.object({
  asset_symbol: z.string().min(1),
  network: z.string().min(1),
  amount_crypto: z.number().positive(),
  fiat_currency: z.string().min(1),
  payout_method: z.string().min(1)
});

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const ip = getClientIp(request);
  const limit = rateLimit(ip);
  if (!limit.allowed) {
    return json({ error: 'Too many requests. Please wait.' }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: 'Invalid request.' }, { status: 400 });
  }

  const { asset_symbol, network, amount_crypto, fiat_currency, payout_method } = parsed.data;

  const rate = await env.DB.prepare(
    'SELECT buy_rate, fee_pct, fee_flat FROM rates WHERE asset_symbol = ? AND network = ? AND fiat_currency = ? ORDER BY updated_at DESC LIMIT 1'
  )
    .bind(asset_symbol, network, fiat_currency)
    .first();

  if (!rate) {
    return json({ error: 'Rate missing for this pair.' }, { status: 400 });
  }

  const settings = await getSettings(env);
  const depositMode = settings.deposit_mode ?? 'fixed';
  const fallbackToFixed = settings.fallback_to_fixed ?? true;
  const fixedAddresses = settings.fixed_addresses ?? {};

  let depositAddress = fixedAddresses?.[network] ?? null;
  let depositSource: 'fixed' | 'pool' = 'fixed';
  let depositPoolId: string | null = null;

  if (depositMode === 'pool') {
    const poolAddress = await env.DB.prepare(
      'SELECT * FROM addresses WHERE network = ? AND status = ? ORDER BY created_at ASC LIMIT 1'
    )
      .bind(network, 'unused')
      .first();

    if (poolAddress) {
      depositAddress = poolAddress.address as string;
      depositSource = 'pool';
      depositPoolId = poolAddress.id as string;
    } else if (!fallbackToFixed) {
      return json({ error: 'No deposit addresses available.' }, { status: 400 });
    }
  }

  if (!depositAddress) {
    return json({ error: 'Deposit address missing.' }, { status: 400 });
  }

  const publicId = randomHex(4);
  const token = randomHex(16);
  const orderId = crypto.randomUUID();
  const now = new Date().toISOString();

  await env.DB.prepare(
    `INSERT INTO orders (
      id, public_id, token_secret, created_at, updated_at, asset_symbol, network, amount_crypto,
      fiat_currency, payout_method, payout_details_json, deposit_address, deposit_source,
      deposit_address_pool_id, txid, status, confirmations_required, confirmations_current, payout_reference, admin_note, ip_address
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      orderId,
      publicId,
      token,
      now,
      now,
      asset_symbol,
      network,
      amount_crypto,
      fiat_currency,
      payout_method,
      JSON.stringify({ country: '', details: {} }),
      depositAddress,
      depositSource,
      depositPoolId,
      null,
      'pending_deposit',
      1,
      0,
      null,
      null,
      ip
    )
    .run();

  if (depositSource === 'pool' && depositPoolId) {
    await env.DB.prepare('UPDATE addresses SET status = ?, assigned_order_id = ? WHERE id = ?')
      .bind('assigned', orderId, depositPoolId)
      .run();
  }

  return json({ publicId, token });
};
