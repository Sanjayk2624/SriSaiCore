// src/components/Navbar.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu } from 'lucide-react';
import axios from '../utils/axiosInstance';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const { token } = useAuth();

  useEffect(() => {
    const syncUser = () => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      setUser(storedUser);
    };
  
    const updateCart = async () => {
      const token = localStorage.getItem('token');
      if (!token) return; // ⛔ Avoid 401
  
      try {
        const res = await axios.get('/api/cart', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const items = res.data.items || [];
        setCartCount(items.reduce((acc, item) => acc + item.quantity, 0));
      } catch (err) {
        console.error('Failed to fetch cart count:', err);
        setCartCount(0);
      }
    };
  
    syncUser();
  
    // ⏳ Delay cart fetch slightly to ensure login state sync
    setTimeout(() => {
      updateCart();
    }, 100);
  
    window.addEventListener('authChange', syncUser);
    window.addEventListener('cartChange', updateCart);
  
    return () => {
      window.removeEventListener('authChange', syncUser);
      window.removeEventListener('cartChange', updateCart);
    };
  }, []);
  

  const handleLogout = () => {
    const email = localStorage.getItem('userEmail');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
  
    // ✅ Save current cart to user-specific key before clearing
    if (email && cart.length > 0) {
      localStorage.setItem(`cart_${email}`, JSON.stringify(cart));
    }
  
    localStorage.clear();
    setUser(null);
    setCartCount(0);
  
    sessionStorage.setItem('loggedOut', 'true');
    window.dispatchEvent(new Event('authChange'));
    window.dispatchEvent(new Event('cartChange'));
  
    navigate('/');
  };
  
  

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 backdrop-blur-md sticky top-0  text-white px-6 py-4 shadow-md flex justify-between items-center z-50">
      <Link to="/" className="font-bold text-xl hover:text-green-400">Sai Engineering</Link>

      <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden">
        <Menu />
      </button>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center space-x-4">
        <Link to="/products" className="hover:text-green-400 transition-colors duration-200">Products</Link>

        {user?.role === 'admin' && <Link to="/admin" className='hover:text-green-400' >Admin</Link>}

        {user?.role === 'user' && (
          <>
            <Link to="/orders" className="hover:text-green-400 transition-colors duration-200">View Orders</Link>
            <Link to="/cart" className="relative flex items-center hover:text-green-400">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-1 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
          </>
        )}

        {user && <span className="text-sm italic">Hello, {user.name || user.email}</span>}

        {user ? (
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow-sm transition"
          >
            Logout
          </button>
        ) : (
          <>
            <Link to="/login" className="hover:text-green-400 transition">Login</Link>
            <Link to="/register" className="hover:text-green-400 transition">Register</Link>
          </>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="absolute top-16 left-0 w-full bg-gray-800 flex flex-col p-4 space-y-3 md:hidden z-50 transition duration-300 ease-in-out rounded-b shadow-lg">
          <Link to="/products" className="hover:text-green-400 transition" onClick={() => setMobileOpen(false)}>Products</Link>

          {user?.role === 'admin' && (
            <Link to="/admin" onClick={() => setMobileOpen(false)}>Admin</Link>
          )}

          {user?.role === 'user' && (
            <>
              <Link to="/orders" className="hover:text-green-400" onClick={() => setMobileOpen(false)}>View Orders</Link>
              <Link to="/cart" onClick={() => setMobileOpen(false)}>
                <span className="inline-flex items-center gap-1 hover:text-green-400">
                  <ShoppingCart className="w-4 h-4" />
                  Cart ({cartCount})
                </span>
              </Link>
            </>
          )}

          {user && (
            <span className="text-sm italic ">Hello, {user.name || user.email}</span>
          )}

          {user ? (
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
            >
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
