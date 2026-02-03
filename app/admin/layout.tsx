import Link from 'next/link';
import AdminAuthGate from '@/components/AdminAuthGate';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-midnight px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Admin Console</h1>
            <p className="text-sm text-white/60">Manage orders, rates, settings, and address pools.</p>
          </div>
          <nav className="flex flex-wrap gap-3 text-sm text-white/70">
            <Link className="btn-secondary" href="/admin">
              Overview
            </Link>
            <Link className="btn-secondary" href="/admin/orders">
              Orders
            </Link>
            <Link className="btn-secondary" href="/admin/settings">
              Settings
            </Link>
            <Link className="btn-secondary" href="/admin/rates">
              Rates
            </Link>
            <Link className="btn-secondary" href="/admin/addresses">
              Address Pool
            </Link>
          </nav>
        </div>
        <AdminAuthGate>{children}</AdminAuthGate>
      </div>
    </main>
  );
}
