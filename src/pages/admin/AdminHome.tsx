import AdminShell from './AdminShell';

export default function AdminHome() {
  return (
    <AdminShell>
      <div className="glass rounded-2xl p-6 shadow-card">
        <h2 className="text-lg font-semibold">Admin overview</h2>
        <p className="text-sm text-white/60">Manage orders, rates, and settings from one place.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-white/50">Deposit mode</p>
            <p className="text-sm text-white/80">Configure fixed or pool addresses.</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-white/50">Manual settlement</p>
            <p className="text-sm text-white/80">Update confirmations and payout references.</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-white/50">Rates & fees</p>
            <p className="text-sm text-white/80">Maintain transparent pricing for clients.</p>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
