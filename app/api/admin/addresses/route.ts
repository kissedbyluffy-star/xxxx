import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { requireServerSupabase } from '@/lib/supabase';
import { addressSchema } from '@/lib/validators';

export async function GET(request: NextRequest) {
  const user = await requireAdminAuth(request.headers.get('authorization'));
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }
  const supabase = requireServerSupabase();
  const { data, error } = await supabase.from('addresses').select('*').order('created_at', { ascending: false });
  if (error) {
    return NextResponse.json({ error: 'Failed to load addresses.' }, { status: 500 });
  }
  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const user = await requireAdminAuth(request.headers.get('authorization'));
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const { network, addresses } = body ?? {};
  if (!Array.isArray(addresses) || !network) {
    return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
  }
  const supabase = requireServerSupabase();
  const rows = addresses
    .map((address: string) => addressSchema.safeParse({ network, address }))
    .filter((item) => item.success)
    .map((item) => ({
      network: item.data.network,
      address: item.data.address,
      status: 'unused'
    }));

  const { error } = await supabase.from('addresses').upsert(rows, { ignoreDuplicates: true });
  if (error) {
    return NextResponse.json({ error: 'Failed to upload addresses.' }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
