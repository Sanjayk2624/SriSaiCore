//src/pages/OrderInvoice.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axiosInstance';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'react-toastify';

export default function OrderInvoice() {
  const { orderId } = useParams();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateInvoice = async () => {
      try {
        const res = await axios.get(`/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const order = res.data;
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text('Sai Engineering - Order Invoice', 20, 20);

        doc.setFontSize(12);
        doc.text(`Order ID: ${order._id}`, 20, 40);
        doc.text(`Customer: ${order.shipping?.name}`, 20, 50);
        doc.text(`Email: ${order.shipping?.email}`, 20, 60);
        doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 20, 70);

        doc.text('Shipping Address:', 20, 85);
        doc.text(`${order.shipping?.address}, ${order.shipping?.city}`, 20, 95);
        doc.text(`${order.shipping?.state} - ${order.shipping?.postalCode}`, 20, 105);
        doc.text(`Phone: ${order.shipping?.phone}`, 20, 115);

        // 🧾 Items Table
        autoTable(doc, {
          head: [['Item', 'Qty', 'Price (₹)', 'Total (₹)']],
          body: order.items.map(item => [
            item.name,
            item.quantity,
            item.price,
            item.price * item.quantity,
          ]),
          startY: 130,
        });

        const totalY = doc.lastAutoTable.finalY + 10;
        doc.text(`Total Amount: ₹${order.total}`, 20, totalY);

        doc.save(`Invoice_${order._id}.pdf`);
      } catch (err) {
        toast.error('Failed to generate invoice.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    generateInvoice();
  }, [orderId, token]);

  return (
    <div className="text-center mt-20">
      {loading ? (
        <>
          <h2 className="text-2xl font-semibold">Generating Invoice...</h2>
          <p className="text-gray-500">Your invoice will be downloaded shortly.</p>
        </>
      ) : (
        <h2 className="text-xl font-medium text-green-600">Invoice generated successfully.</h2>
      )}
    </div>
  );
}
