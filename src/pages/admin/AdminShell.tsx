import { NavLink } from 'react-router-dom';
import AdminGate from './AdminGate';

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-1 text-xs ${isActive ? 'bg-white/15 text-white' : 'text-white/60 hover:text-white'}`;

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen px-6 pb-16">
      <div className="mx-auto max-w-6xl">
        <AdminGate>
          <div className="glass rounded-2xl p-4 shadow-card">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <NavLink to="/admin" className={tabClass}>
                Overview
              </NavLink>
              <NavLink to="/admin/orders" className={tabClass}>
                Orders
              </NavLink>
              <NavLink to="/admin/settings" className={tabClass}>
                Settings
              </NavLink>
              <NavLink to="/admin/rates" className={tabClass}>
                Rates
              </NavLink>
              <NavLink to="/admin/addresses" className={tabClass}>
                Address Pool
              </NavLink>
            </div>
          </div>
          <div className="mt-6">{children}</div>
        </AdminGate>
      </div>
    </main>
  );
}
