// routes/deliveryRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { isDelivery } from '../middleware/authMiddleware.js';
import {
  getAllOrdersForDelivery,
  updateOrderStatusByDelivery,
} from '../controllers/deliveryController.js';

const router = express.Router();

// All routes below are protected and require delivery role
router.get('/orders', protect, isDelivery, getAllOrdersForDelivery);
router.put('/order/:id/status', protect, isDelivery, updateOrderStatusByDelivery);

export default router;
