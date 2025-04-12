import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ✅ Admin-only: Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // exclude passwords
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// ✅ Authenticated route: Get current user's profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Include shipping info if available
    res.json({
      name: user.name,
      email: user.email,
      address: user.address || '',
      city: user.city || '',
      state: user.state || '',
      postalCode: user.postalCode || '',
      phone: user.phone || '',
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// Update profile
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { address, city, state, postalCode, phone } = req.body;

    user.address = address || user.address;
    user.city = city || user.city;
    user.state = state || user.state;
    user.postalCode = postalCode || user.postalCode;
    user.phone = phone || user.phone;

    await user.save();

    res.json({ message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile' });
  }
});


export default router;
