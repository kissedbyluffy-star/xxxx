/* eslint-disable no-console */
const { execSync } = require('node:child_process');
const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');

const dbName = process.env.D1_DATABASE_NAME || process.env.D1_DATABASE || 'crypto-fiat';
const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe123!';

async function main() {
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const adminId = crypto.randomUUID();
  const settings = [
    { key: 'deposit_mode', value: 'fixed' },
    { key: 'fallback_to_fixed', value: true },
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
      id: crypto.randomUUID(),
      asset_symbol: 'BTC',
      network: 'BTC',
      fiat_currency: 'USD',
      buy_rate: 64000,
      fee_pct: 0.01,
      fee_flat: 0,
      updated_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      asset_symbol: 'ETH',
      network: 'ERC20',
      fiat_currency: 'USD',
      buy_rate: 3100,
      fee_pct: 0.012,
      fee_flat: 0,
      updated_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      asset_symbol: 'USDT',
      network: 'TRC20',
      fiat_currency: 'USD',
      buy_rate: 1,
      fee_pct: 0.005,
      fee_flat: 1,
      updated_at: new Date().toISOString()
    }
  ];

  const settingsSql = settings
    .map((row) =>
      `INSERT OR REPLACE INTO settings (key, value) VALUES ('${row.key}', '${JSON.stringify(row.value).replace(/'/g, "''")}');`
    )
    .join('\n');

  const ratesSql = rates
    .map(
      (rate) =>
        `INSERT OR REPLACE INTO rates (id, asset_symbol, network, fiat_currency, buy_rate, fee_pct, fee_flat, updated_at) VALUES (` +
        `'${rate.id}', '${rate.asset_symbol}', '${rate.network}', '${rate.fiat_currency}', ${rate.buy_rate}, ${rate.fee_pct}, ${rate.fee_flat}, '${rate.updated_at}');`
    )
    .join('\n');

  const adminSql =
    `INSERT OR REPLACE INTO admin_users (id, email, password_hash, created_at) VALUES (` +
    `'${adminId}', '${adminEmail}', '${passwordHash.replace(/'/g, "''")}', '${new Date().toISOString()}');`;

  const sql = `BEGIN;\n${settingsSql}\n${ratesSql}\n${adminSql}\nCOMMIT;`;

  execSync(`wrangler d1 execute ${dbName} --command "${sql.replace(/\n/g, ' ')}"`, {
    stdio: 'inherit'
  });

  console.log('Seed complete.');
  console.log(`Admin login: ${adminEmail} / ${adminPassword}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
