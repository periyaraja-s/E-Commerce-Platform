import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { memoryCategories } from '../controllers/categoryController.js';
import { memoryProducts } from '../controllers/productController.js';

export const INITIAL_CATEGORIES = [
  {
    name: 'Electronics',
    slug: 'electronics',
    description: 'High-performance audio, gaming peripherals, and smart accessories.',
    isActive: true,
  },
  {
    name: 'Apparel & Fashion',
    slug: 'apparel-fashion',
    description: 'Premium sustainable apparel, everyday wear, and travel essentials.',
    isActive: true,
  },
  {
    name: 'Home & Living',
    slug: 'home-living',
    description: 'Artisan home decor, ergonomic office goods, and kitchenware.',
    isActive: true,
  },
  {
    name: 'Books & Media',
    slug: 'books-media',
    description: 'Curated literature, design publications, and multimedia.',
    isActive: true,
  },
  {
    name: 'Sports & Outdoors',
    slug: 'sports-outdoors',
    description: 'Durable athletic equipment, hydration gear, and outdoor essentials.',
    isActive: true,
  },
];

export async function migrateCategoriesAndProducts() {
  if (mongoose.connection.readyState !== 1) {
    // In-memory synchronization fallback
    syncMemoryCategories();
    return;
  }

  try {
    console.log('[Migration] Verifying Category records and Product -> Category relationships...');

    // 1. Ensure all default categories exist in MongoDB
    const categoryDocMap = new Map();

    for (const cat of INITIAL_CATEGORIES) {
      let existing = await Category.findOne({
        $or: [{ slug: cat.slug }, { name: cat.name }],
      });

      if (!existing) {
        existing = await Category.create(cat);
        console.log(`[Migration] Created missing category: ${cat.name} (${cat.slug})`);
      } else if (!existing.description && cat.description) {
        existing.description = cat.description;
        await existing.save();
      }
      categoryDocMap.set(cat.slug, existing);
      categoryDocMap.set(cat.name.toLowerCase(), existing);
      categoryDocMap.set(existing._id.toString(), existing);
    }

    // Also fetch any other user-created categories into map
    const allCategories = await Category.find();
    for (const c of allCategories) {
      categoryDocMap.set(c.slug, c);
      categoryDocMap.set(c.name.toLowerCase(), c);
      categoryDocMap.set(c._id.toString(), c);
    }

    const fallbackCategory = allCategories[0] || categoryDocMap.get('electronics');

    // 2. Inspect all products and ensure valid ObjectId Category reference
    const allProducts = await Product.find();
    let migratedCount = 0;

    for (const product of allProducts) {
      let needsUpdate = false;
      let targetCategoryId = null;

      if (!product.category) {
        targetCategoryId = fallbackCategory._id;
        needsUpdate = true;
      } else if (typeof product.category === 'string') {
        const catStr = product.category.trim();
        const matched =
          categoryDocMap.get(catStr.toLowerCase()) ||
          categoryDocMap.get(catStr) ||
          fallbackCategory;
        targetCategoryId = matched._id;
        needsUpdate = true;
      } else if (mongoose.isValidObjectId(product.category)) {
        const existingCat = categoryDocMap.get(product.category.toString());
        if (!existingCat) {
          // Pointed to non-existent category ID
          targetCategoryId = fallbackCategory._id;
          needsUpdate = true;
        }
      }

      if (needsUpdate && targetCategoryId) {
        product.category = targetCategoryId;
        await product.save();
        migratedCount++;
      }
    }

    console.log(
      `[Migration] Category verification complete. Categories: ${allCategories.length}, Products checked: ${allProducts.length}, Migrated: ${migratedCount}.`
    );
  } catch (err) {
    console.error('[Migration] Category migration warning:', err.message);
  }
}

function syncMemoryCategories() {
  // Synchronize memory categories
  for (const cat of INITIAL_CATEGORIES) {
    const exists = memoryCategories.find((c) => c.slug === cat.slug || c.name === cat.name);
    if (!exists) {
      memoryCategories.push({
        _id: 'cat_' + cat.slug,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        isActive: true,
      });
    } else if (!exists.description) {
      exists.description = cat.description;
    }
  }

  // Ensure memory products point to valid memory category objects
  for (const prod of memoryProducts) {
    if (!prod.category || typeof prod.category === 'string') {
      const slugOrId = String(prod.category || '').toLowerCase();
      const match =
        memoryCategories.find((c) => c.slug === slugOrId || c._id === slugOrId || c.name.toLowerCase() === slugOrId) ||
        memoryCategories[0];
      prod.category = match;
    }
  }
}
