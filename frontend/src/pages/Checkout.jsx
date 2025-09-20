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
  const [shippingFee, setShippingFee] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { token, user } = useAuth();

  useEffect(() => {
    const item = JSON.parse(localStorage.getItem('buynow'));
    if (!item) {
      toast.error('No product selected for checkout');
      return navigate('/products');
    }
    setProduct(item);

    if (!token) return;

    const fetchProfile = async () => {
      try {
        const res = await axios.get('/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setShipping(prev => ({
          ...prev,
          name: res.data.name || '',
          email: res.data.email || '',
          address: res.data.address || '',
          city: res.data.city || '',
          state: res.data.state || '',
          postalCode: res.data.postalCode || '',
          phone: res.data.phone || '',
        }));
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        toast.warn('Could not pre-fill shipping details');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, token]);

  const calculateShippingFee = (city) => {
    const normalizedCity = city.trim().toLowerCase();
    if (['coimbatore', 'chennai', 'madurai'].includes(normalizedCity)) return 50;
    if (['salem', 'erode', 'trichy'].includes(normalizedCity)) return 70;
    return 100;
  };

  useEffect(() => {
    if (!product || !shipping.city) return;

    const fee = calculateShippingFee(shipping.city);
    setShippingFee(fee);
    setGrandTotal(product.price * product.quantity + fee);
  }, [shipping.city, product]);

  const handlePlaceOrder = async () => {
    const isValid = Object.values(shipping).every(val => val.trim() !== '');
    if (!isValid) return toast.error('Please fill in all shipping fields.');

    try {
      const { data: freshProduct } = await axios.get(`/api/products/${product._id}`);
      if (freshProduct.stock < product.quantity) {
        return toast.error('Insufficient stock for this product.');
      }
    } catch (err) {
      return toast.error('Failed to check product stock.');
    }

    if (paymentMethod === 'COD') {
      await handleCODOrder();
    } else {
      await handleRazorpayPayment();
    }
  };

  const saveShippingToProfile = async () => {
    try {
      await axios.put('/api/users/profile', {
        address: shipping.address,
        city: shipping.city,
        state: shipping.state,
        postalCode: shipping.postalCode,
        phone: shipping.phone,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.warn('Failed to update shipping info');
    }
  };

  const handleCODOrder = async () => {
    try {
      const orderData = {
        userId: user.email,
        items: [{ name: product.name, quantity: product.quantity, price: product.price }],
        total: grandTotal,
        shipping,
        shippingFee,
        paymentMethod: 'COD',
      };

      await axios.post('/api/orders', orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await saveShippingToProfile();
      toast.success('Order placed successfully!');
      localStorage.removeItem('buynow');
      navigate('/thank-you');
    } catch (err) {
      console.error(err);
      toast.error('Failed to place order');
    }
  };

  // Update the handleRazorpayPayment function in your Checkout.jsx

const handleRazorpayPayment = async () => {
  try {
    setLoading(true);
    
    // Log the amount being sent
    console.log('Sending payment request for amount:', grandTotal * 100);
    
    const { data } = await axios.post('/api/pay/razorpay-order', {
      amount: grandTotal * 100,  // Make sure to convert to paise
    });
    
    console.log('Razorpay order created:', data);
    
    // Make sure these properties match what your backend returns
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: data.amount,
      currency: data.currency,
      order_id: data.id,  // Make sure this matches the property name in your backend response
      name: 'Sai Engineering',
      description: 'Order Payment',
      handler: async (response) => {
        try {
          console.log('Payment successful, response:', response);
          
          const orderData = {
            userId: user.email,
            items: [{ name: product.name, quantity: product.quantity, price: product.price }],
            total: grandTotal,
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
          
          toast.success('Payment successful! Order placed.');
          localStorage.removeItem('buynow');
          navigate('/thank-you');
        } catch (err) {
          console.error('❌ Order save failed:', err.response?.data || err);
          toast.error('Payment successful, but order saving failed');
        }
      },
      prefill: {
        name: shipping.name,
        email: shipping.email,
        contact: shipping.phone,
      },
      theme: { color: '#3399cc' },
    };
    
    // Verify Razorpay is loaded
    if (!window.Razorpay) {
      throw new Error('Razorpay SDK not loaded! Check if the script is included in your HTML.');
    }
    
    const razorpay = new window.Razorpay(options);
    razorpay.open();
  } catch (err) {
    console.error('❌ Razorpay initiation failed:', err);
    
    // More detailed error handling
    if (err.response) {
      console.error('Server responded with error:', err.response.status);
      console.error('Error data:', err.response.data);
      toast.error(`Payment failed: ${err.response.data.message || 'Server error'}`);
    } else if (err.request) {
      console.error('No response received from server');
      toast.error('Payment failed: No response from server');
    } else {
      console.error('Error setting up request:', err.message);
      toast.error(`Payment failed: ${err.message}`);
    }
  } finally {
    setLoading(false);
  }
};
  

  if (loading || !product) return null;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Checkout</h2>

      <div className="border rounded-lg p-4 space-y-2">
        <div className="flex justify-between">
          <span>{product.name} × {product.quantity}</span>
          <span>₹{product.price * product.quantity}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping Fee</span>
          <span>₹{shippingFee}</span>
        </div>
        <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
          <span>Grand Total</span>
          <span>₹{grandTotal}</span>
        </div>
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
        {/* <label className="block">
          <input
            type="radio"
            name="paymentMethod"
            value="Online"
            checked={paymentMethod === 'Online'}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="mr-2"
          />
          Online Payment (Razorpay)
        </label> */}
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
