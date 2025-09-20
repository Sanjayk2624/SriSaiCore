// --- controllers/productController.js ---
import Product from '../models/Product.js';
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
export const createProduct = async (req, res) => {
  const { name, description, price, category, stock } = req.body;
  const image = req.file ? req.file.filename : '';

  const product = await Product.create({
    name, description, price, category, stock, image
  });

  res.status(201).json(product);
};
export const updateProduct = async (req, res) => {
  const { name, description, price, category, stock } = req.body;
  const image = req.file ? req.file.filename : undefined;

  const updatedFields = { name, description, price, category, stock };
  if (image) updatedFields.image = image;

  const updated = await Product.findByIdAndUpdate(req.params.id, updatedFields, { new: true });
  res.json(updated);
};
export const deleteProduct = async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deletesd' });
};

// ✅ Get a single product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch product', error: err.message });
  }
};