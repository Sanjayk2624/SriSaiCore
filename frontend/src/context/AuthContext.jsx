// src/context/AuthContext.jsx
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const storedToken = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  const initialToken = storedToken && storedToken !== 'undefined' ? storedToken : null;
  const initialUser = storedUser ? JSON.parse(storedUser) : null;

  
  const [token, setToken] = useState(initialToken);
  const [user, setUser] = useState(initialUser);

  const login = (newToken, userData) => {
    if (!newToken || newToken === 'undefined') return;
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userEmail', userData.email);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    const email = localStorage.getItem('userEmail');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (email && cart.length > 0) {
      localStorage.setItem(`cart_${email}`, JSON.stringify(cart));
    }

    localStorage.clear();
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
