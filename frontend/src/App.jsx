import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState, useEffect } from 'react';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import CheckoutAll from './pages/CheckoutAll';
import ThankYou from './pages/ThankYou';
import Orders from './pages/Orders';
import OrderInvoice from './pages/OrderInvoice';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';

import Admin from './pages/Admin';
import AdminHome from './pages/admin/AdminHome';
import AdminOrders from './pages/admin/AdminOrders';
import AdminProducts from './pages/admin/AdminProducts';
import AdminUsers from './pages/admin/AdminUsers';
import AdminStats from './pages/admin/AdminStats';

import ProtectedRoute from './components/ProtectedRoute';

import DeliveryDashboard from './pages/DeliveryDashboard';

function AppRoutesWithFooter() {
  const location = useLocation();
  const hideFooter = location.pathname === '/' || location.pathname.startsWith('/admin');
  
  // Track user login role
  const user = JSON.parse(localStorage.getItem('user')); // Assuming user data is stored in localStorage
  
  // State to track loading
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Mark as loaded after the initial render
    setIsLoaded(true);
  }, []);

  // Only show footer when content is loaded and not on admin or delivery routes
  const shouldHideFooter = !isLoaded || user?.role === 'delivery' || hideFooter;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/checkout-all" element={<CheckoutAll />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/invoice/:orderId" element={<OrderInvoice />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />

          <Route path="/delivery" element={
            <ProtectedRoute allowedRoles={['delivery']}>
              <DeliveryDashboard />
            </ProtectedRoute>
          } />

          {/* Admin panel with nested routes */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <Admin />
            </ProtectedRoute>
          }>
            <Route index element={<AdminHome />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="stats" element={<AdminStats />} />
          </Route>
        </Routes>
      </main>

      {/* Only show footer after content is fully loaded and not on admin/delivery pages */}
      {!shouldHideFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutesWithFooter />
    </BrowserRouter>
  );
}
