import { useEffect, useState } from 'react';
import axios from 'axios';
import Papa from 'papaparse';
import { toast } from 'react-toastify';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    paymentMethod: '',
    paymentStatus: '',
    startDate: '',
    endDate: '',
  });

  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, filters]);

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

  const applyFilters = () => {
    const filtered = orders.filter((order) => {
      const matchStatus = filters.status ? order.status === filters.status : true;
      const matchPaymentMethod = filters.paymentMethod ? order.paymentMethod === filters.paymentMethod : true;
      const matchPaymentStatus = filters.paymentStatus ? order.paymentStatus === filters.paymentStatus : true;

      const orderDate = new Date(order.createdAt);
      const start = filters.startDate ? new Date(filters.startDate) : null;
      const end = filters.endDate ? new Date(filters.endDate) : null;

      const matchStart = start ? orderDate >= start : true;
      const matchEnd = end ? orderDate <= end : true;

      return matchStatus && matchPaymentMethod && matchPaymentStatus && matchStart && matchEnd;
    });

    setFilteredOrders(filtered);
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

  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      toast.info("No orders to export.");
      return;
    }

    const csv = Papa.unparse(
      filteredOrders.map(order => ({
        OrderID: order._id,
        Email: order.shipping?.email,
        Total: order.total,
        PaymentMethod: order.paymentMethod,
        PaymentStatus: order.paymentStatus,
        OrderStatus: order.status,
        CreatedAt: new Date(order.createdAt).toLocaleString(),
      }))
    );

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'filtered_orders.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Orders</h2>
        <button
          onClick={handleExportCSV}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
      {/* Status Filter */}
      <div className="flex flex-col">
        <label className="text-sm text-gray-600 mb-1">Order Status</label>
        <select
          className="border p-2 rounded"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All</option>
          <option value="Pending">Pending</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
        </select>
      </div>

      {/* Payment Method */}
      <div className="flex flex-col">
        <label className="text-sm text-gray-600 mb-1">Payment Method</label>
        <select
          className="border p-2 rounded"
          value={filters.paymentMethod}
          onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
        >
          <option value="">All</option>
          <option value="COD">Cash on Delivery</option>
          <option value="Online">Online</option>
        </select>
      </div>

      {/* Payment Status */}
      <div className="flex flex-col">
        <label className="text-sm text-gray-600 mb-1">Payment Status</label>
        <select
          className="border p-2 rounded"
          value={filters.paymentStatus}
          onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
        >
          <option value="">All</option>
          <option value="Pending">Pending</option>
          <option value="Paid">Paid</option>
        </select>
      </div>

      {/* Start Date */}
      <div className="flex flex-col">
        <label className="text-sm text-gray-600 mb-1">From</label>
        <input
          type="date"
          className="border p-2 rounded"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
        />
      </div>

      {/* End Date */}
      <div className="flex flex-col">
        <label className="text-sm text-gray-600 mb-1">To</label>
        <input
          type="date"
          className="border p-2 rounded"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
        />
      </div>
    </div>

    {/* Clear Filters Button */}
    <div className="flex justify-start mb-4">
      <button
        onClick={() => setFilters({
          status: '',
          paymentMethod: '',
          paymentStatus: '',
          startDate: '',
          endDate: '',
        })}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
      >
        Clear Filters
      </button>
    </div>


      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow-lg bg-white">
        <div className="overflow-y-auto max-h-[calc(100vh-250px)]">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="sticky top-0 bg-gray-800 text-white text-xs uppercase z-10">
              <tr>
                <th className="p-3">Order ID</th>
                <th className="p-3">User Email</th>
                <th className="p-3">Total</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Status</th>
                <th className="p-3">Created</th>
                <th className="p-3">Items</th>
                {/* <th className="p-3">Update</th> */}
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 break-all">{order._id}</td>
                  <td className="p-3">{order.shipping?.email}</td>
                  <td className="p-3 font-semibold text-blue-600">₹{order.total}</td>

                  <td className="p-3 space-y-1">
                    <div>{order.paymentMethod}</div>
                    <div>{renderBadge(order.paymentStatus)}</div>
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

                  {/* <td className="p-3 text-sm">
                    {order.status === 'Delivered' ? (
                      <span className="text-green-600 font-semibold">Delivered</span>
                    ) : (
                      <>
                        <span>{renderBadge(order.status)}</span>
                        {updatingOrderId === order._id && (
                          <p className="text-xs text-gray-500 mt-1">Updating...</p>
                        )}
                      </>
                    )}
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>

          {filteredOrders.length === 0 && (
            <div className="text-center py-8 text-gray-500">No orders match selected filters.</div>
          )}
        </div>
      </div>
    </div>
  );
}
