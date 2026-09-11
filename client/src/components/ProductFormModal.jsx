import React, { useState, useEffect } from 'react';
import api from '../services/api.js';

export default function ProductFormModal({ isOpen, onClose, onSuccess, productToEdit, categories: initialCategories }) {
  const isEditing = Boolean(productToEdit);

  const [categories, setCategories] = useState(initialCategories || []);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '0',
    description: '',
    imageUrl: '',
    slug: '',
    isActive: true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch categories from DB if not passed or empty
  useEffect(() => {
    if (isOpen && (!initialCategories || initialCategories.length === 0)) {
      api.get('/categories')
        .then((res) => {
          if (res.data?.success) setCategories(res.data.data || []);
        })
        .catch((err) => console.error('Failed to load categories in modal:', err));
    } else if (initialCategories) {
      setCategories(initialCategories);
    }
  }, [isOpen, initialCategories]);

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name || '',
        category: productToEdit.category?._id || productToEdit.category || '',
        price: productToEdit.price !== undefined ? String(productToEdit.price) : '',
        stock: productToEdit.stock !== undefined ? String(productToEdit.stock) : '0',
        description: productToEdit.description || '',
        imageUrl: Array.isArray(productToEdit.images) && productToEdit.images[0] ? productToEdit.images[0] : '',
        slug: productToEdit.slug || '',
        isActive: typeof productToEdit.isActive === 'boolean' ? productToEdit.isActive : true,
      });
    } else {
      setFormData({
        name: '',
        category: categories?.[0]?._id || '',
        price: '',
        stock: '10',
        description: '',
        imageUrl: '',
        slug: '',
        isActive: true,
      });
    }
    setErrorMsg('');
  }, [productToEdit, isOpen, categories]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim()) {
      setErrorMsg('Product name is required');
      return;
    }
    if (!formData.category) {
      setErrorMsg('Please select a category from the database');
      return;
    }
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      setErrorMsg('Please enter a valid non-negative price');
      return;
    }
    if (formData.stock === '' || isNaN(Number(formData.stock)) || Number(formData.stock) < 0) {
      setErrorMsg('Please enter a valid non-negative stock quantity');
      return;
    }
    if (!formData.description.trim()) {
      setErrorMsg('Product description is required');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      price: Number(formData.price),
      stock: Math.floor(Number(formData.stock)),
      description: formData.description.trim(),
      images: formData.imageUrl.trim() ? [formData.imageUrl.trim()] : [],
      isActive: Boolean(formData.isActive),
    };

    if (formData.slug.trim()) {
      payload.slug = formData.slug.trim();
    }

    setSubmitting(true);
    try {
      if (isEditing) {
        await api.put(`/products/${productToEdit._id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto" onClick={onClose}>
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <h2 className="text-lg font-bold text-slate-900">{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
          <button
            type="button"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer text-base leading-none"
            onClick={onClose}
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-6 overflow-y-auto space-y-4">
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="prod-name">
                Product Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="prod-name"
                name="name"
                type="text"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                placeholder="e.g. Wireless ANC Headphones"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="prod-category">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  id="prod-category"
                  name="category"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    Select category
                  </option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="prod-price">
                  Price ($) <span className="text-rose-500">*</span>
                </label>
                <input
                  id="prod-price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="prod-stock">
                  Stock Units <span className="text-rose-500">*</span>
                </label>
                <input
                  id="prod-stock"
                  name="stock"
                  type="number"
                  min="0"
                  step="1"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                  placeholder="0"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="prod-slug">
                  Custom Slug <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  id="prod-slug"
                  name="slug"
                  type="text"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                  placeholder="e.g. wireless-anc-headphones"
                  value={formData.slug}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="prod-img">
                Image URL
              </label>
              <input
                id="prod-img"
                name="imageUrl"
                type="url"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                placeholder="https://images.unsplash.com/..."
                value={formData.imageUrl}
                onChange={handleChange}
              />
              {formData.imageUrl && (
                <div className="mt-2 flex items-center gap-3">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <span className="text-xs text-slate-500 font-medium">Image preview</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="prod-desc">
                Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="prod-desc"
                name="description"
                rows="4"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors resize-y"
                placeholder="Detailed information about product specifications, materials, and features..."
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <input
                id="prod-is-active"
                name="isActive"
                type="checkbox"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
              />
              <label htmlFor="prod-is-active" className="text-xs font-medium text-slate-700 cursor-pointer select-none">
                Product is Active and visible to customers
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50 shrink-0">
            <button
              type="button"
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer transition-colors"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold cursor-pointer transition-colors shadow-xs disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
