import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function CheckoutAll() {
  const [cartItems, setCartItems] = useState([]);
  const [shipping, setShipping] = useState({
    name: '', email: '', address: '', city: '', state: '', postalCode: '', phone: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [cartRes, userRes] = await Promise.all([
          axios.get('/api/cart', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/users/profile', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        setCartItems(cartRes.data.items || []);
        setShipping({
          name: userRes.data.name || '',
          email: userRes.data.email || '',
          address: userRes.data.address || '',
          city: userRes.data.city || '',
          state: userRes.data.state || '',
          postalCode: userRes.data.postalCode || '',
          phone: userRes.data.phone || '',
        });
      } catch (err) {
        toast.error('Failed to load cart or user profile');
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchAll();
  }, [token]);

  const handleChange = (e) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async () => {
    if (!cartItems.length) return toast.error('Cart is empty');

    const isValid = Object.values(shipping).every(val => val.trim() !== '');
    if (!isValid) return toast.error('Please fill in all shipping fields');

    const userEmail = localStorage.getItem('userEmail');
    if (shipping.email !== userEmail) {
      return toast.error(`Please use your login email: ${userEmail}`);
    }

    if (paymentMethod === 'Online') {
      return handleRazorpayPayment();
    } else {
      return handleCOD();
    }
  };

  const handleCOD = async () => {
    try {
      const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

      await axios.put('/api/users/profile', {
        address: shipping.address,
        city: shipping.city,
        state: shipping.state,
        postalCode: shipping.postalCode,
        phone: shipping.phone,
      }, { headers: { Authorization: `Bearer ${token}` } });

      const orderData = {
        userId: shipping.email,
        items: cartItems.map(({ name, quantity, price }) => ({ name, quantity, price })),
        total,
        shipping,
        paymentMethod: 'COD',
      };

      await axios.post('/api/orders', orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await axios.delete('/api/cart/clear', {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('Order placed successfully!');
      window.dispatchEvent(new Event('cartChange'));
      navigate('/thank-you');
    } catch (err) {
      toast.error('Order failed');
    }
  };

  const handleRazorpayPayment = async () => {
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    try {
      const orderRes = await axios.post(
        '/api/pay/razorpay-order',
        { amount: total },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { id: orderId, amount, currency } = orderRes.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: 'Sai Engineering',
        description: 'Cart Order Payment',
        order_id: orderId,
        handler: async (response) => {
          try {
            const orderData = {
              userId: shipping.email,
              items: cartItems.map(({ name, quantity, price }) => ({ name, quantity, price })),
              total,
              shipping,
              paymentMethod: 'Online',
              transactionId: response.razorpay_payment_id,
              paymentStatus: 'Paid', // ✅ Add this!

            };

            await axios.post('/api/orders', orderData, {
              headers: { Authorization: `Bearer ${token}` },
            });

            await axios.delete('/api/cart/clear', {
              headers: { Authorization: `Bearer ${token}` },
            });

            toast.success('Payment successful! Order placed.');
            window.dispatchEvent(new Event('cartChange'));
            navigate('/thank-you');
          } catch (err) {
            toast.error('Payment captured, but order failed.');
          }
        },
        prefill: {
          name: shipping.name,
          email: shipping.email,
          contact: shipping.phone,
        },
        theme: { color: '#3399cc' },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error(err);
      toast.error('Razorpay payment failed');
    }
  };

  if (loading) return null;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Checkout All</h2>

      <div className="border rounded p-4">
        {cartItems.map(item => (
          <div key={item.productId} className="flex justify-between border-b py-2">
            <span>{item.name} × {item.quantity}</span>
            <span>₹{item.price * item.quantity}</span>
          </div>
        ))}
        <p className="text-right font-bold mt-2">
          Total: ₹{cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)}
        </p>
      </div>

      <div className="border rounded p-4 space-y-3">
        <h3 className="text-lg font-semibold">Shipping Info</h3>
        {['name', 'address', 'city', 'state', 'postalCode', 'phone'].map(field => (
          <input
            key={field}
            type="text"
            name={field}
            placeholder={field[0].toUpperCase() + field.slice(1)}
            className="w-full border p-2 rounded"
            value={shipping[field]}
            onChange={handleChange}
          />
        ))}
        <input
          type="email"
          name="email"
          readOnly
          className="w-full border p-2 rounded bg-gray-100 text-gray-500"
          value={shipping.email}
        />

        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="COD">Cash on Delivery</option>
          <option value="Online">Online (Razorpay)</option>
        </select>
      </div>

      <button
        onClick={handlePlaceOrder}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
      >
        Place Order
      </button>
    </div>
  );
}
