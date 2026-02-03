import { requireAdmin } from '../../lib/admin';
import { json } from '../../lib/utils';
import type { Env } from '../../lib/admin';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const session = await requireAdmin(request, env);
  if (!session) {
    return json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  const network = url.searchParams.get('network');
  const search = url.searchParams.get('search');

  let query = 'SELECT id, public_id, status, asset_symbol, network, amount_crypto, fiat_currency, txid FROM orders';
  const conditions: string[] = [];
  const bindings: any[] = [];

  if (status) {
    conditions.push('status = ?');
    bindings.push(status);
  }
  if (network) {
    conditions.push('network = ?');
    bindings.push(network);
  }
  if (search) {
    conditions.push('(public_id LIKE ? OR txid LIKE ?)');
    bindings.push(`%${search}%`, `%${search}%`);
  }

  if (conditions.length) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }
  query += ' ORDER BY created_at DESC';

  const { results } = await env.DB.prepare(query).bind(...bindings).all();
  return json(results ?? []);
};
