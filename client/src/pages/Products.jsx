import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import ProductFormModal from '../components/ProductFormModal.jsx';

export default function Products() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 8, total: 0, pages: 1 });

  // Filters
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sort, setSort] = useState('-createdAt');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Admin Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  // Fetch Categories
  useEffect(() => {
    api
      .get('/categories')
      .then((res) => {
        if (res.data?.success) {
          setCategories(res.data.data || []);
        }
      })
      .catch((err) => console.warn('Could not load categories:', err.message));
  }, []);

  // Fetch Products
  const fetchProducts = useCallback(
    async (pageToLoad = 1) => {
      setLoading(true);
      try {
        const params = {
          page: pageToLoad,
          limit: 8,
          sort,
        };
        if (search.trim()) params.search = search.trim();
        if (selectedCategory && selectedCategory !== 'all') {
          params.category = selectedCategory;
        }

        const res = await api.get('/products', { params });
        if (res.data?.success) {
          setProducts(res.data.data || []);
          if (res.data.pagination) {
            setPagination(res.data.pagination);
          }
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    },
    [search, selectedCategory, sort]
  );

  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  // Handle Search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearch('');
  };

  // Handle Admin Delete
  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return;
    }
    try {
      await api.delete(`/products/${product._id}`);
      fetchProducts(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (product) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  return (
    <div>
      {/* Top Toolbar */}
      <div className="products-top-toolbar">
        <div className="products-header-row">
          <div>
            <h1 className="page-header-title">Product Catalog</h1>
            <p className="page-header-subtitle">Explore curated inventory, filter specifications, and inspect details</p>
          </div>

          {isAdmin && (
            <button type="button" className="admin-action-btn" onClick={handleOpenCreate}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add New Product
            </button>
          )}
        </div>

        {/* Filter Card */}
        <div className="filter-bar-card">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="search-input-wrapper">
            <svg
              className="search-input-icon"
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
              className="form-input-search"
              placeholder="Search products by title or keyword..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                style={{
                  position: 'absolute',
                  right: 10,
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                }}
              >
                &times;
              </button>
            )}
          </form>

          {/* Sort selector */}
          <select className="filter-select" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="-createdAt">Newest First</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
            <option value="-name">Name: Z to A</option>
          </select>

          {/* View Mode Toggle (Grid / Table) */}
          <div className="view-toggle-group">
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
              aria-label="Grid view"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </button>
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
              aria-label="Table view"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="category-pills-row">
          <button
            type="button"
            className={`category-pill ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              type="button"
              className={`category-pill ${selectedCategory === cat._id || selectedCategory === cat.slug ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat._id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="empty-state-container" style={{ minHeight: '40vh' }}>
          <div className="empty-state-icon-box">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <h3 className="empty-state-title">Loading Products</h3>
          <p className="empty-state-desc">Retrieving the latest catalog entries from the store...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state-container">
          <div className="empty-state-icon-box">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <h3 className="empty-state-title">No Products Found</h3>
          <p className="empty-state-desc">
            No items matched your current search filters. Try adjusting your search query or selecting a different category.
          </p>
          {(search || selectedCategory !== 'all') && (
            <button
              type="button"
              className="admin-action-btn"
              style={{ marginTop: 16 }}
              onClick={() => {
                setSearch('');
                setSearchInput('');
                setSelectedCategory('all');
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="products-grid">
          {products.map((product) => {
            const categoryName = product.category?.name || 'General';
            const imageUrl =
              Array.isArray(product.images) && product.images[0]
                ? product.images[0]
                : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';
            const isOutOfStock = product.stock <= 0;

            return (
              <div key={product._id} className="product-card">
                <div className="product-card-img-wrapper">
                  <div className="product-badge-overlay">
                    <span className="badge-tag badge-category">{categoryName}</span>
                    <span className={`badge-tag ${isOutOfStock ? 'badge-out-of-stock' : 'badge-stock'}`}>
                      {isOutOfStock ? 'Out of Stock' : `${product.stock} in stock`}
                    </span>
                  </div>
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="product-card-img"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';
                    }}
                  />
                </div>

                <div className="product-card-body">
                  <Link to={`/products/${product.slug || product._id}`} className="product-card-title">
                    {product.name}
                  </Link>
                  <p className="product-card-desc">{product.description}</p>

                  <div className="product-card-footer">
                    <div className="product-card-price">${Number(product.price).toFixed(2)}</div>
                    <div className="product-card-stock-info">
                      {product.stock > 0 ? `${product.stock} available` : 'Sold out'}
                    </div>
                  </div>

                  <div className="product-card-actions">
                    <Link
                      to={`/products/${product.slug || product._id}`}
                      className="btn-card-action btn-card-primary"
                    >
                      View Details
                    </Link>
                    {isAdmin && (
                      <>
                        <button
                          type="button"
                          className="btn-card-action"
                          style={{ maxWidth: 64 }}
                          onClick={() => handleOpenEdit(product)}
                          title="Edit Product"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-card-action btn-card-danger"
                          style={{ maxWidth: 44, padding: '8px 0' }}
                          onClick={() => handleDeleteProduct(product)}
                          title="Delete Product"
                        >
                          &times;
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="products-table-card">
          <table className="products-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const categoryName = product.category?.name || 'General';
                const imageUrl =
                  Array.isArray(product.images) && product.images[0]
                    ? product.images[0]
                    : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';
                const isOutOfStock = product.stock <= 0;

                return (
                  <tr key={product._id}>
                    <td>
                      <div className="table-product-cell">
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="table-product-thumb"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';
                          }}
                        />
                        <div>
                          <Link
                            to={`/products/${product.slug || product._id}`}
                            style={{ fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}
                          >
                            {product.name}
                          </Link>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                            {product.slug || product._id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge-tag badge-category" style={{ fontSize: '0.75rem' }}>
                        {categoryName}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>${Number(product.price).toFixed(2)}</td>
                    <td>
                      <span className={`badge-tag ${isOutOfStock ? 'badge-out-of-stock' : 'badge-stock'}`}>
                        {isOutOfStock ? '0 (Out)' : `${product.stock} in stock`}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                        <Link
                          to={`/products/${product.slug || product._id}`}
                          className="btn-card-action"
                          style={{ padding: '6px 12px' }}
                        >
                          Details
                        </Link>
                        {isAdmin && (
                          <>
                            <button
                              type="button"
                              className="btn-card-action"
                              style={{ padding: '6px 12px' }}
                              onClick={() => handleOpenEdit(product)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn-card-action btn-card-danger"
                              style={{ padding: '6px 10px' }}
                              onClick={() => handleDeleteProduct(product)}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Bar */}
      {!loading && products.length > 0 && pagination.pages > 1 && (
        <div className="pagination-bar">
          <div className="pagination-info">
            Showing {(pagination.page - 1) * pagination.limit + 1} -{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} products
          </div>
          <div className="pagination-controls">
            <button
              type="button"
              className="pagination-btn"
              disabled={pagination.page <= 1}
              onClick={() => fetchProducts(pagination.page - 1)}
            >
              &larr; Prev
            </button>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                className={`pagination-btn ${p === pagination.page ? 'active' : ''}`}
                onClick={() => fetchProducts(p)}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              className="pagination-btn"
              disabled={pagination.page >= pagination.pages}
              onClick={() => fetchProducts(pagination.page + 1)}
            >
              Next &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Admin Create / Edit Modal */}
      {isAdmin && (
        <ProductFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => fetchProducts(pagination.page)}
          productToEdit={productToEdit}
          categories={categories}
        />
      )}
    </div>
  );
}
