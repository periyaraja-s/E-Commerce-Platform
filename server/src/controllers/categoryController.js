import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { memoryProducts } from './productController.js';

function slugify(value) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const memoryCategories = [
  {
    _id: 'cat_electronics',
    name: 'Electronics',
    slug: 'electronics',
    description: 'High-performance audio, gaming peripherals, and smart accessories.',
    isActive: true,
  },
  {
    _id: 'cat_clothing',
    name: 'Apparel & Fashion',
    slug: 'apparel-fashion',
    description: 'Premium sustainable apparel, everyday wear, and travel essentials.',
    isActive: true,
  },
  {
    _id: 'cat_home',
    name: 'Home & Living',
    slug: 'home-living',
    description: 'Artisan home decor, ergonomic office goods, and kitchenware.',
    isActive: true,
  },
  {
    _id: 'cat_books',
    name: 'Books & Media',
    slug: 'books-media',
    description: 'Curated literature, design publications, and multimedia.',
    isActive: true,
  },
  {
    _id: 'cat_sports',
    name: 'Sports & Outdoors',
    slug: 'sports-outdoors',
    description: 'Durable athletic equipment, hydration gear, and outdoor essentials.',
    isActive: true,
  },
];

export { memoryCategories };

export async function listCategories(req, res) {
  const includeAll = req.query.all === 'true' || req.query.includeInactive === 'true';
  const filter = includeAll ? {} : { isActive: true };

  if (mongoose.connection.readyState === 1) {
    const categories = await Category.find(filter).sort({ name: 1 });
    const categoriesWithCount = await Promise.all(
      categories.map(async (c) => {
        const productCount = await Product.countDocuments({ category: c._id, isActive: true });
        const obj = c.toObject();
        obj.productCount = productCount;
        return obj;
      })
    );
    return res.json({ success: true, data: categoriesWithCount });
  }

  const list = includeAll ? memoryCategories : memoryCategories.filter((c) => c.isActive);
  const data = list.map((c) => {
    const productCount = memoryProducts.filter(
      (p) => (p.category?._id === c._id || p.category === c._id || p.category?.slug === c.slug) && p.isActive
    ).length;
    return { ...c, productCount };
  });

  return res.json({ success: true, data });
}

export async function createCategory(req, res) {
  const { name, description, isActive } = req.body;
  if (!name?.trim()) return res.status(422).json({ success: false, message: 'Category name is required' });

  const slug = slugify(name);

  if (mongoose.connection.readyState === 1) {
    const existing = await Category.findOne({ $or: [{ name: name.trim() }, { slug }] });
    if (existing) return res.status(409).json({ success: false, message: 'Category already exists' });

    const category = await Category.create({
      name: name.trim(),
      slug,
      description: description?.trim() || '',
      isActive: typeof isActive === 'boolean' ? isActive : true,
    });
    const obj = category.toObject();
    obj.productCount = 0;
    return res.status(201).json({ success: true, data: obj, message: 'Category created successfully' });
  }

  const existing = memoryCategories.find((c) => c.name.toLowerCase() === name.trim().toLowerCase() || c.slug === slug);
  if (existing) return res.status(409).json({ success: false, message: 'Category already exists' });

  const category = {
    _id: 'cat_' + Date.now(),
    name: name.trim(),
    slug,
    description: description?.trim() || '',
    isActive: typeof isActive === 'boolean' ? isActive : true,
    productCount: 0,
  };
  memoryCategories.push(category);
  return res.status(201).json({ success: true, data: category, message: 'Category created successfully' });
}

export async function updateCategory(req, res) {
  const { name, description, isActive } = req.body;

  if (mongoose.connection.readyState === 1) {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    if (name?.trim()) {
      category.name = name.trim();
      category.slug = slugify(name);
    }
    if (description !== undefined) category.description = description.trim();
    if (typeof isActive === 'boolean') category.isActive = isActive;
    await category.save();

    const productCount = await Product.countDocuments({ category: category._id, isActive: true });
    const obj = category.toObject();
    obj.productCount = productCount;

    return res.json({ success: true, data: obj, message: 'Category updated successfully' });
  }

  const category = memoryCategories.find((c) => c._id === req.params.id);
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

  if (name?.trim()) {
    category.name = name.trim();
    category.slug = slugify(name);
  }
  if (description !== undefined) category.description = description.trim();
  if (typeof isActive === 'boolean') category.isActive = isActive;

  const productCount = memoryProducts.filter(
    (p) => (p.category?._id === category._id || p.category === category._id || p.category?.slug === category.slug) && p.isActive
  ).length;
  category.productCount = productCount;

  return res.json({ success: true, data: category, message: 'Category updated successfully' });
}

export async function deleteCategory(req, res) {
  const { id } = req.params;

  if (mongoose.connection.readyState === 1) {
    // Check if products are associated with this category
    const productCount = await Product.countDocuments({ category: id, isActive: true });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category: ${productCount} active product(s) are associated with this category. Please reassign or remove the products first.`,
      });
    }

    const category = await Category.findByIdAndDelete(id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    return res.json({ success: true, message: 'Category deleted successfully' });
  }

  const productCount = memoryProducts.filter(
    (p) => (p.category?._id === id || p.category === id || p.category?.slug === id) && p.isActive
  ).length;
  if (productCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete category: ${productCount} active product(s) are associated with this category. Please reassign or remove the products first.`,
    });
  }

  const index = memoryCategories.findIndex((c) => c._id === id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Category not found' });
  memoryCategories.splice(index, 1);
  return res.json({ success: true, message: 'Category deleted successfully' });
}
