import { useAuth } from '../context/AuthContext';
import { FaFacebookF, FaInstagram, FaTwitter, FaWhatsapp } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function Footer() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <footer className="bg-gray-900 text-white py-8 mt-10">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Brand Info */}
        <div>
          <h3 className="text-lg font-bold mb-2">Sai Engineering</h3>
          <p className="text-gray-400 text-sm">
            Quality Shell Core products at your doorstep. Built with trust and innovation.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-md font-semibold mb-2">Quick Links</h4>
          <ul className="space-y-1 text-sm text-gray-300">
            {isAdmin ? (
              <>
                <li><Link to="/admin/products" className="hover:underline">Manage Products</Link></li>
                <li><Link to="/admin/orders" className="hover:underline">View Orders</Link></li>
                <li><Link to="/admin/users" className="hover:underline">Manage Users</Link></li>
              </>
            ) : (
              <>
                <li><Link to="/products" className="hover:underline">Products</Link></li>
                <li><Link to="/orders" className="hover:underline">My Orders</Link></li>
                <li><Link to="/cart" className="hover:underline">Cart</Link></li>
                <li><Link to="/about" className="hover:underline">About Us</Link></li>

              </>
            )}
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-md font-semibold mb-2">Contact Us</h4>
          <ul className="space-y-1 text-sm text-gray-300">
            <li>Email: <a href="mailto:ssaiengineering@gmail.com" className="hover:underline">ssaiengineering@gmail.com</a></li>
            <li>Phone: <a href="tel:+919876543210" className="hover:underline">+91 96554 77553</a></li>
            <li>Address: 301/5C, Kalaivani Nagar, IIrugur, Coimbatore, Tamil Nadu</li>
          </ul>
        </div>

        {/* Social & Support */}
        <div>
          <h4 className="text-md font-semibold mb-2">Connect & Support</h4>
          <div className="flex gap-4 text-gray-300 text-lg mb-3">
            <a href="https://facebook.com" target="_blank" rel="noreferrer"><FaFacebookF /></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer"><FaInstagram /></a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer"><FaTwitter /></a>
            <a href="https://wa.me/919655477553" target="_blank" rel="noreferrer"><FaWhatsapp /></a>
          </div>
          <a
            href="mailto:support@sai-engineering.com"
            className="block text-center bg-green-600 hover:bg-green-700 text-white py-1.5 rounded text-sm font-medium transition"
          >
            📩 Contact Support
          </a>
        </div>
      </div>

      <div className="mt-6 text-center text-gray-500 text-sm border-t border-gray-700 pt-4">
        &copy; {new Date().getFullYear()} Sai Engineering. All rights reserved.
      </div>
    </footer>
  );
}
