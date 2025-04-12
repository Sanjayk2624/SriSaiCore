// src/pages/Admin.jsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  BarChart2,
  LogOut,
  Menu as HamburgerMenu,
} from 'lucide-react';

export default function Admin() {
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
    <div className="flex h-screen overflow-hidden">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 w-64 h-screen bg-purple-800 text-white p-4 z-50 transform transition-transform duration-300 ease-in-out 
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 md:relative md:flex-shrink-0 md:block overflow-y-auto`}
      >
        <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
        <nav className="flex flex-col gap-3">
          {menu.map((item) => (
            <NavLink
              to={item.path}
              key={item.name}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded hover:bg-purple-700 transition ${
                  isActive ? 'bg-purple-700' : ''
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon} <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 mt-6 text-sm bg-red-600 hover:bg-red-700 px-3 py-2 rounded"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </aside>

      {/* Main content wrapper */}
      <div className={`flex-1 flex flex-col h-screen overflow-hidden ${sidebarOpen ? 'ml-64' : ''}`}>
        {/* Top bar for mobile */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white shadow">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-700"
          >
            <HamburgerMenu />
          </button>
          <h2 className="text-lg font-semibold">Admin</h2>
        </div>

        {/* Main scrollable content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
