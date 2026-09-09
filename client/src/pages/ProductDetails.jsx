import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import api from '../services/api.js';
import ProductFormModal from '../components/ProductFormModal.jsx';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const isAdmin = user?.role === 'admin';

  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProduct = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/products/${id}`);
      if (res.data?.success && res.data?.data) {
        setProduct(res.data.data);
      } else {
        setError('Product not found');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (isAdmin) {
      api
        .get('/categories')
        .then((res) => {
          if (res.data?.success) setCategories(res.data.data || []);
        })
        .catch(() => {});
    }
  }, [isAdmin]);

  const handleAddToCart = async () => {
    if (isAdmin || !product || product.stock <= 0) return;
    const res = await addToCart(product, quantity);
    if (res?.success) {
      setAddedNotice(true);
      setTimeout(() => setAddedNotice(false), 2500);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return;
    }
    setIsDeleting(true);
    try {
      await api.delete(`/products/${product._id}`);
      navigate('/products', { replace: true });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product');
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="empty-state-container" style={{ minHeight: '50vh' }}>
        <div className="empty-state-icon-box">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        </div>
        <h3 className="empty-state-title">Loading Product Details</h3>
        <p className="empty-state-desc">Fetching specifications and real-time inventory...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="empty-state-container" style={{ minHeight: '50vh' }}>
        <div className="empty-state-icon-box" style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger-color)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h3 className="empty-state-title">Product Unavailable</h3>
        <p className="empty-state-desc">{error || 'The requested product could not be found or has been removed.'}</p>
        <Link to="/products" className="admin-action-btn" style={{ marginTop: 16 }}>
          Return to Products
        </Link>
      </div>
    );
  }

  const categoryName = product.category?.name || 'General';
  const imageUrl =
    Array.isArray(product.images) && product.images[0]
      ? product.images[0]
      : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="product-details-container">
      <div className="breadcrumb-nav">
        <Link to="/products">&larr; Back to Products</Link>
        <span>/</span>
        <span>{categoryName}</span>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{product.name}</span>
      </div>

      <div className="product-details-card">
        {/* Gallery */}
        <div className="product-detail-gallery">
          <img
            src={imageUrl}
            alt={product.name}
            className="product-detail-img-main"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';
            }}
          />
        </div>

        {/* Info */}
        <div className="product-detail-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span className="badge-tag badge-category">{categoryName}</span>
            <span className={`badge-tag ${isOutOfStock ? 'badge-out-of-stock' : 'badge-stock'}`}>
              {isOutOfStock ? 'Out of Stock' : `${product.stock} in stock`}
            </span>
          </div>

          <h1 className="product-detail-title">{product.name}</h1>

          <div className="product-detail-price">${Number(product.price).toFixed(2)}</div>

          <div className="product-detail-meta-list">
            <div className="meta-row">
              <span className="meta-label">SKU / Slug:</span>
              <span className="meta-value" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                {product.slug || product._id}
              </span>
            </div>
            <div className="meta-row">
              <span className="meta-label">Category:</span>
              <span className="meta-value">{categoryName}</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">Inventory:</span>
              <span className="meta-value" style={{ color: isOutOfStock ? 'var(--danger-color)' : '#10b981' }}>
                {isOutOfStock ? 'Currently Sold Out' : `${product.stock} Units Available`}
              </span>
            </div>
          </div>

          <p className="product-detail-desc">{product.description}</p>

          {/* Customer Purchasing Controls (Hidden from Admin) */}
          {!isAdmin && (
            <>
              <div className="product-detail-actions">
                {!isOutOfStock && (
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: 8, overflow: 'hidden' }}>
                    <button
                      type="button"
                      style={{
                        width: 38,
                        height: 44,
                        border: 'none',
                        background: '#f8fafc',
                        cursor: 'pointer',
                        fontSize: '1.1rem',
                        fontWeight: 600,
                      }}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                      }}
                    >
                      {quantity}
                    </div>
                    <button
                      type="button"
                      style={{
                        width: 38,
                        height: 44,
                        border: 'none',
                        background: '#f8fafc',
                        cursor: 'pointer',
                        fontSize: '1.1rem',
                        fontWeight: 600,
                      }}
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      disabled={quantity >= product.stock}
                    >
                      +
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  className="btn-add-to-cart"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  {isOutOfStock ? 'Out of Stock' : `Add ${quantity} to Cart`}
                </button>
              </div>

              {addedNotice && (
                <div
                  style={{
                    marginTop: 12,
                    padding: '8px 14px',
                    borderRadius: 8,
                    backgroundColor: '#ecfdf5',
                    color: '#065f46',
                    border: '1px solid #a7f3d0',
                    fontSize: '0.88rem',
                    fontWeight: 500,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  Added {quantity} item(s) to your shopping cart!
                </div>
              )}
            </>
          )}

          {/* Admin Management Controls */}
          {isAdmin && (
            <div
              style={{
                marginTop: 24,
                padding: '20px',
                borderRadius: 10,
                backgroundColor: '#f8fafc',
                border: '1px solid var(--border-color)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Admin Product Controls</h4>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                    Update product details, stock levels, or delete this SKU.
                  </p>
                </div>
                <span className={`badge-tag ${product.isActive ? 'badge-stock' : 'badge-out-of-stock'}`}>
                  {product.isActive ? 'Status: Active' : 'Status: Inactive'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  type="button"
                  className="btn-card-action"
                  style={{ minWidth: 140, padding: '10px 18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  onClick={() => setIsEditModalOpen(true)}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit Product
                </button>
                <button
                  type="button"
                  className="btn-card-action btn-delete-alt"
                  style={{ minWidth: 140, padding: '10px 18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  disabled={isDeleting}
                  onClick={handleDelete}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  {isDeleting ? 'Deleting...' : 'Delete Product'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isAdmin && (
        <ProductFormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={fetchProduct}
          productToEdit={product}
          categories={categories}
        />
      )}
    </div>
  );
}
