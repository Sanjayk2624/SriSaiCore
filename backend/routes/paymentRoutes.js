// UPDATED paymentRoutes.js with proper error handling and amount conversion

import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// Add verification that environment variables exist
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error('❌ Razorpay API keys missing in environment variables!');
}

// Add try/catch for Razorpay initialization
let razorpay;
try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  console.log('✅ Razorpay initialized successfully');
} catch (err) {
  console.error('❌ Failed to initialize Razorpay:', err);
}

// Create Razorpay order
router.post('/razorpay-order', async (req, res) => {
  console.log('📌 Razorpay order request received:', req.body);
  const { amount } = req.body;

  // Validate amount
  if (!amount || isNaN(amount)) {
    console.error('❌ Invalid amount:', amount);
    return res.status(400).json({ message: 'Valid amount is required' });
  }

  try {
    // Ensure amount is an integer (required by Razorpay)
    const amountInPaise = Math.round(amount);
    console.log('💰 Creating order for amount:', amountInPaise, 'paise');

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`,
    };

    console.log('🛠 Order options:', options);
    
    const order = await razorpay.orders.create(options);
    console.log('✅ Razorpay order created successfully:', order);

    res.json({ 
      id: order.id, 
      amount: order.amount, 
      currency: order.currency 
    });
  } catch (err) {
    console.error('❌ Error creating Razorpay order:', err);
    
    // More detailed error response
    let errorMessage = 'Failed to create Razorpay order';
    if (err.error && err.error.description) {
      errorMessage = err.error.description;
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    res.status(500).json({ 
      message: errorMessage,
      error: err.message 
    });
  }
});

// Verify Razorpay payment signature (optional - for future security)
router.post('/verify-signature', (req, res) => {
  const { order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const generated_signature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(order_id + '|' + razorpay_payment_id)
    .digest('hex');

  if (generated_signature === razorpay_signature) {
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, message: 'Invalid signature' });
  }
});

export default router;