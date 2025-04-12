// src/pages/admin/AdminStats.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';

const COLORS = ['#6D28D9', '#FB923C', '#16A34A'];

export default function AdminStats() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const [orderRes, productRes] = await Promise.all([
      axios.get('/api/orders', config),
      axios.get('/api/products'),
    ]);
    setOrders(orderRes.data);
    setProducts(productRes.data);
  };

  const getStatusData = () => {
    const counts = { Pending: 0, Shipped: 0, Delivered: 0 };
    orders.forEach(o => counts[o.status]++);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  const getRevenueData = () => {
    const monthly = Array(12).fill(0);
    orders.forEach(o => {
      const month = new Date(o.createdAt).getMonth();
      monthly[month] += o.total;
    });
    return monthly.map((val, i) => ({
      name: new Date(0, i).toLocaleString('default', { month: 'short' }),
      Revenue: val,
    }));
  };

  const getCategoryData = () => {
    const map = {};
    products.forEach(p => {
      map[p.category] = (map[p.category] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics & Insights</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie: Orders by Status */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Order Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getStatusData()}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {getStatusData().map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar: Products by Category */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Products by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getCategoryData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#6D28D9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line: Monthly Revenue */}
        <div className="col-span-1 md:col-span-2 bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Monthly Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getRevenueData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Revenue" stroke="#FB923C" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
