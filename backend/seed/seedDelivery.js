// seed/seedDelivery.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const seedDelivery = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existingDelivery = await User.findOne({ email: 'delivery@saishell.com' });
    if (existingDelivery) {
      console.log('🚚 Delivery user already exists');
      return process.exit();
    }

    const hashedPassword = await bcrypt.hash('delivery123', 10);

    await User.create({
      name: 'Delivery Staff',
      email: 'delivery@saishell.com',
      password: hashedPassword,
      role: 'delivery',
    });

    console.log('✅ Delivery user created');
    process.exit();
  } catch (err) {
    console.error('❌ Delivery seed failed:', err);
    process.exit(1);
  }
};

seedDelivery();
