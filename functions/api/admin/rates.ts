import { z } from 'zod';
import { requireAdmin } from '../../lib/admin';
import { json } from '../../lib/utils';
import type { Env } from '../../lib/admin';

const createSchema = z.object({
  asset_symbol: z.string().min(1),
  network: z.string().min(1),
  fiat_currency: z.string().min(1),
  buy_rate: z.number().positive(),
  fee_pct: z.number().nullable().optional(),
  fee_flat: z.number().nullable().optional()
});

const updateSchema = createSchema.extend({ id: z.string().min(1) });
const deleteSchema = z.object({ id: z.string().min(1) });

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const session = await requireAdmin(request, env);
  if (!session) {
    return json({ error: 'Unauthorized.' }, { status: 401 });
  }
  const { results } = await env.DB.prepare('SELECT * FROM rates ORDER BY updated_at DESC').all();
  return json(results ?? []);
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const session = await requireAdmin(request, env, { requireCsrf: true });
  if (!session) {
    return json({ error: 'Unauthorized.' }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: 'Invalid payload.' }, { status: 400 });
  }
  const now = new Date().toISOString();
  await env.DB.prepare(
    'INSERT INTO rates (id, asset_symbol, network, fiat_currency, buy_rate, fee_pct, fee_flat, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  )
    .bind(
      crypto.randomUUID(),
      parsed.data.asset_symbol,
      parsed.data.network,
      parsed.data.fiat_currency,
      parsed.data.buy_rate,
      parsed.data.fee_pct ?? null,
      parsed.data.fee_flat ?? null,
      now
    )
    .run();
  return json({ success: true });
};

export const onRequestPatch: PagesFunction<Env> = async ({ request, env }) => {
  const session = await requireAdmin(request, env, { requireCsrf: true });
  if (!session) {
    return json({ error: 'Unauthorized.' }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: 'Invalid payload.' }, { status: 400 });
  }
  const now = new Date().toISOString();
  await env.DB.prepare(
    'UPDATE rates SET asset_symbol = ?, network = ?, fiat_currency = ?, buy_rate = ?, fee_pct = ?, fee_flat = ?, updated_at = ? WHERE id = ?'
  )
    .bind(
      parsed.data.asset_symbol,
      parsed.data.network,
      parsed.data.fiat_currency,
      parsed.data.buy_rate,
      parsed.data.fee_pct ?? null,
      parsed.data.fee_flat ?? null,
      now,
      parsed.data.id
    )
    .run();
  return json({ success: true });
};

export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
  const session = await requireAdmin(request, env, { requireCsrf: true });
  if (!session) {
    return json({ error: 'Unauthorized.' }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: 'Invalid payload.' }, { status: 400 });
  }
  await env.DB.prepare('DELETE FROM rates WHERE id = ?').bind(parsed.data.id).run();
  return json({ success: true });
};
