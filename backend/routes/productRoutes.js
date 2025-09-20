import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/adminMiddleware.js';
import { 
  getProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../controllers/productController.js';
import { upload } from '../middleware/uploadMiddleware.js'; 

// Import the new getProductById controller
import { getProductById } from '../controllers/productController.js';

const router = express.Router();

// Public
router.get('/', getProducts);

// ✅ Add route to fetch a single product by ID (public)
router.get('/:id', getProductById); // <-- New route for fetching product by ID

// Admin protected routes
router.post('/', protect, isAdmin, upload.single('image'), createProduct);
router.put('/:id', protect, isAdmin, upload.single('image'), updateProduct);
router.delete('/:id', protect, isAdmin, deleteProduct);

export default router;
