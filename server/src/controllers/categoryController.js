import Category from '../models/Category.js';

function slugify(value) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function listCategories(_req, res) {
  const categories = await Category.find({ isActive: true }).sort({ name: 1 });
  return res.json({ success: true, data: categories });
}

export async function createCategory(req, res) {
  const { name } = req.body;
  if (!name?.trim()) return res.status(422).json({ success: false, message: 'Category name is required' });

  const slug = slugify(name);
  const existing = await Category.findOne({ $or: [{ name: name.trim() }, { slug }] });
  if (existing) return res.status(409).json({ success: false, message: 'Category already exists' });

  const category = await Category.create({ name: name.trim(), slug });
  return res.status(201).json({ success: true, data: category });
}

export async function updateCategory(req, res) {
  const { name, isActive } = req.body;
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

export async function deleteCategory(req, res) {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
  return res.json({ success: true, message: 'Category deleted' });
}
