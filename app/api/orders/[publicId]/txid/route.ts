import { NextRequest, NextResponse } from 'next/server';
import { requireServerSupabase } from '@/lib/supabase';
import { txidSchema } from '@/lib/validators';

export async function PATCH(request: NextRequest, { params }: { params: { publicId: string } }) {
  const token = request.nextUrl.searchParams.get('t');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = txidSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid TXID.' }, { status: 400 });
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

  const { error: updateError } = await supabase
    .from('orders')
    .update({ txid: parsed.data.txid, status: 'detecting' })
    .eq('id', order.id);

  if (updateError) {
    return NextResponse.json({ error: 'Unable to update TXID.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
