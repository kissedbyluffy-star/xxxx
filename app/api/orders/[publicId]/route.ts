import { NextRequest, NextResponse } from 'next/server';
import { requireServerSupabase } from '@/lib/supabase';
import { maskPayoutDetails } from '@/lib/masks';
import { getSettings } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: { publicId: string } }) {
  const token = request.nextUrl.searchParams.get('t');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const supabase = requireServerSupabase();
  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('public_id', params.publicId)
    .maybeSingle();

  if (error || !order || order.token_secret !== token) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }

  const settings = await getSettings();
  const explorerTemplates = settings.explorer_templates ?? {};
  const explorerTemplate = explorerTemplates?.[order.network] as string | undefined;
  const explorerUrl = order.txid && explorerTemplate ? explorerTemplate.replace('{txid}', order.txid) : null;

  return NextResponse.json({
    public_id: order.public_id,
    asset_symbol: order.asset_symbol,
    network: order.network,
    amount_crypto: order.amount_crypto,
    fiat_currency: order.fiat_currency,
    payout_method: order.payout_method,
    payout_details: {
      country: order.payout_details?.country ?? '',
      details: maskPayoutDetails(order.payout_details?.details ?? {})
    },
    deposit_address: order.deposit_address,
    status: order.status,
    txid: order.txid,
    explorer_url: explorerUrl
  });
}
