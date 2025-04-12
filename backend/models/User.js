// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'user' },
  address: String,
  city: String,
  state: String,
  postalCode: String,
  phone: String
}, {
  timestamps: true
});



export default mongoose.model('User', userSchema);
