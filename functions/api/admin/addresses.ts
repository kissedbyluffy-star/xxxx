import { z } from 'zod';
import { requireAdmin } from '../../lib/admin';
import { json } from '../../lib/utils';
import type { Env } from '../../lib/admin';

const createSchema = z.object({
  network: z.string().min(1),
  address: z.string().min(5)
});

const bulkSchema = z.object({
  network: z.string().min(1),
  addresses: z.array(z.string().min(5))
});

const deleteSchema = z.object({ id: z.string().min(1) });

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const session = await requireAdmin(request, env);
  if (!session) {
    return json({ error: 'Unauthorized.' }, { status: 401 });
  }
  const { results } = await env.DB.prepare('SELECT * FROM addresses ORDER BY created_at DESC').all();
  return json(results ?? []);
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const session = await requireAdmin(request, env, { requireCsrf: true });
  if (!session) {
    return json({ error: 'Unauthorized.' }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const parsedSingle = createSchema.safeParse(body);
  if (parsedSingle.success) {
    await env.DB.prepare(
      'INSERT OR IGNORE INTO addresses (id, network, address, status, created_at) VALUES (?, ?, ?, ?, ?)'
    )
      .bind(crypto.randomUUID(), parsedSingle.data.network, parsedSingle.data.address, 'unused', new Date().toISOString())
      .run();
    return json({ success: true });
  }
  const parsedBulk = bulkSchema.safeParse(body);
  if (!parsedBulk.success) {
    return json({ error: 'Invalid payload.' }, { status: 400 });
  }
  const stmt = env.DB.prepare(
    'INSERT OR IGNORE INTO addresses (id, network, address, status, created_at) VALUES (?, ?, ?, ?, ?)'
  );
  const now = new Date().toISOString();
  const batch = parsedBulk.data.addresses.map((addr) =>
    stmt.bind(crypto.randomUUID(), parsedBulk.data.network, addr, 'unused', now)
  );
  await env.DB.batch(batch);
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
  await env.DB.prepare('DELETE FROM addresses WHERE id = ?').bind(parsed.data.id).run();
  return json({ success: true });
};
