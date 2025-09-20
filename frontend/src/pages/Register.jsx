// pages/Register.jsx/ 

import { useState } from 'react';
import axios from '../utils/axiosInstance';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
  
    try {
      const res = await axios.post('/api/auth/register', form);
      const { token, user } = res.data;
  
      // ✅ Store login data just like in Login.jsx
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userEmail', user.email);
  
      // ✅ Notify navbar
      window.dispatchEvent(new Event('authChange'));
      window.dispatchEvent(new Event('cartChange'));
  
      toast.success('Registered and logged in successfully!');
      navigate(user.role === 'admin' ? '/admin' : '/products');
      login(token, user);
    } catch (err) {
      console.error(err.response?.data);
      const msg = err.response?.data?.message || 'Registration failed!';
      toast.error(msg);
    }
  };
  
  return (
    <form onSubmit={handleRegister} className="max-w-md mx-auto p-6 mt-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      <input
        name="name"
        placeholder="Name"
        value={form.name}
        onChange={handleChange}
        className="w-full border px-4 py-2 mb-4"
        required
      />
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
      <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
        Register
      </button>

      <p className="mt-4 text-center">
        Already have an account?{' '}
        <a href="/login" className="text-blue-600 hover:underline">Login</a>
      </p>
    </form>
  );
}