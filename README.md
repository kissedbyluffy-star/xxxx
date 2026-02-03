# Aether Exchange MVP

Production-ready MVP for a crypto → fiat exchange that looks automated while payouts are manually verified and processed.

## Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Supabase Postgres + Auth
- Serverless API routes via `/app/api/*`

## Local Setup

### 1) Install dependencies
```bash
npm install
```

### 2) Configure environment variables
Create a `.env.local` file with:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3) Create database schema
Run the SQL in `db/schema.sql` inside the Supabase SQL editor.

### 4) Seed settings + rates
```bash
npm run seed
```

### 5) Create an admin user
Use Supabase Auth → Users → “Add user” and create an email/password user.

### 6) Run the app
```bash
npm run dev
```

Open http://localhost:3000

## Deposit Modes
Default is `fixed`.
- `fixed`: uses `fixed_addresses` from the settings table.
- `pool`: pulls the oldest `unused` address from `addresses`.
  - If the pool is empty and `fallback_to_fixed` is true, the fixed address is used instead.

Manage these in **Admin → Settings**.

## Admin Workflow
- **Orders**: view list, filter, open detail, update status/notes.
- **Rates**: CRUD rates per asset/network/fiat.
- **Settings**: configure deposit mode, fixed addresses, explorer templates.
- **Address Pool**: bulk upload deposit addresses for future pool mode.

## Public Flow
1. Home page: choose asset/network, amount, fiat, payout method.
2. Create order → redirects to `/order/[publicId]?t=[token]`.
3. Order page: deposit address + QR, payout details, TXID submission, status timeline.

## Supabase Tables
See `db/schema.sql` for full schema. Key tables:
- `settings`
- `rates`
- `addresses`
- `orders`

## Deploy (Vercel)
1. Push repo to GitHub.
2. Create a Vercel project.
3. Add environment variables listed above.
4. Deploy.

## End-to-End Test Steps
1. Set fixed deposit addresses in Admin Settings.
2. Create rates for your desired asset/network/fiat.
3. Create a public order from the home page.
4. Submit payout details and TXID.
5. Update status from the Admin Order Detail page.

## Security Notes
- Public order access requires a token query param.
- Payout details are masked in the public order API response.
- Rate limiting is a basic in-memory guard per IP (upgrade for production scale).

