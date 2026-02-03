import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { requireServerSupabase } from '@/lib/supabase';
import { rateSchema } from '@/lib/validators';

export async function GET(request: NextRequest) {
  const isPublic = request.headers.get('x-public-rate') === 'true';
  const supabase = requireServerSupabase();

  if (isPublic) {
    const asset = request.nextUrl.searchParams.get('asset');
    const network = request.nextUrl.searchParams.get('network');
    const fiat = request.nextUrl.searchParams.get('fiat');
    if (!asset || !network || !fiat) {
      return NextResponse.json({ error: 'Missing params.' }, { status: 400 });
    }
    const { data } = await supabase
      .from('rates')
      .select('*')
      .eq('asset_symbol', asset)
      .eq('network', network)
      .eq('fiat_currency', fiat)
      .maybeSingle();
    if (!data) {
      return NextResponse.json({ error: 'Rate not found.' }, { status: 404 });
    }
    return NextResponse.json(data);
  }

  const user = await requireAdminAuth(request.headers.get('authorization'));
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { data, error } = await supabase.from('rates').select('*').order('updated_at', { ascending: false });
  if (error) {
    return NextResponse.json({ error: 'Failed to fetch rates.' }, { status: 500 });
  }
  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const user = await requireAdminAuth(request.headers.get('authorization'));
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = rateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid rate payload.' }, { status: 400 });
  }

  const supabase = requireServerSupabase();
  const { error } = await supabase.from('rates').upsert({
    ...parsed.data,
    updated_at: new Date().toISOString()
  });

  if (error) {
    return NextResponse.json({ error: 'Failed to save rate.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const user = await requireAdminAuth(request.headers.get('authorization'));
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }
  const id = request.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id.' }, { status: 400 });
  }
  const supabase = requireServerSupabase();
  const { error } = await supabase.from('rates').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ error: 'Failed to delete rate.' }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
