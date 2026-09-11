import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import ProductCard from '../components/ProductCard.jsx';
import ProductQuickViewModal from '../components/ProductQuickViewModal.jsx';
import ProductFormModal from '../components/ProductFormModal.jsx';
import AdminProductsTable from '../components/AdminProductsTable.jsx';

export default function Products() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Common Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('-createdAt');

  // Admin-Specific Filters
  const [stockFilter, setStockFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Load Categories from DB
  useEffect(() => {
    api
      .get('/categories')
      .then((res) => {
        if (res.data?.success) setCategories(res.data.data || []);
      })
      .catch((err) => console.error('Failed to load categories', err));
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (category !== 'all') params.category = category;
      if (sort) params.sort = sort;

      const res = await api.get('/products', { params });
      if (res.data?.success) {
        setProducts(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setErrorMsg('Failed to load products. Please check connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 280);
    return () => clearTimeout(timer);
  }, [search, category, sort]);

  // Admin client-side filter computation for stock and status
  const displayedProducts = useMemo(() => {
    if (!isAdmin) return products;

    return products.filter((p) => {
      const stock = Number(p.stock) || 0;
      if (stockFilter === 'in_stock' && stock <= 0) return false;
      if (stockFilter === 'low_stock' && (stock <= 0 || stock > 10)) return false;
      if (stockFilter === 'out_of_stock' && stock > 0) return false;

      const isActive = p.isActive !== false;
      if (statusFilter === 'active' && !isActive) return false;
      if (statusFilter === 'inactive' && isActive) return false;

      return true;
    });
  }, [products, isAdmin, stockFilter, statusFilter]);

  // Admin inventory stats
  const inventoryStats = useMemo(() => {
    if (!isAdmin) return null;
    const total = products.length;
    const inStock = products.filter((p) => (Number(p.stock) || 0) > 10).length;
    const lowStock = products.filter((p) => {
      const s = Number(p.stock) || 0;
      return s > 0 && s <= 10;
    }).length;
    const outOfStock = products.filter((p) => (Number(p.stock) || 0) <= 0).length;
    return { total, inStock, lowStock, outOfStock };
  }, [products, isAdmin]);

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormModalOpen(true);
  };

  const handleDeleteProduct = async (productId, productName) => {
    setErrorMsg('');
    try {
      const res = await api.delete(`/products/${productId}`);
      if (res.data?.success) {
        setActionSuccessMsg(`Product "${productName}" was removed from inventory.`);
        setTimeout(() => setActionSuccessMsg(''), 4000);
        loadProducts();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || `Failed to delete product "${productName}"`);
    }
  };

  const handleToggleStatus = async (product) => {
    setErrorMsg('');
    const newStatus = !(product.isActive !== false);
    try {
      const res = await api.put(`/products/${product._id || product.id}`, {
        isActive: newStatus,
      });
      if (res.data?.success) {
        setActionSuccessMsg(`Updated status for "${product.name}" to ${newStatus ? 'Active' : 'Inactive'}.`);
        setTimeout(() => setActionSuccessMsg(''), 3000);
        loadProducts();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update product status.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isAdmin ? 'Product Inventory Management' : 'Products Catalog'}
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            {isAdmin
              ? 'Centralized admin inventory table: manage stock, pricing, categories, and publication status.'
              : 'Browse our collection, explore curated categories, and add items directly to your cart.'}
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
            onClick={handleOpenCreateModal}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Add New Product</span>
          </button>
        )}
      </div>

      {/* Admin Quick Metrics Bar */}
      {isAdmin && inventoryStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total SKUs</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{inventoryStats.total}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">In Stock</div>
            <div className="text-2xl font-bold text-emerald-600 mt-1">{inventoryStats.inStock}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Low Stock (≤10)</div>
            <div className="text-2xl font-bold text-amber-600 mt-1">{inventoryStats.lowStock}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Out of Stock</div>
            <div className="text-2xl font-bold text-rose-600 mt-1">{inventoryStats.outOfStock}</div>
          </div>
        </div>
      )}

      {/* Action Banners */}
      {actionSuccessMsg && (
        <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2 shadow-xs">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium flex items-center justify-between gap-2 shadow-xs">
          <span>{errorMsg}</span>
          <button
            type="button"
            onClick={loadProducts}
            className="px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-900 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter toolbar */}
      <div className="mt-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
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
            className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white placeholder-slate-400 transition-colors"
            placeholder={isAdmin ? 'Filter by name, SKU or keyword...' : 'Search products...'}
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

        {/* Category (from database) */}
        <div className="flex items-center gap-1.5">
          <label htmlFor="prod-cat-select" className="text-xs font-semibold text-slate-600 whitespace-nowrap">
            Category:
          </label>
          <select
            id="prod-cat-select"
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c._id || c.slug} value={c.slug || c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Admin-only Stock filter */}
        {isAdmin && (
          <div className="flex items-center gap-1.5">
            <label htmlFor="prod-stock-filter" className="text-xs font-semibold text-slate-600 whitespace-nowrap">
              Stock:
            </label>
            <select
              id="prod-stock-filter"
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
            >
              <option value="all">All Stock Levels</option>
              <option value="in_stock">In Stock (&gt;10)</option>
              <option value="low_stock">Low Stock (1-10)</option>
              <option value="out_of_stock">Out of Stock (0)</option>
            </select>
          </div>
        )}

        {/* Admin-only Status filter */}
        {isAdmin && (
          <div className="flex items-center gap-1.5">
            <label htmlFor="prod-status-filter" className="text-xs font-semibold text-slate-600 whitespace-nowrap">
              Status:
            </label>
            <select
              id="prod-status-filter"
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        )}

        {/* Sort */}
        <div className="flex items-center gap-1.5">
          <label htmlFor="prod-sort-select" className="text-xs font-semibold text-slate-600 whitespace-nowrap">
            Sort:
          </label>
          <select
            id="prod-sort-select"
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="-createdAt">Newest First</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
            <option value="name">Name (A-Z)</option>
            {isAdmin && <option value="stock">Stock: Low to High</option>}
            {isAdmin && <option value="-stock">Stock: High to Low</option>}
          </select>
        </div>
      </div>

      {/* Main View Area: Admin Management Table vs Customer Product Cards */}
      <div className="mt-8">
        {isAdmin ? (
          /* Admin Product Management Table */
          <AdminProductsTable
            products={displayedProducts}
            loading={loading}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
            onToggleStatus={handleToggleStatus}
            onAddNew={handleOpenCreateModal}
          />
        ) : (
          /* Customer Shopping Card Catalog */
          loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((k) => (
                <div key={k} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs animate-pulse">
                  <div className="w-full aspect-square bg-slate-200" />
                  <div className="p-4 space-y-3">
                    <div className="w-1/3 h-3 bg-slate-200 rounded" />
                    <div className="w-3/4 h-4 bg-slate-200 rounded" />
                    <div className="w-1/2 h-4 bg-slate-200 rounded" />
                    <div className="w-full h-9 bg-slate-100 rounded-xl mt-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {displayedProducts.map((p) => (
                <ProductCard
                  key={p._id || p.id}
                  product={p}
                  onQuickView={(prod) => setQuickViewProduct(prod)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-900">No products found</h3>
              <p className="text-xs text-slate-500 mt-1">
                Try resetting your search query or choosing another category filter.
              </p>
              <button
                type="button"
                className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
                onClick={() => {
                  setSearch('');
                  setCategory('all');
                  setSort('-createdAt');
                }}
              >
                Reset Filters
              </button>
            </div>
          )
        )}
      </div>

      {/* Modals */}
      {quickViewProduct && (
        <ProductQuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}

      {formModalOpen && (
        <ProductFormModal
          isOpen={formModalOpen}
          onClose={() => setFormModalOpen(false)}
          onSuccess={() => {
            setFormModalOpen(false);
            loadProducts();
          }}
          productToEdit={editingProduct}
          categories={categories}
        />
      )}
    </div>
  );
}
