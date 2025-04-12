import { useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance';
import ProductModal from '../../components/ProductModal';
import { Plus, Pencil, Trash } from 'lucide-react';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await axios.get('/api/products');
    setProducts(res.data);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    await axios.delete(`/api/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchProducts();
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Manage Products</h2>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow transition"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const imageURL = product.image?.startsWith('/images/')
            ? `http://localhost:5000${product.image}`
            : `http://localhost:5000/images/products/${product.image}`;

          return (
            <div
              key={product._id}
              className="bg-white rounded-xl shadow hover:shadow-md hover:scale-[1.02] transition-all duration-200 p-4 space-y-3 border border-gray-300"
            >
              <img
                src={imageURL}
                alt={product.name}
                className="h-40 sm:h-44 md:h-48 w-full object-contain rounded"
              />
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                <p className="text-sm text-gray-500">{product.category}</p>
                <p className="text-blue-600 font-bold text-lg">₹{product.price}</p>
              </div>
              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => openEditModal(product)}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                >
                  <Pencil className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(product._id)}
                  className="flex items-center gap-1 text-sm text-red-600 hover:underline"
                >
                  <Trash className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <ProductModal
          product={editingProduct}
          onClose={() => setShowModal(false)}
          onRefresh={fetchProducts}
        />
      )}
    </div>
  );
}
