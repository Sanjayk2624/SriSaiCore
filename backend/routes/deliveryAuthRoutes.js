import express from 'express';
import jwt from 'jsonwebtoken';
const router = express.Router();

// Hardcoded credentials
const DELIVERY_EMAIL = 'delivery@saishell.com';
const DELIVERY_PASSWORD = 'delivery123';

// Generate JWT with delivery role
const generateToken = (email) => {
  return jwt.sign({ email, role: 'delivery' }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// POST /api/delivery-auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (email === DELIVERY_EMAIL && password === DELIVERY_PASSWORD) {
    const token = generateToken(email);
    return res.json({
      token,
      user: {
        email,
        role: 'delivery',
      },
    });
  }

  return res.status(401).json({ message: 'Invalid credentials' });
});

export default router;
