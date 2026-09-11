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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Category Management</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Manage database product categories, view associated product volume, and configure catalog taxonomies.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          onClick={handleOpenAddModal}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Add New Category</span>
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2 shadow-xs">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium flex items-center justify-between gap-2 shadow-xs">
          <span>{errorMsg}</span>
          <button
            type="button"
            onClick={fetchCategories}
            className="px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-900 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter toolbar */}
      <div className="mt-6 mb-6">
        <div className="relative max-w-sm">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white placeholder-slate-400 transition-colors shadow-xs"
            placeholder="Search categories by name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* Category Management Table */}
      <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm" aria-label="Admin Categories Table">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3.5 min-w-[200px]">Category Name</th>
                <th className="px-6 py-3.5 min-w-[160px]">URL Slug</th>
                <th className="px-6 py-3.5 min-w-[260px]">Description</th>
                <th className="px-6 py-3.5 min-w-[130px]">Linked Products</th>
                <th className="px-6 py-3.5 min-w-[120px]">Status</th>
                <th className="px-6 py-3.5 min-w-[150px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [1, 2, 3, 4].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-4">
                      <div className="h-4 bg-slate-200 rounded w-1/3" />
                    </td>
                  </tr>
                ))
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 px-6">
                    <div className="flex flex-col items-center gap-2 max-w-sm mx-auto">
                      <span className="font-bold text-slate-900 text-base">No categories found</span>
                      <span className="text-xs text-slate-500">
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
                    <tr key={cat._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 text-sm">
                          {cat.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-1 rounded-md">
                          {cat.slug}
                        </code>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <span className="text-xs text-slate-600 line-clamp-2">
                          {cat.description || 'No description provided.'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                            count > 0 ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {count} {count === 1 ? 'product' : 'products'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(cat)}
                          title="Click to toggle status"
                          className="bg-transparent border-0 p-0 cursor-pointer inline-flex items-center"
                        >
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isActive ? 'bg-emerald-500' : 'bg-slate-400'
                              }`}
                            />
                            {isActive ? 'Active' : 'Inactive'}
                          </span>
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            className="px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50/50 text-blue-700 hover:bg-blue-100 text-xs font-medium inline-flex items-center gap-1 cursor-pointer transition-colors"
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
                            className="px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50/50 text-rose-700 hover:bg-rose-100 text-xs font-medium inline-flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
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
      </div>

      {/* Category Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto" onClick={() => setIsModalOpen(false)}>
          <div
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
              <h2 className="text-lg font-bold text-slate-900">{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
              <button
                type="button"
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer text-base leading-none"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="flex flex-col">
              <div className="p-6 space-y-4">
                {modalError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                    {modalError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="cat-name">
                    Category Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="cat-name"
                    type="text"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                    placeholder="e.g. Smart Watches"
                    value={modalFormData.name}
                    onChange={(e) => setModalFormData((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="cat-desc">
                    Description
                  </label>
                  <textarea
                    id="cat-desc"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors resize-y"
                    rows="3"
                    placeholder="Brief description for customer catalog browsing and SEO..."
                    value={modalFormData.description}
                    onChange={(e) => setModalFormData((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="flex items-center gap-2.5 pt-1">
                  <input
                    id="cat-active"
                    type="checkbox"
                    checked={modalFormData.isActive}
                    onChange={(e) => setModalFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                  />
                  <label htmlFor="cat-active" className="text-xs font-medium text-slate-700 cursor-pointer select-none">
                    Active and visible in store category filters
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50 shrink-0">
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer transition-colors"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold cursor-pointer transition-colors shadow-xs disabled:opacity-50"
                  disabled={submitting}
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
