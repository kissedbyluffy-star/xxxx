/* eslint-disable no-console */
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

async function main() {
  const settings = [
    {
      key: 'deposit_mode',
      value: 'fixed'
    },
    {
      key: 'fallback_to_fixed',
      value: true
    },
    {
      key: 'fixed_addresses',
      value: {
        BTC: 'bc1qexamplebtcaddress',
        ERC20: '0xExampleEthAddress',
        BEP20: '0xExampleBscAddress',
        TRC20: 'TExampleTronAddress'
      }
    },
    {
      key: 'explorer_templates',
      value: {
        BTC: 'https://www.blockchain.com/explorer/transactions/btc/{txid}',
        ERC20: 'https://etherscan.io/tx/{txid}',
        BEP20: 'https://bscscan.com/tx/{txid}',
        TRC20: 'https://tronscan.org/#/transaction/{txid}'
      }
    }
  ];

  const rates = [
    {
      asset_symbol: 'BTC',
      network: 'BTC',
      fiat_currency: 'USD',
      buy_rate: 64000,
      fee_pct: 0.01,
      fee_flat: 0,
      updated_at: new Date().toISOString()
    },
    {
      asset_symbol: 'ETH',
      network: 'ERC20',
      fiat_currency: 'USD',
      buy_rate: 3100,
      fee_pct: 0.012,
      fee_flat: 0,
      updated_at: new Date().toISOString()
    },
    {
      asset_symbol: 'USDT',
      network: 'TRC20',
      fiat_currency: 'USD',
      buy_rate: 1,
      fee_pct: 0.005,
      fee_flat: 1,
      updated_at: new Date().toISOString()
    }
  ];

  await supabase.from('settings').upsert(settings);
  await supabase.from('rates').upsert(rates);

  console.log('Seed complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
