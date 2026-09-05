import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

function slugify(value) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const memoryProducts = [
  {
    _id: 'prod_1',
    name: 'Wireless Noise-Canceling Headphones',
    slug: 'wireless-headphones',
    description: 'Premium over-ear headphones with high-fidelity sound and active noise cancellation.',
    price: 199.99,
    stock: 25,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'],
    category: { _id: 'cat_electronics', name: 'Electronics', slug: 'electronics' },
    isActive: true,
  },
  {
    _id: 'prod_2',
    name: 'Ergonomic Mechanical Keyboard',
    slug: 'ergonomic-keyboard',
    description: 'Customizable RGB mechanical keyboard with tactile switches.',
    price: 89.99,
    stock: 40,
    images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80'],
    category: { _id: 'cat_electronics', name: 'Electronics', slug: 'electronics' },
    isActive: true,
  },
  {
    _id: 'prod_3',
    name: 'Organic Cotton T-Shirt',
    slug: 'organic-cotton-tshirt',
    description: 'Breathable and sustainably sourced premium everyday cotton crewneck.',
    price: 29.5,
    stock: 100,
    images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80'],
    category: { _id: 'cat_clothing', name: 'Apparel & Fashion', slug: 'apparel-fashion' },
    isActive: true,
  },
];

export async function listProducts(req, res) {
  if (mongoose.connection.readyState === 1) {
    const { search, category, minPrice, maxPrice, sort = '-createdAt', page = 1, limit = 12 } = req.query;
    const filter = { isActive: true };

    if (search?.trim()) {
      const sanitized = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: { $regex: sanitized, $options: 'i' } },
        { description: { $regex: sanitized, $options: 'i' } },
      ];
    }

    if (category && category !== 'all') {
      if (mongoose.isValidObjectId(category)) {
        filter.category = category;
      } else {
        const catDoc = await Category.findOne({ slug: category });
        if (catDoc) {
          filter.category = catDoc._id;
        } else {
          // No category matched this slug
          return res.json({
            success: true,
            data: [],
            pagination: { page: 1, limit: Number(limit) || 12, total: 0, pages: 0 },
          });
        }
      }
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice && !isNaN(Number(minPrice))) filter.price.$gte = Number(minPrice);
      if (maxPrice && !isNaN(Number(maxPrice))) filter.price.$lte = Number(maxPrice);
    }

    const allowedSorts = ['price', '-price', 'name', '-name', 'createdAt', '-createdAt'];
    const safeSort = allowedSorts.includes(sort) ? sort : '-createdAt';
    const pageNumber = Math.max(Number(page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(limit) || 12, 1), 50);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .sort(safeSort)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize),
      Product.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: products,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        pages: Math.ceil(total / pageSize) || 1,
      },
    });
  }

  // Fallback in-memory
  let items = memoryProducts.filter((p) => p.isActive);
  const { search, category, sort = '-createdAt', page = 1, limit = 12 } = req.query;

  if (search?.trim()) {
    const s = search.trim().toLowerCase();
    items = items.filter((p) => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s));
  }

  if (category && category !== 'all') {
    items = items.filter(
      (p) => p.category?.slug === category || p.category?._id === category || p.category === category
    );
  }

  if (sort === 'price') items.sort((a, b) => a.price - b.price);
  if (sort === '-price') items.sort((a, b) => b.price - a.price);
  if (sort === 'name') items.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === '-name') items.sort((a, b) => b.name.localeCompare(a.name));

  const pageNumber = Math.max(Number(page) || 1, 1);
  const pageSize = Math.min(Math.max(Number(limit) || 12, 1), 50);
  const total = items.length;
  const pagedItems = items.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

  return res.json({
    success: true,
    data: pagedItems,
    pagination: { page: pageNumber, limit: pageSize, total, pages: Math.ceil(total / pageSize) || 1 },
  });
}

export async function getProduct(req, res) {
  const { id } = req.params;
  if (!id) return res.status(400).json({ success: false, message: 'Product ID is required' });

  if (mongoose.connection.readyState === 1) {
    const isObjectId = mongoose.isValidObjectId(id);
    const query = isObjectId ? { _id: id } : { slug: id };
    const product = await Product.findOne({ ...query, isActive: true }).populate('category', 'name slug');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    return res.json({ success: true, data: product });
  }

  const product = memoryProducts.find((p) => (p._id === id || p.slug === id) && p.isActive);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  return res.json({ success: true, data: product });
}

