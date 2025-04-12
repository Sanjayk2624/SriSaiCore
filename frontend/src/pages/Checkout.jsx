// src/pages/Checkout.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../utils/axiosInstance';
import { useAuth } from '../context/AuthContext';

export default function Checkout() {
  const [product, setProduct] = useState(null);
  const [shipping, setShipping] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    phone: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    const item = JSON.parse(localStorage.getItem('buynow'));
    if (!item) {
      toast.error('No product selected for checkout');
      return navigate('/products');
    }
    setProduct(item);

    const fetchProfile = async () => {
      try {
        const res = await axios.get('/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setShipping({
          name: res.data.name || '',
          email: res.data.email || '',
          address: res.data.address || '',
          city: res.data.city || '',
          state: res.data.state || '',
          postalCode: res.data.postalCode || '',
          phone: res.data.phone || '',
        });
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        toast.warn('Could not pre-fill shipping details');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate, token]);

  const handlePlaceOrder = async () => {
    const isValid = Object.values(shipping).every(val => val.trim() !== '');
    if (!isValid) {
      toast.error('Please fill in all shipping fields.');
      return;
    }

    if (paymentMethod === 'COD') {
      await handleCODOrder();
    } else {
      await handleRazorpayPayment();
    }
  };

  const handleCODOrder = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      const orderData = {
        userId: userEmail,
        items: [
          {
            name: product.name,
            quantity: product.quantity,
            price: product.price,
          },
        ],
        total: product.price * product.quantity,
        shipping,
        paymentMethod: 'COD',
      };

      await axios.post('/api/orders', orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('Order placed with COD!');
      localStorage.removeItem('buynow');
      navigate('/thank-you');
    } catch (err) {
      console.error(err);
      toast.error('Failed to place order');
    }
  };

  const handleRazorpayPayment = async () => {
    try {
      const orderResponse = await axios.post(
        '/api/pay/razorpay-order',
        { amount: product.price * product.quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { id: orderId, amount, currency } = orderResponse.data;

      const razorpayOptions = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: 'Sai Engineering',
        description: 'Order Payment',
        order_id: orderId,
        handler: async (response) => {
          try {
            const userEmail = localStorage.getItem('userEmail');
            const orderData = {
              userId: userEmail,
              items: [
                {
                  name: product.name,
                  quantity: product.quantity,
                  price: product.price,
                },
              ],
              total: product.price * product.quantity,
              shipping,
              paymentMethod: 'Online',
              transactionId: response.razorpay_payment_id,
              paymentStatus: 'Paid', // ✅ Add this!
            };
            console.log("Amount to send:", product.price * product.quantity); // debug this
            await axios.post('/api/orders', orderData, {
              headers: { Authorization: `Bearer ${token}` },
            });

            toast.success('Payment successful! Order placed.');
            localStorage.removeItem('buynow');
            navigate('/thank-you');
          } catch (err) {
            console.error('Error saving order:', err);
            toast.error('Payment successful, but failed to place order.');
          }
        },
        prefill: {
          name: shipping.name,
          email: shipping.email,
          contact: shipping.phone,
        },
        theme: {
          color: '#3399cc',
        },
      };

      const razorpay = new window.Razorpay(razorpayOptions);
      razorpay.open();
    } catch (err) {
      console.error('Razorpay payment initiation failed:', err);
      toast.error('Failed to initiate payment');
    }
  };


  if (loading || !product) return null;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Checkout</h2>
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <p>₹{product.price} × {product.quantity} = ₹{product.price * product.quantity}</p>
      </div>
      <div className="border rounded-lg p-4 space-y-3">
        <h3 className="text-lg font-semibold">Shipping Information</h3>
        {['name', 'address', 'city', 'state', 'postalCode', 'phone'].map(field => (
          <input
            key={field}
            type="text"
            name={field}
            placeholder={field[0].toUpperCase() + field.slice(1)}
            className="w-full border p-2 rounded"
            value={shipping[field]}
            onChange={(e) => setShipping({ ...shipping, [e.target.name]: e.target.value })}
          />
        ))}
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full border p-2 rounded bg-gray-100 text-gray-500"
          value={shipping.email}
          readOnly
        />
      </div>
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Payment Method</h3>
        <div>
          <label className="block">
            <input
              type="radio"
              name="paymentMethod"
              value="COD"
              checked={paymentMethod === 'COD'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mr-2"
            />
            Cash on Delivery (COD)
          </label>
          <label className="block">
            <input
              type="radio"
              name="paymentMethod"
              value="Online"
              checked={paymentMethod === 'Online'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mr-2"
            />
            Online Payment (Razorpay)
          </label>
        </div>
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
