// --- controllers/orderController.js ---
// --- controllers/orderController.js ---
import Order from '../models/Order.js';
import Product from '../models/Product.js'; 

// 🧾 Create a new order
export const createOrder = async (req, res) => {
  try {
    const {
      userId,
      items,
      total,
      shipping,
      paymentMethod,
      transactionId,
      paymentStatus // ✅ Capture this if provided
    } = req.body;

    const order = await Order.create({
      userId,
      items,
      total,
      shipping,
      paymentMethod,
      transactionId,
      paymentStatus: paymentStatus || (paymentMethod === 'Online' ? 'Paid' : 'Pending'),
      status: 'Pending'
    });

    // ✅ Reduce stock for each product
    for (const item of items) {
      const product = await Product.findOne({ name: item.name }); // or use productId if available
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
        await product.save();
      }
    }

    res.status(201).json(order);
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

// 📦 Get all orders (Admin)
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// 🔎 Get order by ID (for invoice)
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch order' });
  }
};

// 🧑‍💼 Get orders for a specific user
export const getOrdersByUser = async (req, res) => {
  const { email } = req.params;
  try {
    const orders = await Order.find({ 'shipping.email': email }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// 🚚 Admin: update status (e.g. Pending → Shipped/Delivered)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body; // ✅ Destructure both fields

    const updatedFields = {};
    if (status) updatedFields.status = status;
    if (paymentStatus) updatedFields.paymentStatus = paymentStatus;

    const updatedOrder = await Order.findByIdAndUpdate(id, updatedFields, {
      new: true,
    });

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(updatedOrder);
  } catch (err) {
    console.error('Error updating order status or payment status:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