export async function createProduct(req, res) {
  const { name, slug, description, price, stock, images, category } = req.body;

  if (!name?.trim()) {
    return res.status(422).json({ success: false, message: 'Product name is required' });
  }
  if (!description?.trim()) {
    return res.status(422).json({ success: false, message: 'Product description is required' });
  }
  if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
    return res.status(422).json({ success: false, message: 'Valid non-negative price is required' });
  }
  if (!category) {
    return res.status(422).json({ success: false, message: 'Product category is required' });
  }

  const numericStock = stock !== undefined && !isNaN(Number(stock)) ? Math.max(0, Math.floor(Number(stock))) : 0;
  let finalSlug = slug?.trim() ? slugify(slug) : slugify(name);
  if (!finalSlug) finalSlug = 'product-' + Date.now().toString(36);

  if (mongoose.connection.readyState === 1) {
    // Check if slug is unique, append unique suffix if needed
    const existing = await Product.findOne({ slug: finalSlug });
    if (existing) {
      finalSlug = `${finalSlug}-${Date.now().toString(36).slice(-4)}`;
    }

    const newProduct = await Product.create({
      name: name.trim(),
      slug: finalSlug,
      description: description.trim(),
      price: Number(price),
      stock: numericStock,
      images: Array.isArray(images) && images.length > 0 ? images.filter(Boolean) : [],
      category,
      isActive: true,
    });

    const populated = await Product.findById(newProduct._id).populate('category', 'name slug');
    return res.status(201).json({ success: true, message: 'Product created successfully', data: populated });
  }

  const product = {
    _id: 'prod_' + Date.now(),
    name: name.trim(),
    slug: finalSlug,
    description: description.trim(),
    price: Number(price),
    stock: numericStock,
    images: Array.isArray(images) && images.length > 0 ? images.filter(Boolean) : [],
    category: typeof category === 'object' ? category : { _id: category, name: 'Category' },
    isActive: true,
  };
  memoryProducts.push(product);
  return res.status(201).json({ success: true, message: 'Product created successfully', data: product });
}

export async function updateProduct(req, res) {
  const { id } = req.params;
  const { name, slug, description, price, stock, images, category, isActive } = req.body;

  if (price !== undefined && (isNaN(Number(price)) || Number(price) < 0)) {
    return res.status(422).json({ success: false, message: 'Price must be a non-negative number' });
  }
  if (stock !== undefined && (isNaN(Number(stock)) || Number(stock) < 0)) {
    return res.status(422).json({ success: false, message: 'Stock must be a non-negative number' });
  }

  if (mongoose.connection.readyState === 1) {
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    if (name?.trim()) product.name = name.trim();
    if (description?.trim()) product.description = description.trim();
    if (price !== undefined) product.price = Number(price);
    if (stock !== undefined) product.stock = Math.max(0, Math.floor(Number(stock)));
    if (category) product.category = category;
    if (Array.isArray(images)) product.images = images.filter(Boolean);
    if (typeof isActive === 'boolean') product.isActive = isActive;
    if (slug?.trim()) {
      const formattedSlug = slugify(slug);
      const existingSlug = await Product.findOne({ slug: formattedSlug, _id: { $ne: id } });
      if (existingSlug) {
        return res.status(409).json({ success: false, message: 'Slug is already in use by another product' });
      }
      product.slug = formattedSlug;
    }

    await product.save();
    const populated = await Product.findById(product._id).populate('category', 'name slug');
    return res.json({ success: true, message: 'Product updated successfully', data: populated });
  }

  const product = memoryProducts.find((p) => p._id === id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  if (name?.trim()) product.name = name.trim();
  if (description?.trim()) product.description = description.trim();
  if (price !== undefined) product.price = Number(price);
  if (stock !== undefined) product.stock = Math.max(0, Math.floor(Number(stock)));
  if (category) product.category = typeof category === 'object' ? category : { _id: category, name: 'Category' };
  if (Array.isArray(images)) product.images = images.filter(Boolean);
  if (typeof isActive === 'boolean') product.isActive = isActive;
  if (slug?.trim()) product.slug = slugify(slug);

  return res.json({ success: true, message: 'Product updated successfully', data: product });
}

export async function deleteProduct(req, res) {
  const { id } = req.params;
  const hard = req.query.hard === 'true';

  if (mongoose.connection.readyState === 1) {
    if (hard) {
      const deleted = await Product.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ success: false, message: 'Product not found' });
      return res.json({ success: true, message: 'Product deleted permanently' });
    }

    const product = await Product.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    return res.json({ success: true, message: 'Product deactivated successfully' });
  }

  const product = memoryProducts.find((p) => p._id === id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  if (hard) {
    const idx = memoryProducts.findIndex((p) => p._id === id);
    memoryProducts.splice(idx, 1);
    return res.json({ success: true, message: 'Product deleted permanently' });
  }

  product.isActive = false;
  return res.json({ success: true, message: 'Product deactivated successfully' });
}

