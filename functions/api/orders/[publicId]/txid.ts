import { z } from 'zod';
import { json } from '../../../lib/utils';
import type { Env } from '../../../lib/admin';

const txidSchema = z.object({
  txid: z.string().min(6)
});

export const onRequestPatch: PagesFunction<Env> = async ({ request, env, params }) => {
  const token = new URL(request.url).searchParams.get('t');
  if (!token) {
    return json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const publicId = params.publicId as string;
  const order = await env.DB.prepare('SELECT id, token_secret, status FROM orders WHERE public_id = ?').bind(publicId).first();
  if (!order || order.token_secret !== token) {
    return json({ error: 'Order not found.' }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = txidSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: 'Invalid payload.' }, { status: 400 });
  }

  const now = new Date().toISOString();
  await env.DB.prepare('UPDATE orders SET txid = ?, status = ?, updated_at = ? WHERE id = ?')
    .bind(parsed.data.txid, 'detecting', now, order.id)
    .run();

  return json({ success: true });
};
