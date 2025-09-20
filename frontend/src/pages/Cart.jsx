import { useEffect, useState } from 'react';
import axios from '../utils/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) fetchCart();
  }, [token]);

  const fetchCart = async () => {
    try {
      const cartRes = await axios.get('/api/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const cartItems = cartRes.data.items || [];

      const productsRes = await axios.get('/api/products');
      const productMap = {};
      productsRes.data.forEach(prod => {
        productMap[prod._id] = prod.stock;
      });

      const updatedItems = cartItems.map(item => ({
        ...item,
        stock: productMap[item.productId] ?? 0,
      }));

      setCartItems(updatedItems);
      window.dispatchEvent(new Event('cartChange'));
    } catch (err) {
      toast.error('Could not fetch cart or stock');
    }
  };

  const updateQuantity = async (productId, quantity, stock) => {
    if (quantity < 1 || quantity > stock) return;

    try {
      await axios.put('/api/cart/update', { productId, quantity }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchCart(); // 🔄 Re-sync stock and quantity after update
    } catch (err) {
      toast.error('Failed to update quantity');
    }
  };

  const removeItem = async (productId) => {
    try {
      await axios.delete(`/api/cart/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchCart();
      toast.success('Item removed');
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete('/api/cart/clear', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems([]);
      toast.success('Cart cleared');
      window.dispatchEvent(new Event('cartChange'));
    } catch (err) {
      toast.error('Failed to clear cart');
    }
  };

  const handleBuyNow = (item) => {
    if (item.stock === 0) {
      toast.error(`${item.name} is out of stock`);
      return;
    }
    localStorage.setItem('buynow', JSON.stringify(item));
    navigate('/checkout');
  };

  const handleCheckout = () => {
    const outOfStockItems = cartItems.filter(item => item.stock === 0);
    if (outOfStockItems.length) {
      toast.error('Some items are out of stock');
      return;
    }
    navigate('/checkout-all');
  };

  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="flex-1 px-4 py-8 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Your Cart</h2>

      {cartItems.length === 0 ? (
        <p className="text-center text-gray-500">🛒 Your cart is empty.</p>
      ) : (
        <>
          <ul className="space-y-5">
            {cartItems.map((item) => (
              <li
                key={item.productId}
                className="flex gap-4 items-center bg-white border border-gray-300 shadow-md rounded-lg p-4 transition hover:shadow-lg"
              >
                <img
                  src={
                    item.image?.startsWith('/images/')
                      ? `http://localhost:5000${item.image}`
                      : `http://localhost:5000/images/products/${item.image}`
                  }
                  alt={item.name}
                  className="w-20 h-20 object-contain rounded border"
                />

                <div className="flex-1 flex justify-between items-center">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-gray-800">{item.name}</span>
                    <p className="text-sm text-gray-500">In Stock: {item.stock}</p>

                    <div className="flex items-center gap-2 mt-1">
                      <button
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-1 rounded font-bold"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1, item.stock)}
                        disabled={item.quantity === 1 || item.stock === 0}
                      >
                        −
                      </button>
                      <span className="font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1, item.stock)}
                        disabled={item.quantity >= item.stock || item.stock === 0}
                        className={`bg-gray-200 text-gray-800 px-2 py-1 rounded font-bold ${
                          item.quantity >= item.stock || item.stock === 0
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-gray-300'
                        }`}
                      >
                        +
                      </button>
                    </div>

                    {item.stock === 0 ? (
                      <p className="text-red-600 text-sm font-medium">Out of Stock</p>
                    ) : (
                      <button
                        className="text-green-600 hover:text-white hover:bg-green-600 transition px-2 py-1 rounded text-sm font-medium underline"
                        onClick={() => handleBuyNow(item)}
                      >
                        Buy Now
                      </button>
                    )}
                  </div>

                  <div className="text-right ml-4">
                    <p className="text-lg font-semibold text-blue-700">₹{item.price * item.quantity}</p>
                    <button
                      className="text-red-600 hover:text-white hover:bg-red-600 transition px-2 py-1 rounded text-sm font-medium mt-1 underline"
                      onClick={() => removeItem(item.productId)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 text-right">
            <p className="text-xl font-bold text-gray-800">
              Total: <span className="text-blue-700">₹{total}</span>
            </p>
          </div>

          <div className="mt-6 flex flex-col md:flex-row gap-4">
            <button
              onClick={clearCart}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded shadow transition"
            >
              🗑️ Clear Cart
            </button>
            <button
              onClick={handleCheckout}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded shadow transition"
            >
              ✅ Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
