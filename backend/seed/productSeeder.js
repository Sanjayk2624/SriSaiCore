// --- seed/productSeed.js ---
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Product from '../models/Product.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Required for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load JSON manually
const productsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'products.json'), 'utf-8'));

const seed = async () => {
  console.log('Loaded MONGO_URI:', process.env.MONGO_URI);
  await mongoose.connect(process.env.MONGO_URI);
  await Product.deleteMany();
  await Product.insertMany(productsData);
  console.log('✅ Products seeded');
  process.exit();
};

seed();
