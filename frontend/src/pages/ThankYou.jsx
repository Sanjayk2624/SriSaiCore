import { Link } from 'react-router-dom';

export default function ThankYou() {
  return (
    <div className="p-6 max-w-xl mx-auto text-center">
      <h1 className="text-3xl font-bold text-green-600 mb-4">Thank you for your order!</h1>
      <p className="text-gray-700 mb-6">We've received your order and will begin processing shortly.</p>
      <Link
        to="/products"
        className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
