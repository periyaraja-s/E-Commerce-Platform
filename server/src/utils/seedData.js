import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Product from '../models/Product.js';

export async function seedInitialData() {
  if (mongoose.connection.readyState !== 1) return;

  try {
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

    const productCount = await Product.countDocuments();
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
      const defaultBooksId = catMap['books-media'] || categories[0]._id;

      await Product.insertMany([
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
    }
  } catch (err) {
    console.warn('[Seed] Data seeding skipped or failed:', err.message);
  }
}
