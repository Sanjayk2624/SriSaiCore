// pages/Login.jsx
import { useState } from 'react';
import axios from '../utils/axiosInstance';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login', form);
      const { token, user } = res.data;
  
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userEmail', user.email);
  
      // ✅ Restore cart for this user
      const userCartKey = `cart_${user.email}`;
      const restoredCart = JSON.parse(localStorage.getItem(userCartKey)) || [];
      localStorage.setItem('cart', JSON.stringify(restoredCart));
  
      toast.success('Login successful!');
  
      // ✅ Trigger updates
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('authChange'));
      window.dispatchEvent(new Event('cartChange'));
  
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/products');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed!');
    }
  };
  

  return (
    <form onSubmit={handleLogin} className="max-w-md mx-auto p-6 mt-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <input
        name="email"
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        className="w-full border px-4 py-2 mb-4"
        required
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        className="w-full border px-4 py-2 mb-4"
        required
      />
      <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
        Login
      </button>
    </form>
  );
}
