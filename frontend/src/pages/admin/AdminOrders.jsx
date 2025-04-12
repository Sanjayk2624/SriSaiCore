// src/pages/admin/AdminOrders.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (err) {
      toast.error('Failed to fetch orders');
    }
  };

  const updateOrder = async (id, fieldsToUpdate) => {
    const key = Object.keys(fieldsToUpdate)[0];
    const confirm = window.confirm(`Update ${key} to "${fieldsToUpdate[key]}"?`);
    if (!confirm) return;

    try {
      setUpdatingOrderId(id);
      await axios.put(`/api/orders/${id}`, fieldsToUpdate, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Order updated!');
      fetchOrders();
    } catch (err) {
      toast.error('Update failed');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const renderBadge = (status) => {
    const base = 'text-xs font-semibold px-2 py-1 rounded';
    switch (status) {
      case 'Paid':
        return <span className={`${base} bg-green-100 text-green-700`}>Paid ✅</span>;
      case 'Pending':
        return <span className={`${base} bg-yellow-100 text-yellow-700`}>Pending ⏳</span>;
      case 'Shipped':
        return <span className={`${base} bg-orange-100 text-orange-700`}>Shipped 📦</span>;
      case 'Delivered':
        return <span className={`${base} bg-green-100 text-green-700`}>Delivered ✅</span>;
      default:
        return <span className={`${base} bg-gray-100 text-gray-700`}>{status}</span>;
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8">
      <h2 className="text-2xl font-bold text-gray-800">Orders</h2>

      <div className="overflow-x-auto rounded-lg shadow-lg bg-white">
        <div className="overflow-y-auto max-h-[calc(100vh-250px)]"> {/* Adjust this height as needed */}
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="sticky top-0 bg-purple-800 text-white text-xs uppercase z-10">
              <tr>
                <th className="p-3">Order ID</th>
                <th className="p-3">User Email</th>
                <th className="p-3">Total</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Status</th>
                <th className="p-3">Created</th>
                <th className="p-3">Items</th>
                <th className="p-3">Update</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 break-all">{order._id}</td>
                  <td className="p-3">{order.shipping?.email}</td>
                  <td className="p-3 font-semibold text-blue-600">₹{order.total}</td>

                  <td className="p-3 space-y-1">
                    <div>{order.paymentMethod}</div>
                    {order.paymentMethod === 'COD' ? (
                      <select
                        className="mt-1 border text-sm rounded px-2 py-1"
                        value={order.paymentStatus}
                        onChange={(e) =>
                          updateOrder(order._id, { paymentStatus: e.target.value })
                        }
                        disabled={updatingOrderId === order._id || order.status === 'Delivered'}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                      </select>
                    ) : (
                      renderBadge(order.paymentStatus)
                    )}
                  </td>

                  <td className="p-3">{renderBadge(order.status)}</td>

                  <td className="p-3">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>

                  <td className="p-3">
                    <ul className="list-disc pl-4 space-y-1 text-xs">
                      {order.items.map((item, idx) => (
                        <li key={idx}>{item.name} × {item.quantity}</li>
                      ))}
                    </ul>
                  </td>

                  <td className="p-3 text-sm">
                    {order.status === 'Delivered' ? (
                      <span className="text-green-600 font-semibold">Delivered</span>
                    ) : (
                      <>
                        <select
                          className="border rounded px-2 py-1"
                          value={order.status}
                          onChange={(e) =>
                            updateOrder(order._id, { status: e.target.value })
                          }
                          disabled={updatingOrderId === order._id}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                        {updatingOrderId === order._id && (
                          <p className="text-xs text-gray-500 mt-1">Updating...</p>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
