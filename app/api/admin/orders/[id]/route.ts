import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { adminOrderUpdateSchema } from '@/lib/validators';
import { requireServerSupabase } from '@/lib/supabase';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAdminAuth(request.headers.get('authorization'));
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = adminOrderUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
  }

  const supabase = requireServerSupabase();
  const { error } = await supabase
    .from('orders')
    .update({ ...parsed.data })
    .eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: 'Failed to update order.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
