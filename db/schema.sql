-- Settings table
create table if not exists public.settings (
  key text primary key,
  value jsonb not null
);

-- Rates table
create table if not exists public.rates (
  id uuid primary key default gen_random_uuid(),
  asset_symbol text not null,
  network text not null,
  fiat_currency text not null,
  buy_rate numeric not null,
  fee_pct numeric null,
  fee_flat numeric null,
  updated_at timestamptz default now()
);

-- Addresses pool table
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  network text not null,
  address text unique not null,
  status text not null default 'unused',
  assigned_order_id uuid null,
  created_at timestamptz default now()
);

-- Orders table
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  public_id text unique not null,
  token_secret text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  asset_symbol text not null,
  network text not null,
  amount_crypto numeric not null,
  fiat_currency text not null,
  payout_method text not null,
  payout_details jsonb null,
  deposit_address text not null,
  deposit_source text not null,
  deposit_address_pool_id uuid null,
  txid text null,
  status text not null,
  confirmations_required int not null default 1,
  confirmations_current int not null default 0,
  payout_reference text null,
  admin_note text null,
  ip_address text null
);

create index if not exists idx_orders_public_id on public.orders(public_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_rates_pair on public.rates(asset_symbol, network, fiat_currency);
