import { requireAdmin } from '../../lib/admin';
import { json } from '../../lib/utils';
import { getSettings, upsertSettings } from '../../lib/settings';
import type { Env } from '../../lib/admin';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const session = await requireAdmin(request, env);
  if (!session) {
    return json({ error: 'Unauthorized.' }, { status: 401 });
  }
  const settings = await getSettings(env);
  return json(settings);
};

export const onRequestPatch: PagesFunction<Env> = async ({ request, env }) => {
  const session = await requireAdmin(request, env, { requireCsrf: true });
  if (!session) {
    return json({ error: 'Unauthorized.' }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return json({ error: 'Invalid payload.' }, { status: 400 });
  }
  await upsertSettings(env, body as Record<string, unknown>);
  return json({ success: true });
};
