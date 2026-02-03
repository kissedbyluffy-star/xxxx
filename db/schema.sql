-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Rates table
CREATE TABLE IF NOT EXISTS rates (
  id TEXT PRIMARY KEY,
  asset_symbol TEXT NOT NULL,
  network TEXT NOT NULL,
  fiat_currency TEXT NOT NULL,
  buy_rate REAL NOT NULL,
  fee_pct REAL NULL,
  fee_flat REAL NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Addresses pool table
CREATE TABLE IF NOT EXISTS addresses (
  id TEXT PRIMARY KEY,
  network TEXT NOT NULL,
  address TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'unused',
  assigned_order_id TEXT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  public_id TEXT UNIQUE NOT NULL,
  token_secret TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  asset_symbol TEXT NOT NULL,
  network TEXT NOT NULL,
  amount_crypto REAL NOT NULL,
  fiat_currency TEXT NOT NULL,
  payout_method TEXT NOT NULL,
  payout_details_json TEXT NULL,
  deposit_address TEXT NOT NULL,
  deposit_source TEXT NOT NULL,
  deposit_address_pool_id TEXT NULL,
  txid TEXT NULL,
  status TEXT NOT NULL,
  confirmations_required INTEGER NOT NULL DEFAULT 1,
  confirmations_current INTEGER NOT NULL DEFAULT 0,
  payout_reference TEXT NULL,
  admin_note TEXT NULL,
  ip_address TEXT NULL
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Admin sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
  id TEXT PRIMARY KEY,
  admin_user_id TEXT NOT NULL,
  session_token TEXT UNIQUE NOT NULL,
  csrf_token TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_public_id ON orders(public_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_rates_pair ON rates(asset_symbol, network, fiat_currency);
