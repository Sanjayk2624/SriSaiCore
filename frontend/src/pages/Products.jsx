// pages/Products.jsx
import { useEffect, useState } from 'react';
import axios from '../utils/axiosInstance';
import ProductCard from '../components/ProductCard';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function Products() {
  const [products, setProducts] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    axios.get('/api/products')
      .then(res => setProducts(res.data))
      .catch(() => toast.error('Failed to fetch products'));
  }, []);

  const addToCart = async (product) => {
    if (!token) {
      toast.error('Please login to add items to your cart.');
      return;
    }

    try {
      await axios.post('/api/cart/add', {
        productId: product._id,
        quantity: 1
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success('Added to cart!');
      window.dispatchEvent(new Event('cartChange'));
    } catch (err) {
      console.error('Add to cart failed:', err);
      toast.error('Failed to add item to cart');
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto bg-white shadow-sm rounded-lg">
      <h1 className="text-3xl md:text-4xl font-extrabold  mb-8 text-center text-gray-900 tracking-tight">
        Explore Our Products
      </h1>
      {products.length === 0 ? (
        <p className="text-center text-gray-600">No products available.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 animate-fadeIn">
          {products.map((product) => (
            <div key={product._id} className="transition-transform hover:scale-[1.02]">
            <ProductCard product={product} addToCart={addToCart} />
          </div>
          ))}
        </div>
      )}
    </div>
  );
}
