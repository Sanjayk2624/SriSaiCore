import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js'; // ✅ Corrected path

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

const createAdmin = async () => {
  const adminEmail = 'admin@example.com';
  const existingAdmin = await User.findOne({ email: adminEmail });

  if (existingAdmin) {
    console.log('⚠️ Admin already exists');
    return;
  }

  const hashedPassword = await bcrypt.hash('admin123', 10);

  await User.create({
    name: 'Admin',
    email: adminEmail,
    password: hashedPassword,
    role: 'admin',
  });

  console.log('✅ Admin user created');
};

const run = async () => {
  await connectDB();
  await createAdmin();
  mongoose.disconnect();
};

run();
