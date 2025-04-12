// pages/Home.jsx/ 
// pages/Home.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(true);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    const wasLoggedOut = sessionStorage.getItem('loggedOut');

    const fadeOutTimer = setTimeout(() => {
      setVisible(false);
    }, 1500);

    const redirectTimer = setTimeout(() => {
      if (wasLoggedOut) {
        sessionStorage.removeItem('loggedOut');
        // ✅ Instead of return, we just show fallback
        setShowFallback(true);
        return;
      }

      const user = JSON.parse(localStorage.getItem('user'));
      if (user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/products');
      }
    }, 2500);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(redirectTimer);
    };
  }, [navigate]);

  if (showFallback) {
    // ✅ fallback content if redirected from logout
    return (
      <div className="text-center mt-20">
        <h1 className="text-3xl font-bold mb-4">Sai Engineering</h1>
        <p className="text-gray-600 text-lg">Please login or view products.</p>
        <button
          onClick={() => navigate('/products')}
          className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 z-[9999] transition-opacity duration-1000 ease-in-out ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <img
        src="/assets/bg.jpg"
        alt="Welcome to Sai Engineering"
        className="w-full h-full object-cover object-center md:object-contain lg:object-fill"
      />
    </div>
  );
}
