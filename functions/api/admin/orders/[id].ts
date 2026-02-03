import { z } from 'zod';
import { requireAdmin } from '../../../lib/admin';
import { json } from '../../../lib/utils';
import { getSettings } from '../../../lib/settings';
import type { Env } from '../../../lib/admin';

const updateSchema = z.object({
  status: z.string().min(1),
  confirmations_current: z.number().int().nonnegative(),
  payout_reference: z.string().nullable().optional(),
  admin_note: z.string().nullable().optional()
});

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  const session = await requireAdmin(request, env);
  if (!session) {
    return json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const id = params.id as string;
  const order = await env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(id).first();
  if (!order) {
    return json({ error: 'Order not found.' }, { status: 404 });
  }

  const settings = await getSettings(env);
  const explorerTemplates = settings.explorer_templates ?? {};
  const explorerTemplate = explorerTemplates?.[order.network as string] as string | undefined;
  const explorerUrl = order.txid && explorerTemplate ? explorerTemplate.replace('{txid}', order.txid as string) : null;

  return json({ ...order, explorer_url: explorerUrl });
};

export const onRequestPatch: PagesFunction<Env> = async ({ request, env, params }) => {
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
    'UPDATE orders SET status = ?, confirmations_current = ?, payout_reference = ?, admin_note = ?, updated_at = ? WHERE id = ?'
  )
    .bind(
      parsed.data.status,
      parsed.data.confirmations_current,
      parsed.data.payout_reference ?? null,
      parsed.data.admin_note ?? null,
      now,
      params.id
    )
    .run();

  return json({ success: true });
};
