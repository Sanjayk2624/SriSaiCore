import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  BarChart2,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser || storedUser.role !== 'admin') {
      navigate('/');
    } else {
      setUser(storedUser);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event('authChange'));
    window.dispatchEvent(new Event('cartChange'));
    navigate('/');
  };

  const menu = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard /> },
    { name: 'Products', path: '/admin/products', icon: <Package /> },
    { name: 'Orders', path: '/admin/orders', icon: <ShoppingCart /> },
    { name: 'Users', path: '/admin/users', icon: <Users /> },
    { name: 'Analytics', path: '/admin/stats', icon: <BarChart2 /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar (Desktop & Mobile) */}
      <aside
        className={`fixed md:relative z-50 bg-purple-800 text-white w-64 p-4 space-y-6 transition-transform transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-3">
          {menu.map((item) => (
            <NavLink
              to={item.path}
              key={item.name}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded transition duration-200 ${
                  isActive ? 'bg-purple-900 shadow-md' : 'hover:bg-purple-700'
                }`
              }
              onClick={() => setSidebarOpen(false)} // auto-close on mobile
            >
              {item.icon} <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 mt-4 text-sm bg-red-600 hover:bg-red-700 px-3 py-2 rounded"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </aside>

      {/* Sidebar Overlay (Mobile only) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto w-full md:ml-64">
        {/* Mobile Toggle Button */}
        <div className="md:hidden mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Admin Dashboard</h2>
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6 text-purple-800" />
          </button>
        </div>

        <Outlet />
      </main>
    </div>
  );
}
