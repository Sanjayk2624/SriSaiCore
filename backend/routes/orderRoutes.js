// --- routes/orderRoutes.js ---
import express from 'express';
import { createOrder, getOrders, getOrderById,getOrdersByUser,updateOrderStatus } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.get('/user/:email', getOrdersByUser);
router.get('/', protect, isAdmin, getOrders);
router.get('/:id', protect, isAdmin, getOrderById);
router.put('/:id', protect, isAdmin, updateOrderStatus); 

export default router;
