import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { getSettings } from '@/lib/db';
import { requireServerSupabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const user = await requireAdminAuth(request.headers.get('authorization'));
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const supabase = requireServerSupabase();
  const orderId = request.nextUrl.searchParams.get('order_id');

  if (orderId) {
    const { data: order, error } = await supabase.from('orders').select('*').eq('id', orderId).maybeSingle();
    if (error || !order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }
    const settings = await getSettings();
    const explorerTemplates = settings.explorer_templates ?? {};
    const explorerTemplate = explorerTemplates?.[order.network] as string | undefined;
    const explorerUrl = order.txid && explorerTemplate ? explorerTemplate.replace('{txid}', order.txid) : null;
    return NextResponse.json({ ...order, explorer_url: explorerUrl });
  }

  const status = request.nextUrl.searchParams.get('status');
  const network = request.nextUrl.searchParams.get('network');
  const search = request.nextUrl.searchParams.get('search');

  let query = supabase
    .from('orders')
    .select('id, public_id, status, asset_symbol, network, amount_crypto, fiat_currency, txid')
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);
  if (network) query = query.eq('network', network);
  if (search) query = query.ilike('public_id', `%${search}%`);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: 'Failed to fetch orders.' }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
