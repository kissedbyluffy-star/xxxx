import { json } from '../../lib/utils';
import { maskPayoutDetails } from '../../lib/masks';
import { getSettings } from '../../lib/settings';
import type { Env } from '../../lib/admin';

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  const token = new URL(request.url).searchParams.get('t');
  if (!token) {
    return json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const publicId = params.publicId as string;
  const order = await env.DB.prepare('SELECT * FROM orders WHERE public_id = ?').bind(publicId).first();

  if (!order || order.token_secret !== token) {
    return json({ error: 'Order not found.' }, { status: 404 });
  }

  const settings = await getSettings(env);
  const explorerTemplates = settings.explorer_templates ?? {};
  const explorerTemplate = explorerTemplates?.[order.network as string] as string | undefined;
  const explorerUrl = order.txid && explorerTemplate ? explorerTemplate.replace('{txid}', order.txid as string) : null;

  let payoutDetails: any = null;
  if (order.payout_details_json) {
    try {
      const parsed = JSON.parse(order.payout_details_json as string);
      payoutDetails = {
        country: parsed.country ?? '',
        details: maskPayoutDetails(parsed.details ?? {})
      };
    } catch {
      payoutDetails = { country: '', details: {} };
    }
  }

  return json({
    public_id: order.public_id,
    asset_symbol: order.asset_symbol,
    network: order.network,
    amount_crypto: order.amount_crypto,
    fiat_currency: order.fiat_currency,
    payout_method: order.payout_method,
    payout_details: payoutDetails,
    deposit_address: order.deposit_address,
    status: order.status,
    txid: order.txid,
    explorer_url: explorerUrl
  });
};
