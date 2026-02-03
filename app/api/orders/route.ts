import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createOrderSchema } from '@/lib/validators';
import { getRate, getSettings } from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';
import { requireServerSupabase } from '@/lib/supabase';

const randomId = (size = 10) => crypto.randomBytes(size).toString('hex');

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
  const limit = rateLimit(ip);
  if (!limit.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please wait.' }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const { asset_symbol, network, amount_crypto, fiat_currency, payout_method } = parsed.data;

  const rate = await getRate(asset_symbol, network, fiat_currency);
  if (!rate) {
    return NextResponse.json({ error: 'Rate missing for this pair.' }, { status: 400 });
  }

  const settings = await getSettings();
  const depositMode = settings.deposit_mode ?? 'fixed';
  const fallbackToFixed = settings.fallback_to_fixed ?? true;
  const fixedAddresses = settings.fixed_addresses ?? {};

  const supabase = requireServerSupabase();

  let depositAddress = fixedAddresses?.[network] ?? null;
  let depositSource: 'fixed' | 'pool' = 'fixed';
  let depositPoolId: string | null = null;

  if (depositMode === 'pool') {
    const { data: poolAddress } = await supabase
      .from('addresses')
      .select('*')
      .eq('network', network)
      .eq('status', 'unused')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (poolAddress) {
      depositAddress = poolAddress.address;
      depositSource = 'pool';
      depositPoolId = poolAddress.id;
    } else if (!fallbackToFixed) {
      return NextResponse.json({ error: 'No deposit addresses available.' }, { status: 400 });
    }
  }

  if (!depositAddress) {
    return NextResponse.json({ error: 'Deposit address missing.' }, { status: 400 });
  }

  const publicId = randomId(4);
  const token = randomId(16);

  const { data: insertedOrder, error } = await supabase.from('orders').insert({
    public_id: publicId,
    token_secret: token,
    asset_symbol,
    network,
    amount_crypto,
    fiat_currency,
    payout_method,
    payout_details: { country: '', details: {} },
    deposit_address: depositAddress,
    deposit_source: depositSource,
    deposit_address_pool_id: depositPoolId,
    status: 'pending_deposit',
    confirmations_required: 1,
    ip_address: ip
  }).select('id').maybeSingle();

  if (error) {
    return NextResponse.json({ error: 'Failed to create order.' }, { status: 500 });
  }

  if (depositSource === 'pool' && depositPoolId && insertedOrder?.id) {
    await supabase
      .from('addresses')
      .update({ status: 'assigned', assigned_order_id: insertedOrder.id })
      .eq('id', depositPoolId);
  }

  return NextResponse.json({ publicId, token });
}
