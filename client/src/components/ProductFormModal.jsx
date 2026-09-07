import React, { useState, useEffect } from 'react';
import api from '../services/api.js';

export default function ProductFormModal({ isOpen, onClose, onSuccess, productToEdit, categories }) {
  const isEditing = Boolean(productToEdit);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '0',
    description: '',
    imageUrl: '',
    slug: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
      });
    }
    setErrorMsg('');
  }, [productToEdit, isOpen, categories]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim()) {
      setErrorMsg('Product name is required');
      return;
    }
    if (!formData.category) {
      setErrorMsg('Please select a category');
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="modal-body">
            {errorMsg && <div className="form-error-banner">{errorMsg}</div>}

            <div className="form-group">
              <label className="form-label" htmlFor="prod-name">
                Product Name <span className="req">*</span>
              </label>
              <input
                id="prod-name"
                name="name"
                type="text"
                className="form-control"
                placeholder="e.g. Wireless ANC Headphones"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="prod-category">
                  Category <span className="req">*</span>
                </label>
                <select
                  id="prod-category"
                  name="category"
                  className="form-control"
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

              <div className="form-group">
                <label className="form-label" htmlFor="prod-price">
                  Price ($) <span className="req">*</span>
                </label>
                <input
                  id="prod-price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-control"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="prod-stock">
                  Stock Units <span className="req">*</span>
                </label>
                <input
                  id="prod-stock"
                  name="stock"
                  type="number"
                  min="0"
                  step="1"
                  className="form-control"
                  placeholder="0"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prod-slug">
                  Custom Slug <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  id="prod-slug"
                  name="slug"
                  type="text"
                  className="form-control"
                  placeholder="e.g. wireless-anc-headphones"
                  value={formData.slug}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="prod-img">
                Image URL
              </label>
              <input
                id="prod-img"
                name="imageUrl"
                type="url"
                className="form-control"
                placeholder="https://images.unsplash.com/..."
                value={formData.imageUrl}
                onChange={handleChange}
              />
              {formData.imageUrl && (
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 6,
                      objectFit: 'cover',
                      border: '1px solid var(--border-color)',
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Image preview</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="prod-desc">
                Description <span className="req">*</span>
              </label>
              <textarea
                id="prod-desc"
                name="description"
                rows="4"
                className="form-control"
                placeholder="Detailed information about product specifications, materials, and features..."
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-card-action"
              onClick={onClose}
              disabled={submitting}
              style={{ maxWidth: 100 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-card-action btn-card-primary"
              disabled={submitting}
              style={{ maxWidth: 160 }}
            >
              {submitting ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
