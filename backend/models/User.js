// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['user', 'admin', 'delivery'],
    default: 'user',
  },
  address: String,
  city: String,
  state: String,
  postalCode: String,
  phone: String,
}, { timestamps: true });

export default mongoose.model('User', userSchema);

