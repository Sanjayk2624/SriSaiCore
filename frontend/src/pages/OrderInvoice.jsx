import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axiosInstance';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'react-toastify';

import seLogo from '/assets/se-logo.jpg'; // Adjust path if necessary

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

        // Watermark
        doc.setTextColor(230);
        doc.setFontSize(50);
        doc.text('SAI ENGINEERING', 35, 150, { angle: 45 });

        // Reset for main text
        doc.setTextColor(0);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('SAI ENGINEERING', 20, 20);

        // Logo
        const img = new Image();
        img.src = seLogo;
        img.onload = () => {
          doc.addImage(img, 'JPEG', 160, 10, 35, 20); // logo top-right

          doc.setFontSize(14);
          doc.setFont('helvetica', 'normal');
          doc.text(`Order Invoice`, 20, 30);
          doc.line(20, 32, 190, 32); // horizontal line

          // Order details
          doc.setFontSize(12);
          doc.text(`Order ID: ${order._id}`, 20, 45);
          doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 140, 45);

          // Customer info box
          doc.rect(20, 55, 170, 40); // border
          doc.text('Customer Details:', 22, 62);
          doc.setFontSize(11);
          const ship = order.shipping;
          doc.text(`Name: ${ship?.name}`, 22, 70);
          doc.text(`Email: ${ship?.email}`, 22, 77);
          doc.text(`Phone: ${ship?.phone}`, 22, 84);

          // Address
          const addr = `${ship?.address}, ${ship?.city}, ${ship?.state} - ${ship?.postalCode}`;
          doc.text(`Address: ${addr}`, 22, 91);

          // Item table
          autoTable(doc, {
            startY: 105,
            head: [['Item Name', 'Qty', 'Price', 'Total']],
            body: order.items.map(item => [
              item.name,
              item.quantity,
              item.price.toFixed(2),
              (item.price * item.quantity).toFixed(2),
            ]),
            theme: 'grid',
            styles: {
              fontSize: 11,
              cellPadding: 3,
              halign: 'center',
            },
            headStyles: {
              fillColor: [40, 167, 69], // Bootstrap green
              textColor: 255,
              fontStyle: 'bold',
            },
          });

          // Total section
          const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
          const finalY = doc.lastAutoTable.finalY + 10;
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(`Total Amount: ${subtotal.toFixed(2)}`, 150, finalY);

          // Save
          doc.save(`Invoice_${order._id}.pdf`);
          setLoading(false);
        };
        img.onerror = () => {
          toast.error('Logo failed to load. Check the image path.');
          setLoading(false);
        };
      } catch (err) {
        toast.error('Failed to generate invoice.');
        console.error(err);
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
