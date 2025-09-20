import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu } from 'lucide-react';
import axios from '../utils/axiosInstance';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const { token, user, logout } = useAuth();

  useEffect(() => {
    if (user?.role === 'user') {
      const updateCart = async () => {
        try {
          const res = await axios.get('/api/cart', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const items = res.data.items || [];
          setCartCount(items.reduce((acc, item) => acc + item.quantity, 0));
        } catch (err) {
          console.error('Failed to fetch cart count:', err);
          setCartCount(0);
        }
      };

      updateCart();
      window.addEventListener('cartChange', updateCart);
      return () => window.removeEventListener('cartChange', updateCart);
    }
  }, [token, user]);

  const handleLogout = () => {
    logout();
    window.dispatchEvent(new Event('cartChange'));
    navigate('/');
  };

  const renderLinksForRole = (onLinkClick) => {
    if (!user) return null;

    switch (user.role) {
      case 'admin':
        return <Link to="/admin" className="hover:text-green-400">Admin Dashboard</Link>;

      case 'delivery':
        return <Link to="/delivery" className="hover:text-green-400">Delivery Dashboard</Link>;

      case 'user':
        return (
          <>
            <Link to="/orders" className="hover:text-green-400" onClick={onLinkClick}>View Orders</Link>
            <Link to="/cart" className="relative flex items-center hover:text-green-400" onClick={onLinkClick}> 
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-1 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link to="/about" className="hover:text-green-400" onClick={onLinkClick}>About</Link>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 backdrop-blur-md sticky top-0 text-white px-6 py-4 shadow-md flex justify-between items-center z-50">
      <Link to="/" className="font-bold text-xl hover:text-green-400">Sai Engineering</Link>
      <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden">
        <Menu />
      </button>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-4">
        {/* Show Products link for unauthenticated users and users */}
        {!user ? (
          <Link to="/products" className="hover:text-green-400">Products</Link>
        ) : (
          user.role === 'user' && <Link to="/products" className="hover:text-green-400">Products</Link>
        )}

        {renderLinksForRole()}

        {user && <span className="text-sm italic">Hello, {user.name || user.email}</span>}

        {user ? (
          <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded">
            Logout
          </button>
        ) : (
          <>
            <Link to="/login" className="hover:text-green-400">Login</Link>
            <Link to="/register" className="hover:text-green-400">Register</Link>
          </>
        )}
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="absolute top-16 left-0 w-full bg-gray-800 flex flex-col p-4 space-y-3 md:hidden z-50 rounded-b shadow-lg">
          {/* Show Products link for unauthenticated users and users */}
          {!user ? (
            <Link to="/products" className="hover:text-green-400" onClick={() => setMobileOpen(false)}>Products</Link>
          ) : (
            user.role === 'user' && <Link to="/products" className="hover:text-green-400" onClick={() => setMobileOpen(false)}>Products</Link>
          )}

          {renderLinksForRole(()=>setMobileOpen(false))}

          {user && <span className="text-sm italic">Hello, {user.name || user.email}</span>}

          {user ? (
            <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded">
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)}>Login</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
