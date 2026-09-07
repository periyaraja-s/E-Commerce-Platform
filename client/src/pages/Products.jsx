import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import ProductCard from '../components/ProductCard.jsx';
import ProductQuickViewModal from '../components/ProductQuickViewModal.jsx';
import ProductFormModal from '../components/ProductFormModal.jsx';

export default function Products() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('-createdAt');

  // Modals
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

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

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormModalOpen(true);
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
                ? 'Manage store listings, update stock levels, and publish new products.'
                : 'Browse our complete inventory, search by name, or filter by category.'}
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

      {/* Filter toolbar */}
      <div className="products-filter-toolbar" style={{ marginTop: 20 }}>
        <div className="filter-search-box">
          <svg className="search-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="filter-search-input"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearch('')}
            >
              &times;
            </button>
          )}
        </div>

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
          </select>
        </div>
      </div>

      {errorMsg && (
        <div className="catalog-error-banner" style={{ marginTop: 16 }}>
          <span>{errorMsg}</span>
          <button type="button" onClick={loadProducts} className="catalog-retry-btn">Retry</button>
        </div>
      )}

      {/* Grid */}
      <div style={{ marginTop: 24 }}>
        {loading ? (
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
        ) : products.length > 0 ? (
          <div className="products-grid-container">
            {products.map((p) => (
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
