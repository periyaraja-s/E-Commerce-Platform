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
    <div className="products-page-container">
      {/* Page Header */}
      <div className="page-header-block">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-title">{isAdmin ? 'Product Inventory Management' : 'Products Catalog'}</h1>
            <p className="page-subtitle">
              {isAdmin
                ? 'Centralized admin inventory table: manage stock, pricing, categories, and publication status.'
                : 'Browse our collection, explore curated categories, and add items directly to your cart.'}
            </p>
          </div>

          {isAdmin && (
            <button
              type="button"
              className="btn-add-product-primary"
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
      </div>

      {/* Admin Quick Metrics Bar */}
      {isAdmin && inventoryStats && (
        <div className="admin-stats-summary-grid" style={{ marginTop: 20 }}>
          <div className="admin-stat-card">
            <div className="admin-stat-label">Total SKUs</div>
            <div className="admin-stat-val">{inventoryStats.total}</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">In Stock</div>
            <div className="admin-stat-val" style={{ color: '#10b981' }}>{inventoryStats.inStock}</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">Low Stock (≤10)</div>
            <div className="admin-stat-val" style={{ color: '#d97706' }}>{inventoryStats.lowStock}</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">Out of Stock</div>
            <div className="admin-stat-val" style={{ color: '#ef4444' }}>{inventoryStats.outOfStock}</div>
          </div>
        </div>
      )}

      {/* Action Banners */}
      {actionSuccessMsg && (
        <div className="global-toast-notification success" style={{ position: 'static', marginBottom: 16, width: '100%' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="catalog-error-banner" style={{ marginTop: 16, marginBottom: 16 }}>
          <span>{errorMsg}</span>
          <button type="button" onClick={loadProducts} className="catalog-retry-btn">Retry</button>
        </div>
      )}

      {/* Filter toolbar */}
      <div className="products-filter-toolbar" style={{ marginTop: isAdmin ? 0 : 20 }}>
        {/* Search */}
        <div className="filter-search-box">
          <svg className="search-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="filter-search-input"
            placeholder={isAdmin ? 'Filter by name, SKU or keyword...' : 'Search products...'}
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

        {/* Category (from database) */}
        <div className="filter-select-group">
          <label htmlFor="prod-cat-select" className="filter-label">Category:</label>
          <select
            id="prod-cat-select"
            className="filter-select"
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
          <div className="filter-select-group">
            <label htmlFor="prod-stock-filter" className="filter-label">Stock:</label>
            <select
              id="prod-stock-filter"
              className="filter-select"
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
          <div className="filter-select-group">
            <label htmlFor="prod-status-filter" className="filter-label">Status:</label>
            <select
              id="prod-status-filter"
              className="filter-select"
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
        <div className="filter-select-group">
          <label htmlFor="prod-sort-select" className="filter-label">Sort:</label>
          <select
            id="prod-sort-select"
            className="filter-select"
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
      <div style={{ marginTop: 24 }}>
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
            <div className="products-grid-container">
              {[1, 2, 3, 4, 5, 6].map((k) => (
                <div key={k} className="product-skeleton-card">
                  <div className="skeleton-image-box" />
                  <div className="skeleton-content-box">
                    <div className="skeleton-line short" />
                    <div className="skeleton-line medium" />
                    <div className="skeleton-line long" />
                    <div className="skeleton-button" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayedProducts.length > 0 ? (
            <div className="products-grid-container">
              {displayedProducts.map((p) => (
                <ProductCard
                  key={p._id || p.id}
                  product={p}
                  onQuickView={(prod) => setQuickViewProduct(prod)}
                />
              ))}
            </div>
          ) : (
            <div className="products-empty-state">
              <h3 className="empty-state-title">No products found</h3>
              <p className="empty-state-desc">Try resetting your search query or choosing another category filter.</p>
              <button
                type="button"
                className="btn-empty-reset"
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
