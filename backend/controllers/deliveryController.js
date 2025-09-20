// controllers/deliveryController.js
import Order from '../models/Order.js';

export const getAllOrdersForDelivery = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders for delivery' });
  }
};

export const updateOrderStatusByDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Only allow status update
    if (status) order.status = status;

    // Only allow changing paymentStatus to Paid if it's a COD order
    if (order.paymentMethod === 'COD' && paymentStatus === 'Paid') {
      order.paymentStatus = 'Paid';
    }

    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update order' });
  }
};
