//src/pages/orders.jsx
import { useEffect, useState } from 'react';
import axios from '../utils/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const { isAuthenticated } = useAuth();
  const [email, setEmail] = useState(localStorage.getItem('userEmail') || '');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !email) return;

    axios.get(`/api/orders/user/${email}`)
      .then(res => setOrders(res.data))
      .catch(() => toast.error('Failed to load orders'));
  }, [isAuthenticated, email]);

  if (!isAuthenticated) {
    return <p className="p-6 text-center text-red-600 font-medium">Please log in to view your orders.</p>;
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Your Orders</h2>

      {orders.length === 0 ? (
        <p className="text-center text-gray-500">No orders found.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order, index) => (
            <div
              key={index}
              className="border border-gray-500 bg-white/90 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.01] hover:brightness-105 transition duration-300 p-5 ring-1 ring-gray-100"
            >
              <div className="flex justify-between flex-wrap gap-2 mb-2 text-sm text-gray-600">
                <span>🆔 <span className="font-medium">{order._id}</span></span>
                <span>📅 {new Date(order.createdAt).toLocaleString()}</span>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold text-gray-700 mb-2">Shipping Information</p>
                  <p>{order.shipping?.name}</p>
                  <p>{order.shipping?.address}, {order.shipping?.city}</p>
                  <p>{order.shipping?.state} - {order.shipping?.postalCode}</p>
                  <p>📞 {order.shipping?.phone}</p>
                  <p>📧 {order.shipping?.email}</p>
                </div>

                <div>
                  <p className="font-semibold text-gray-700 mb-2">Order Details</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm font-medium">Status:</span>
                    <span
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold animate-fade-in 
                        ${
                          order.status === 'Delivered'
                            ? 'bg-green-100 text-green-700'
                            : order.status === 'Shipped'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                    >
                      {order.status === 'Delivered' && '✅'}
                      {order.status === 'Shipped' && '📦'}
                      {order.status === 'Pending' && '⏳'}
                      {order.status}
                    </span>
                  </div>
                  <p>Total: <span className="font-semibold text-blue-600">₹{order.total}</span></p>
                  <p>Payment: <span className="font-medium">{order.paymentMethod}</span></p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-medium">Payment:</span>
                    <span
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold animate-fade-in 
                        ${
                          order.paymentStatus === 'Paid'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-600'
                        }`}
                    >
                      {order.paymentStatus === 'Paid' ? '💰 Paid' : '⛔ Pending'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-semibold text-gray-700 mb-2">🛒 Items:</h4>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                  {order.items.map((item, idx) => (
                    <li key={idx}>{item.name} × {item.quantity}</li>
                  ))}
                </ul>
              </div>

              {/* 🔒 Invoice Section */}
              {order.paymentStatus === 'Paid' ? (
                <button
                  className="mt-6 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded transition"
                  onClick={() => navigate(`/invoice/${order._id}`)}
                >
                  📄 Download Invoice
                </button>
              ) : (
                <div className="mt-6 flex items-center gap-2 text-sm text-red-500 italic">
                  <span>🔒</span>
                  <span>Invoice available after payment.</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
