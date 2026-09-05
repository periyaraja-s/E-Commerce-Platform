import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';

export const ADMIN_CREDENTIALS = {
  name: 'Store Administrator',
  email: process.env.ADMIN_EMAIL || 'admin@gmail.com',
  password: process.env.ADMIN_PASSWORD || 'admin@123',
  role: 'admin',
};

export const CUSTOMER_CREDENTIALS = {
  name: 'Demo Customer',
  email: process.env.CUSTOMER_EMAIL || 'customer@gmail.com',
  password: process.env.CUSTOMER_PASSWORD || 'admin@123',
  role: 'customer',
};

export async function seedInitialData() {
  if (mongoose.connection.readyState !== 1) return;

  try {
    // 1. Seed Categories
    const categoryCount = await Category.countDocuments();
    let categories = [];

    if (categoryCount === 0) {
      console.log('[Seed] Seeding initial categories...');
      categories = await Category.insertMany([
        { name: 'Electronics', slug: 'electronics', isActive: true },
        { name: 'Apparel & Fashion', slug: 'apparel-fashion', isActive: true },
        { name: 'Home & Living', slug: 'home-living', isActive: true },
        { name: 'Books & Media', slug: 'books-media', isActive: true },
        { name: 'Sports & Outdoors', slug: 'sports-outdoors', isActive: true },
      ]);
      console.log(`[Seed] Seeded ${categories.length} categories.`);
    } else {
      categories = await Category.find({ isActive: true });
    }

    // 2. Seed Products
    const productCount = await Product.countDocuments();
    let products = [];
    if (productCount === 0 && categories.length > 0) {
      console.log('[Seed] Seeding initial products...');
      const catMap = {};
      for (const c of categories) {
        catMap[c.slug] = c._id;
      }

      const defaultElectronicsId = catMap['electronics'] || categories[0]._id;
      const defaultFashionId = catMap['apparel-fashion'] || categories[0]._id;
      const defaultHomeId = catMap['home-living'] || categories[0]._id;
      const defaultSportsId = catMap['sports-outdoors'] || categories[0]._id;

      products = await Product.insertMany([
        {
          name: 'Wireless ANC Studio Headphones',
          slug: 'wireless-anc-studio-headphones',
          description: 'Experience pure acoustic immersion with active noise cancellation, custom 40mm drivers, and up to 35 hours of battery life.',
          price: 199.99,
          stock: 35,
          images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'],
          category: defaultElectronicsId,
          isActive: true,
        },
        {
          name: 'Mechanical RGB Gaming Keyboard',
          slug: 'mechanical-rgb-gaming-keyboard',
          description: 'Precision mechanical switches with customizable per-key RGB backlighting and durable aircraft-grade aluminum frame.',
          price: 119.5,
          stock: 45,
          images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80'],
          category: defaultElectronicsId,
          isActive: true,
        },
        {
          name: 'Classic Organic Cotton Crewneck',
          slug: 'classic-organic-cotton-crewneck',
          description: 'Timeless everyday crewneck crafted from 100% certified organic combed cotton with double-stitched hems.',
          price: 34.0,
          stock: 80,
          images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80'],
          category: defaultFashionId,
          isActive: true,
        },
        {
          name: 'Waterproof Minimalist Commuter Backpack',
          slug: 'waterproof-minimalist-commuter-backpack',
          description: 'Sleek weather-resistant rolltop backpack featuring a padded 16-inch laptop compartment and ergonomic ventilated shoulder straps.',
          price: 79.99,
          stock: 22,
          images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80'],
          category: defaultFashionId,
          isActive: true,
        },
        {
          name: 'Ceramic Pour-Over Coffee Maker Set',
          slug: 'ceramic-pour-over-coffee-maker-set',
          description: 'Artisan hand-glazed ceramic dripper with heat-resistant borosilicate glass carafe and reusable stainless steel mesh filter.',
          price: 48.0,
          stock: 18,
          images: ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80'],
          category: defaultHomeId,
          isActive: true,
        },
        {
          name: 'Ergonomic Memory Foam Lumbar Cushion',
          slug: 'ergonomic-memory-foam-lumbar-cushion',
          description: 'High-density contoured therapeutic cushion designed to relieve lower back strain during long work or study sessions.',
          price: 39.95,
          stock: 60,
          images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80'],
          category: defaultHomeId,
          isActive: true,
        },
        {
          name: 'Insulated Stainless Steel Hydration Bottle',
          slug: 'insulated-stainless-steel-hydration-bottle',
          description: 'Double-wall vacuum insulation keeps liquids cold for 24 hours or hot for 12 hours. BPA-free leak-proof lid included.',
          price: 28.5,
          stock: 90,
          images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80'],
          category: defaultSportsId,
          isActive: true,
        },
        {
          name: 'Ultra-Grip Natural Rubber Yoga Mat',
          slug: 'ultra-grip-natural-rubber-yoga-mat',
          description: 'Eco-friendly biodegradable natural tree rubber surface with laser-etched alignment guides and dense supportive cushioning.',
          price: 64.0,
          stock: 15,
          images: ['https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=800&q=80'],
          category: defaultSportsId,
          isActive: true,
        },
      ]);
      console.log('[Seed] Initial products seeded successfully.');
    } else {
      products = await Product.find({ isActive: true });
    }

    // 3. Seed Admin Account
    let adminUser = await User.findOne({ email: ADMIN_CREDENTIALS.email });
    if (!adminUser) {
      console.log(`[Seed] Creating initial admin account (${ADMIN_CREDENTIALS.email})...`);
      const hashedPassword = await bcrypt.hash(ADMIN_CREDENTIALS.password, 10);
      adminUser = await User.create({
        name: ADMIN_CREDENTIALS.name,
        email: ADMIN_CREDENTIALS.email,
        password: hashedPassword,
        role: 'admin',
        isActive: true,
      });
      console.log('[Seed] Admin account created successfully.');
    }

    // 4. Seed Customer Account
    let customerUser = await User.findOne({ email: CUSTOMER_CREDENTIALS.email });
    if (!customerUser) {
      console.log(`[Seed] Creating initial customer account (${CUSTOMER_CREDENTIALS.email})...`);
      const hashedPassword = await bcrypt.hash(CUSTOMER_CREDENTIALS.password, 10);
      customerUser = await User.create({
        name: CUSTOMER_CREDENTIALS.name,
        email: CUSTOMER_CREDENTIALS.email,
        password: hashedPassword,
        role: 'customer',
        isActive: true,
      });
      console.log('[Seed] Customer account created successfully.');
    }

    // 5. Seed Sample Orders if empty
    const orderCount = await Order.countDocuments();
    if (orderCount === 0 && customerUser && products.length > 0) {
      console.log('[Seed] Seeding sample orders for customer and admin dashboard...');
      const sampleAddress = {
        name: customerUser.name,
        phone: '+1 (555) 234-5678',
        line1: '742 Evergreen Terrace',
        city: 'Springfield',
        state: 'Oregon',
        postalCode: '97477',
        country: 'United States',
      };

      const now = new Date();
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

      await Order.create([
        {
          user: customerUser._id,
          items: [
            {
              product: products[0]._id,
              name: products[0].name,
              price: products[0].price,
              quantity: 1,
            },
            {
              product: products[2]._id,
              name: products[2].name,
              price: products[2].price,
              quantity: 2,
            },
          ],
          shippingAddress: sampleAddress,
          subtotal: products[0].price + products[2].price * 2,
          shippingFee: 0,
          total: products[0].price + products[2].price * 2,
          status: 'confirmed',
          paymentStatus: 'paid',
          createdAt: now,
          updatedAt: now,
        },
        {
          user: customerUser._id,
          items: [
            {
              product: products[1]._id,
              name: products[1].name,
              price: products[1].price,
              quantity: 1,
            },
          ],
          shippingAddress: sampleAddress,
          subtotal: products[1].price,
          shippingFee: 9.99,
          total: products[1].price + 9.99,
          status: 'pending',
          paymentStatus: 'pending',
          createdAt: now,
          updatedAt: now,
        },
        {
          user: customerUser._id,
          items: [
            {
              product: products[3]._id,
              name: products[3].name,
              price: products[3].price,
              quantity: 1,
            },
            {
              product: products[4]._id,
              name: products[4].name,
              price: products[4].price,
              quantity: 1,
            },
          ],
          shippingAddress: sampleAddress,
          subtotal: products[3].price + products[4].price,
          shippingFee: 0,
          total: products[3].price + products[4].price,
          status: 'delivered',
          paymentStatus: 'paid',
          createdAt: yesterday,
          updatedAt: yesterday,
        },
        {
          user: customerUser._id,
          items: [
            {
              product: products[5]._id,
              name: products[5].name,
              price: products[5].price,
              quantity: 1,
            },
          ],
          shippingAddress: sampleAddress,
          subtotal: products[5].price,
          shippingFee: 4.99,
          total: products[5].price + 4.99,
          status: 'delivered',
          paymentStatus: 'paid',
          createdAt: threeDaysAgo,
          updatedAt: threeDaysAgo,
        },
      ]);
      console.log('[Seed] Sample orders created successfully.');
    }

    // 6. Seed Cart items for customer if empty
    if (customerUser && products.length > 2) {
      const existingCart = await Cart.findOne({ user: customerUser._id });
      if (!existingCart) {
        await Cart.create({
          user: customerUser._id,
          items: [
            { product: products[0]._id, quantity: 1 },
            { product: products[3]._id, quantity: 2 },
          ],
        });
        console.log('[Seed] Sample cart seeded for customer.');
      }
    }
  } catch (err) {
    console.warn('[Seed] Data seeding skipped or failed:', err.message);
  }
}
