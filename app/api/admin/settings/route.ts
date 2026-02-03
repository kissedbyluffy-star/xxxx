import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { requireServerSupabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const user = await requireAdminAuth(request.headers.get('authorization'));
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }
  const supabase = requireServerSupabase();
  const { data, error } = await supabase.from('settings').select('*');
  if (error) {
    return NextResponse.json({ error: 'Failed to load settings.' }, { status: 500 });
  }
  const settings: Record<string, any> = {};
  data.forEach((row) => {
    settings[row.key] = row.value;
  });
  return NextResponse.json(settings);
}

export async function PATCH(request: NextRequest) {
  const user = await requireAdminAuth(request.headers.get('authorization'));
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
  }
  const supabase = requireServerSupabase();
  const updates = Object.entries(body).map(([key, value]) => ({ key, value }));
  const { error } = await supabase.from('settings').upsert(updates);
  if (error) {
    return NextResponse.json({ error: 'Failed to save settings.' }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
