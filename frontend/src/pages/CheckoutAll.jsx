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
  const [shippingFee, setShippingFee] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuth();
  const navigate = useNavigate();

  // 🧮 Helper: Calculate shipping fee
  const calculateShippingFee = (city) => {
    const normalized = city.trim().toLowerCase();
    if (['coimbatore', 'chennai', 'madurai'].includes(normalized)) return 50;
    if (['salem', 'erode', 'trichy'].includes(normalized)) return 70;
    return 100;
  };

  // 📦 Load cart and user profile
  useEffect(() => {
    if (!token) return;

    const fetchAll = async () => {
      try {
        const [cartRes, userRes] = await Promise.all([
          axios.get('/api/cart', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/users/profile', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const cart = cartRes.data.items || [];
        const profile = userRes.data;

        const fee = calculateShippingFee(profile.city || '');
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

        setCartItems(cart);
        setShipping({
          name: profile.name || '', email: profile.email || '', address: profile.address || '',
          city: profile.city || '', state: profile.state || '', postalCode: profile.postalCode || '', phone: profile.phone || ''
        });
        setShippingFee(fee);
        setTotalPrice(subtotal + fee);
      } catch {
        toast.error('Failed to load cart or user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShipping(prev => ({ ...prev, [name]: value }));

    // 🆕 Update shipping fee when city changes
    if (name === 'city') {
      const updatedFee = calculateShippingFee(value);
      setShippingFee(updatedFee);

      const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      setTotalPrice(subtotal + updatedFee);
    }
  };

  const saveShippingToProfile = async () => {
    try {
      await axios.put('/api/users/profile', {
        address: shipping.address, city: shipping.city, state: shipping.state,
        postalCode: shipping.postalCode, phone: shipping.phone,
      }, { headers: { Authorization: `Bearer ${token}` } });
    } catch {
      toast.warn('Shipping info not saved');
    }
  };

  const handlePlaceOrder = async () => {
    if (!cartItems.length) return toast.error('Cart is empty');
    const isValid = Object.values(shipping).every(val => val.trim() !== '');
    if (!isValid) return toast.error('Please fill in all shipping fields');
    if (shipping.email !== user?.email) return toast.error(`Please use your login email: ${user?.email}`);

    try {
      const res = await axios.get('/api/products');
      const products = res.data;

      for (const item of cartItems) {
        const product = products.find(p => p.name === item.name);
        if (!product) return toast.error(`Product not found: ${item.name}`);
        if (product.stock < item.quantity) {
          return toast.error(`Not enough stock for "${item.name}". Available: ${product.stock}`);
        }
      }

      if (paymentMethod === 'Online') {
        await handleRazorpayPayment();
      } else {
        await handleCOD();
      }
    } catch {
      toast.error('Failed to verify stock');
    }
  };

  const handleCOD = async () => {
    try {
      await saveShippingToProfile();

      const orderData = {
        userId: shipping.email,
        items: cartItems.map(({ name, quantity, price }) => ({ name, quantity, price })),
        total: totalPrice,
        shipping,
        shippingFee,
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
    } catch {
      toast.error('Order failed');
    }
  };

  const handleRazorpayPayment = async () => {
    try {
      const res = await axios.post('/api/pay/razorpay-order',
        { amount: totalPrice * 100 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { id: orderId, amount, currency } = res.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: 'Sai Engineering',
        description: 'Cart Payment',
        order_id: orderId,
        handler: async (response) => {
          try {
            const orderData = {
              userId: shipping.email,
              items: cartItems.map(({ name, quantity, price }) => ({ name, quantity, price })),
              total: totalPrice,
              shipping,
              shippingFee,
              paymentMethod: 'Online',
              transactionId: response.razorpay_payment_id,
              paymentStatus: 'Paid',
            };

            await axios.post('/api/orders', orderData, {
              headers: { Authorization: `Bearer ${token}` },
            });

            await saveShippingToProfile();
            await axios.delete('/api/cart/clear', {
              headers: { Authorization: `Bearer ${token}` },
            });

            toast.success('Payment successful! Order placed.');
            window.dispatchEvent(new Event('cartChange'));
            navigate('/thank-you');
          } catch {
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

      new window.Razorpay(options).open();
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
          <div key={item.productId} className="flex justify-between py-2">
            <span>{item.name} × {item.quantity}</span>
            <span>₹{item.price * item.quantity}</span>
          </div>
        ))}
        <div className="flex justify-between border-t pt-2 mt-2 text-sm">
          <span>Shipping Fee</span>
          <span>₹{shippingFee}</span>
        </div>
        <div className="flex justify-between font-bold border-t pt-2 mt-2 text-lg">
          <span>Grand Total</span>
          <span>₹{totalPrice}</span>
        </div>
      </div>


      <div className="border rounded p-4 space-y-3">
        <h3 className="text-lg font-semibold">Shipping Info</h3>
        {['name', 'address', 'state', 'postalCode', 'phone'].map(field => (
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
          type="text"
          name="city"
          placeholder="City"
          className="w-full border p-2 rounded"
          value={shipping.city}
          onChange={handleChange}
        />
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
          {/* <option value="Online">Online (Razorpay)</option> */}
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
