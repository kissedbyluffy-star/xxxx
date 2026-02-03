# Aether Exchange (Cloudflare Pages + D1)

A premium crypto → fiat exchange experience that looks automated while payouts are manually verified and processed.

## Stack
- React + Vite (Cloudflare Pages frontend)
- Cloudflare Pages Functions (API)
- Cloudflare D1 (SQLite)
- Wrangler for local dev + deploy

## Local Setup

### 1) Install dependencies
```bash
npm install
```

### 2) Create the D1 database
```bash
wrangler d1 create crypto-fiat
```

### 3) Apply schema
```bash
wrangler d1 execute crypto-fiat --file=./db/schema.sql
```

### 4) Seed settings, rates, and admin user
```bash
npm run seed
```

Seed defaults:
- Admin email: `admin@example.com`
- Admin password: `ChangeMe123!` (override with `ADMIN_PASSWORD` env)

### 5) Run local dev
Terminal A:
```bash
npm run dev
```

Terminal B (Pages Functions + D1 proxy):
```bash
npm run pages:dev
```

Open http://localhost:5173

## Deploy to Cloudflare Pages
1. Push repo to GitHub.
2. Create a Cloudflare Pages project.
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add a D1 binding named `DB` in Pages settings.
6. Run `wrangler d1 execute <db> --file=./db/schema.sql` and `npm run seed` once.

## Settings
Admin → Settings:
- **Deposit mode**: fixed or pool (future)
- **Fixed addresses**: per network
- **Explorer templates**: include `{txid}` placeholder

## Admin Workflow
- **Orders**: list, filter, open detail, update status/notes/confirmations.
- **Rates**: CRUD rates per asset/network/fiat.
- **Settings**: configure deposit mode, fixed addresses, explorer templates.
- **Address Pool**: bulk upload deposit addresses for future pool mode.

## Public Flow
1. Home page: choose asset/network, amount, fiat, payout method.
2. Create order → redirects to `/order/{publicId}?t={token}`.
3. Order page: deposit address + QR, payout details, TXID submission, status timeline.

## Security Notes
- Public order access requires a token query param.
- Admin endpoints require session cookie + CSRF token.
- Passwords are stored using bcrypt.
- Payout details are masked in public order responses.
- Basic in-memory rate limiting on create order (upgrade for production).

## Repo Files
- `db/schema.sql` – D1 schema
- `scripts/seed.js` – seed settings, rates, and admin user
- `functions/` – Cloudflare Pages Functions
- `src/` – React frontend
