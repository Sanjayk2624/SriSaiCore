import { useEffect, useState } from 'react';
import axios from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaMoneyBillWave,
  FaCheckCircle,
  FaTruck,
  FaShippingFast,
  FaUser,
} from 'react-icons/fa';

export default function DeliveryDashboard() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!token || user?.role !== 'delivery') {
      toast.error('Access denied');
      return navigate('/login');
    }

    const fetchOrders = async () => {
      try {
        const res = await axios.get('/api/delivery/orders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data);
      } catch (err) {
        toast.error('Failed to fetch orders');
      }
    };

    fetchOrders();
    const intervalId = setInterval(fetchOrders, 10000);
    return () => clearInterval(intervalId);
  }, [navigate, token, user]);

  const updateOrder = async (orderId, updates) => {
    try {
      const res = await axios.put(`/api/delivery/order/${orderId}/status`, updates, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders((prev) =>
        prev.map((order) => (order._id === orderId ? res.data : order))
      );
      toast.success('Order updated');
    } catch (err) {
      toast.error('Failed to update order');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-blue-700">
        <FaTruck className="text-blue-600" />
        Delivery Dashboard
      </h2>

      {orders.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <div className="overflow-auto rounded-xl border border-gray-300 max-h-[75vh]">
          <table className="min-w-[1000px] w-full border-collapse text-sm text-left">
            <thead className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md">
              <tr>
                <th className="py-3 px-4 border border-gray-300">Order ID</th>
                <th className="py-3 px-4 border border-gray-300">Customer</th>
                <th className="py-3 px-4 border border-gray-300">Address</th>
                <th className="py-3 px-4 border border-gray-300">Amount</th>
                <th className="py-3 px-4 border border-gray-300">Payment</th>
                <th className="py-3 px-4 border border-gray-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr
                  key={order._id}
                  className={
                    index % 2 === 0
                      ? 'bg-white'
                      : 'bg-blue-50 hover:bg-blue-100 transition'
                  }
                >
                  <td className="py-3 px-4 border border-gray-300 font-mono text-gray-800">{order._id}</td>
                  <td className="py-3 px-4 border border-gray-300">
                    <div className="flex items-center gap-2">
                      <FaUser className="text-blue-500" />
                      {order.shipping.name}
                      <span className="text-xs text-gray-500 ml-1">
                        ({order.shipping.phone})
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 border border-gray-300">
                    <div className="flex flex-col gap-0.5">
                      <span className="flex items-center gap-1">
                        <FaShippingFast className="text-gray-500" />
                        {order.shipping.address}
                      </span>
                      <span className="text-xs text-gray-600">
                        {order.shipping.city}, {order.shipping.state} - {order.shipping.postalCode}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 border border-gray-300 font-semibold text-blue-700">
                    ₹{order.total}
                  </td>
                  <td className="py-3 px-4 border border-gray-300">
                    {order.paymentMethod === 'Online' || order.paymentStatus === 'Paid' ? (
                      <span className="inline-flex items-center gap-1 text-green-600 font-semibold">
                        <FaCheckCircle /> Paid
                      </span>
                    ) : (
                      <button
                        onClick={() => updateOrder(order._id, { paymentStatus: 'Paid' })}
                        className="inline-flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md"
                      >
                        <FaMoneyBillWave />
                        Mark as Paid
                      </button>
                    )}
                  </td>
                  <td className="py-3 px-4 border border-gray-300">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        order.status !== "Delivered" && updateOrder(order._id, { status: e.target.value })
                      }
                      className={`border px-2 py-1 rounded-md w-full text-sm ${
                        order.status === 'Delivered'
                          ? 'bg-green-100 text-green-700 cursor-not-allowed' // Disable and change appearance when "Delivered"
                          : order.status === 'Shipped'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                      disabled={order.status === 'Delivered'} // Disable the select input if status is "Delivered"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
