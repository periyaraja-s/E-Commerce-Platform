import Product from '../models/Product.js';

export async function listProducts(req, res) {
  const { search, category, minPrice, maxPrice, sort = '-createdAt', page = 1, limit = 12 } = req.query;
  const filter = { isActive: true };

  if (search?.trim()) filter.$text = { $search: search.trim() };
  if (category) filter.category = category;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const allowedSorts = ['price', '-price', 'name', '-name', 'createdAt', '-createdAt'];
  const safeSort = allowedSorts.includes(sort) ? sort : '-createdAt';
  const pageNumber = Math.max(Number(page), 1);
  const pageSize = Math.min(Math.max(Number(limit), 1), 50);

  const [products, total] = await Promise.all([
    Product.find(filter).populate('category', 'name slug').sort(safeSort).skip((pageNumber - 1) * pageSize).limit(pageSize),
    Product.countDocuments(filter),
  ]);

  return res.json({
    success: true,
    data: products,
    pagination: { page: pageNumber, limit: pageSize, total, pages: Math.ceil(total / pageSize) },
  });
}

export async function getProduct(req, res) {
  const product = await Product.findOne({ _id: req.params.id, isActive: true }).populate('category', 'name slug');
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  return res.json({ success: true, data: product });
}

export async function createProduct(req, res) {
  const { name, slug, description, price, stock, images, category } = req.body;
  if (!name?.trim() || !slug?.trim() || !description?.trim() || price === undefined || !category) {
    return res.status(422).json({ success: false, message: 'Name, slug, description, price and category are required' });
  }

  const product = await Product.create({
    name: name.trim(),
    slug: slug.trim().toLowerCase(),
    description: description.trim(),
    price: Number(price),
    stock: Number(stock) || 0,
    images: Array.isArray(images) ? images : [],
    category,
  });

  return res.status(201).json({ success: true, data: product });
}

export async function updateProduct(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  const fields = ['name', 'slug', 'description', 'price', 'stock', 'images', 'category', 'isActive'];
  for (const field of fields) {
    if (req.body[field] !== undefined) product[field] = req.body[field];
  }
  await product.save();

  return res.json({ success: true, data: product });
}

export async function deleteProduct(req, res) {
  const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  return res.json({ success: true, message: 'Product deactivated' });
}
