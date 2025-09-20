import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext'; // 👈 import auth context

export default function ProductCard({ product, addToCart }) {
  const navigate = useNavigate();
  const { token } = useAuth(); // 👈 access token to check login

  const handleBuyNow = () => {
    if (!token) {
      toast.warning('Please login to buy products');
      return navigate('/login');
    }

    localStorage.setItem('buynow', JSON.stringify({ ...product, quantity: 1 }));
    navigate('/checkout');
  };

  const imageURL = product.image?.startsWith('/images/')
    ? `http://localhost:5000${product.image}`
    : `http://localhost:5000/images/products/${product.image}`;

  return (
    <div className="border rounded-2xl shadow-md p-4 bg-white hover:shadow-xl transition-transform duration-300 hover:-translate-y-1 space-y-2 relative">
      <img
        src={imageURL}
        alt={product.name}
        className="h-48 md:h-56 w-full object-contain rounded-lg bg-gray-100 p-2 transition-transform duration-300 ease-in-out hover:scale-105"
      />
      <h2 className="text-xl font-semibold text-gray-800">{product.name}</h2>
      <p className="text-gray-600 text-sm line-clamp-2 min-h-[2.5rem]">{product.description}</p>
      <p className="font-bold text-lg text-gray-800">
        ₹ <span className="text-blue-600 text-2xl">{product.price}</span>
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        {product.stock > 0 ? (
          <>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded w-full"
              onClick={() => addToCart(product)}
            >
              Add to Cart
            </button>
            <button
              aria-label="Buy this product now"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded w-full"
              onClick={handleBuyNow}
            >
              Buy Now
            </button>
          </>
        ) : (
          <button
            disabled
            className="bg-gray-400 cursor-not-allowed text-white px-4 py-1 rounded w-full"
          >
            Out of Stock
          </button>
        )}
      </div>
    </div>
  );
}
