import { Routes, Route, NavLink } from 'react-router-dom';
import Home from './pages/Home';
import OrderPage from './pages/Order';
import AdminHome from './pages/admin/AdminHome';
import AdminOrders from './pages/admin/Orders';
import AdminOrderDetail from './pages/admin/OrderDetail';
import AdminSettings from './pages/admin/Settings';
import AdminRates from './pages/admin/Rates';
import AdminAddresses from './pages/admin/Addresses';
import { AdminProvider } from './context/AdminContext';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm ${isActive ? 'text-white' : 'text-white/60 hover:text-white'}`;

export default function App() {
  return (
    <AdminProvider>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(91,140,255,0.18),_transparent_55%)]">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <div>
            <p className="text-xs text-white/40">Aether Exchange</p>
            <NavLink to="/" className="text-lg font-semibold text-white">
              Crypto → Fiat Desk
            </NavLink>
          </div>
          <nav className="flex items-center gap-4">
            <NavLink to="/" className={linkClass}>
              Home
            </NavLink>
            <NavLink to="/admin" className={linkClass}>
              Admin
            </NavLink>
          </nav>
        </header>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/order/:publicId" element={<OrderPage />} />
          <Route path="/admin" element={<AdminHome />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/rates" element={<AdminRates />} />
          <Route path="/admin/addresses" element={<AdminAddresses />} />
        </Routes>
      </div>
    </AdminProvider>
  );
}
