
// --- routes/productRoutes.js ---
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/adminMiddleware.js';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
// productRoutes.js
import { upload } from '../middleware/uploadMiddleware.js'; 


const router = express.Router();

// Public
router.get('/', getProducts);

// Admin protected routes
router.post('/', protect, isAdmin, upload.single('image'), createProduct);
router.put('/:id', protect, isAdmin, upload.single('image'), updateProduct);
router.delete('/:id', protect, isAdmin, deleteProduct);

export default router;
