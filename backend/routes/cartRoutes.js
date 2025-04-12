import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected — only logged-in users can access them
router.use(protect);

// GET current user's cart
router.get('/', getCart);

// POST add an item to cart
router.post('/add', addToCart);

// PUT update quantity of an item
router.put('/update', updateCartItem);

// DELETE remove a specific item
router.delete('/remove/:productId', removeFromCart);

// DELETE clear entire cart
router.delete('/clear', clearCart);

export default router;
