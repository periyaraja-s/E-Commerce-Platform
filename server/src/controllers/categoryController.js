import mongoose from 'mongoose';
import Category from '../models/Category.js';

function slugify(value) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const memoryCategories = [
  { _id: 'cat_electronics', name: 'Electronics', slug: 'electronics', isActive: true },
  { _id: 'cat_clothing', name: 'Apparel & Fashion', slug: 'apparel-fashion', isActive: true },
  { _id: 'cat_home', name: 'Home & Living', slug: 'home-living', isActive: true },
  { _id: 'cat_books', name: 'Books & Media', slug: 'books-media', isActive: true },
];

export async function listCategories(_req, res) {
  if (mongoose.connection.readyState === 1) {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    return res.json({ success: true, data: categories });
  }

  return res.json({ success: true, data: memoryCategories.filter((c) => c.isActive) });
}

export async function createCategory(req, res) {
  const { name } = req.body;
  if (!name?.trim()) return res.status(422).json({ success: false, message: 'Category name is required' });

  const slug = slugify(name);

  if (mongoose.connection.readyState === 1) {
    const existing = await Category.findOne({ $or: [{ name: name.trim() }, { slug }] });
    if (existing) return res.status(409).json({ success: false, message: 'Category already exists' });

    const category = await Category.create({ name: name.trim(), slug });
    return res.status(201).json({ success: true, data: category });
  }

  const existing = memoryCategories.find((c) => c.name === name.trim() || c.slug === slug);
  if (existing) return res.status(409).json({ success: false, message: 'Category already exists' });

  const category = { _id: 'cat_' + Date.now(), name: name.trim(), slug, isActive: true };
  memoryCategories.push(category);
  return res.status(201).json({ success: true, data: category });
}

export async function updateCategory(req, res) {
  const { name, isActive } = req.body;

  if (mongoose.connection.readyState === 1) {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    if (name?.trim()) {
      category.name = name.trim();
      category.slug = slugify(name);
    }
    if (typeof isActive === 'boolean') category.isActive = isActive;
    await category.save();

    return res.json({ success: true, data: category });
  }

  const category = memoryCategories.find((c) => c._id === req.params.id);
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

  if (name?.trim()) {
    category.name = name.trim();
    category.slug = slugify(name);
  }
  if (typeof isActive === 'boolean') category.isActive = isActive;
  return res.json({ success: true, data: category });
}

export async function deleteCategory(req, res) {
  if (mongoose.connection.readyState === 1) {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    return res.json({ success: true, message: 'Category deleted' });
  }

  const index = memoryCategories.findIndex((c) => c._id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Category not found' });
  memoryCategories.splice(index, 1);
  return res.json({ success: true, message: 'Category deleted' });
}
