// src/pages/admin/AdminHome.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

export default function AdminHome() {
  const [stats, setStats] = useState({ users: 0, products: 0, orders: 0, revenue: 0 });
  const [monthlyOrders, setMonthlyOrders] = useState([]);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const [users, products, orders] = await Promise.all([
      axios.get('/api/users', config),
      axios.get('/api/products'),
      axios.get('/api/orders', config),
    ]);

    const totalRevenue = orders.data.reduce((acc, order) => acc + order.total, 0);

    const monthlyData = Array(12).fill(0);
    orders.data.forEach((order) => {
      const month = new Date(order.createdAt).getMonth();
      monthlyData[month] += 1;
    });

    setStats({
      users: users.data.length,
      products: products.data.length,
      orders: orders.data.length,
      revenue: totalRevenue,
    });

    setMonthlyOrders(
      monthlyData.map((count, i) => ({
        name: new Date(0, i).toLocaleString('default', { month: 'short' }),
        Orders: count,
      }))
    );
  };

  const cards = [
    { label: 'Users', value: stats.users, icon: <Users /> },
    { label: 'Products', value: stats.products, icon: <Package /> },
    { label: 'Orders', value: stats.orders, icon: <ShoppingCart /> },
    { label: 'Revenue', value: `₹${stats.revenue}`, icon: <DollarSign /> },
  ];

  return (
    <div className="space-y-6">
      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded shadow p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{card.label}</p>
              <h3 className="text-xl font-bold">{card.value}</h3>
            </div>
            <div className="text-purple-700">{card.icon}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded shadow p-4">
          <h3 className="text-lg font-bold mb-2">Orders Per Month</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyOrders}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="Orders" fill="#6D28D9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded shadow p-4">
          <h3 className="text-lg font-bold mb-2">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyOrders}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="Orders" stroke="#FB923C" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
