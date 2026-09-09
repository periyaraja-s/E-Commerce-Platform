import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api.js';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [modalFormData, setModalFormData] = useState({
    name: '',
    description: '',
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // Pass all=true so admin sees inactive categories as well
      const res = await api.get('/categories?all=true');
      if (res.data?.success) {
        setCategories(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
      setErrorMsg('Failed to load categories from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.trim().toLowerCase();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
    );
  }, [categories, search]);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setModalFormData({ name: '', description: '', isActive: true });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setModalFormData({
      name: cat.name || '',
      description: cat.description || '',
      isActive: cat.isActive !== false,
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!modalFormData.name.trim()) {
      setModalError('Category name is required');
      return;
    }

    setSubmitting(true);
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, {
          name: modalFormData.name.trim(),
          description: modalFormData.description.trim(),
          isActive: modalFormData.isActive,
        });
        setSuccessMsg(`Category "${modalFormData.name}" updated successfully.`);
      } else {
        await api.post('/categories', {
          name: modalFormData.name.trim(),
          description: modalFormData.description.trim(),
          isActive: modalFormData.isActive,
        });
        setSuccessMsg(`Category "${modalFormData.name}" created successfully.`);
      }
      setTimeout(() => setSuccessMsg(''), 3500);
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (cat) => {
    if (cat.productCount > 0) {
      alert(
        `Cannot delete "${cat.name}" because ${cat.productCount} active product(s) are currently assigned to it. Please reassign or delete those products first in the Products inventory table.`
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete category "${cat.name}"?`
    );
    if (!confirmed) return;

    setDeletingId(cat._id);
    setErrorMsg('');
    try {
      const res = await api.delete(`/categories/${cat._id}`);
      if (res.data?.success) {
        setSuccessMsg(`Category "${cat.name}" was successfully removed.`);
        setTimeout(() => setSuccessMsg(''), 3500);
        fetchCategories();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete category');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (cat) => {
    const newStatus = !(cat.isActive !== false);
    try {
      await api.put(`/categories/${cat._id}`, { isActive: newStatus });
      setSuccessMsg(`Category "${cat.name}" is now ${newStatus ? 'Active' : 'Inactive'}.`);
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchCategories();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="categories-page-container" style={{ padding: '0 0 40px 0' }}>
      {/* Header */}
      <div className="page-header-block">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-title">Category Management</h1>
            <p className="page-subtitle">
              Manage database product categories, view associated product volume, and configure catalog taxonomies.
            </p>
          </div>

          <button
            type="button"
            className="btn-add-product-primary"
            onClick={handleOpenAddModal}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Add New Category</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="global-toast-notification success" style={{ position: 'static', marginTop: 16, marginBottom: 16, width: '100%' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="catalog-error-banner" style={{ marginTop: 16, marginBottom: 16 }}>
          <span>{errorMsg}</span>
          <button type="button" onClick={fetchCategories} className="catalog-retry-btn">Retry</button>
        </div>
      )}

      {/* Filter toolbar */}
      <div className="products-filter-toolbar" style={{ marginTop: 20, marginBottom: 20 }}>
        <div className="filter-search-box" style={{ maxWidth: 360 }}>
          <svg className="search-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="filter-search-input"
            placeholder="Search categories by name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* Category Management Table */}
      <div className="products-table-card">
        <table className="products-table" aria-label="Admin Categories Table">
          <thead>
            <tr>
              <th style={{ minWidth: 200 }}>Category Name</th>
              <th style={{ minWidth: 160 }}>URL Slug</th>
              <th style={{ minWidth: 260 }}>Description</th>
              <th style={{ minWidth: 120 }}>Linked Products</th>
              <th style={{ minWidth: 120 }}>Status</th>
              <th style={{ minWidth: 140, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1, 2, 3, 4].map((i) => (
                <tr key={i}>
                  <td colSpan={6} style={{ padding: '16px' }}>
                    <div style={{ height: 20, background: '#e2e8f0', borderRadius: 4, width: `${50 + i * 10}%` }} />
                  </td>
                </tr>
              ))
            ) : filteredCategories.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px 16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>No categories found</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Try adjusting your search or add a new category.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredCategories.map((cat) => {
                const isActive = cat.isActive !== false;
                const count = cat.productCount || 0;

                return (
                  <tr key={cat._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                        {cat.name}
                      </div>
                    </td>
                    <td>
                      <code style={{ fontSize: '0.82rem', background: '#f1f5f9', padding: '3px 6px', borderRadius: 4, color: '#475569' }}>
                        {cat.slug}
                      </code>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {cat.description || 'No description provided.'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge-tag ${count > 0 ? 'badge-category' : 'badge-low-stock'}`} style={{ fontSize: '0.8rem' }}>
                        {count} {count === 1 ? 'product' : 'products'}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(cat)}
                        title="Click to toggle status"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        <span
                          className={`badge-tag ${isActive ? 'badge-stock' : 'badge-out-of-stock'}`}
                          style={{ fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              backgroundColor: isActive ? '#10b981' : '#ef4444',
                            }}
                          />
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                        <button
                          type="button"
                          className="btn-table-action btn-table-edit"
                          onClick={() => handleOpenEditModal(cat)}
                          title="Edit Category"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          className="btn-table-action btn-table-delete"
                          onClick={() => handleDeleteCategory(cat)}
                          disabled={deletingId === cat._id}
                          title={count > 0 ? 'Reassign products before deleting' : 'Delete Category'}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                          <span>{deletingId === cat._id ? '...' : 'Delete'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Category Create/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2 className="modal-title">{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleModalSubmit}>
              <div className="modal-body">
                {modalError && <div className="form-error-banner">{modalError}</div>}

                <div className="form-group">
                  <label className="form-label" htmlFor="cat-name">
                    Category Name <span className="req">*</span>
                  </label>
                  <input
                    id="cat-name"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Smart Watches"
                    value={modalFormData.name}
                    onChange={(e) => setModalFormData((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="cat-desc">
                    Description
                  </label>
                  <textarea
                    id="cat-desc"
                    className="form-control"
                    rows="3"
                    placeholder="Brief description for customer catalog browsing and SEO..."
                    value={modalFormData.description}
                    onChange={(e) => setModalFormData((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                  <input
                    id="cat-active"
                    type="checkbox"
                    checked={modalFormData.isActive}
                    onChange={(e) => setModalFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                  <label htmlFor="cat-active" style={{ fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer', margin: 0, color: 'var(--text-primary)' }}>
                    Active and visible in store category filters
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-card-action"
                  onClick={() => setIsModalOpen(false)}
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
                  {submitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
