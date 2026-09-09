import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function AdminProductsTable({
  products,
  loading,
  onEditProduct,
  onDeleteProduct,
  onToggleStatus,
  onAddNew,
}) {
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const handleDelete = async (product) => {
    const confirmMsg = `Are you sure you want to delete "${product.name}"? This action cannot be undone.`;
    if (!window.confirm(confirmMsg)) return;

    setDeletingId(product._id || product.id);
    try {
      await onDeleteProduct(product._id || product.id, product.name);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggle = async (product) => {
    setTogglingId(product._id || product.id);
    try {
      await onToggleStatus(product);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="admin-product-management-wrapper">
      <div className="products-table-card">
        <table className="products-table" aria-label="Admin Product Inventory Table">
          <thead>
            <tr>
              <th style={{ minWidth: 260 }}>Product</th>
              <th style={{ minWidth: 140 }}>Category</th>
              <th style={{ minWidth: 110 }}>Price</th>
              <th style={{ minWidth: 140 }}>Stock Level</th>
              <th style={{ minWidth: 120 }}>Status</th>
              <th style={{ minWidth: 160, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="table-skeleton-row">
                  <td colSpan={6} style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 6, background: '#e2e8f0' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ width: '40%', height: 14, background: '#e2e8f0', borderRadius: 4, marginBottom: 6 }} />
                        <div style={{ width: '25%', height: 10, background: '#f1f5f9', borderRadius: 4 }} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '48px 16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
                      <rect x="2" y="3" width="20" height="14" rx="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                    <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      No inventory items found
                    </span>
                    <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                      No products match your current search and filter settings.
                    </span>
                    <button
                      type="button"
                      className="btn-card-action btn-card-primary"
                      style={{ marginTop: 8, maxWidth: 160 }}
                      onClick={onAddNew}
                    >
                      Add New Product
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const prodId = product._id || product.id;
                const stockVal = Number(product.stock) || 0;
                const isOutOfStock = stockVal <= 0;
                const isLowStock = !isOutOfStock && stockVal <= 10;
                const categoryName = product.category?.name || 'Unassigned';
                const isActive = product.isActive !== false;
                const imageUrl =
                  Array.isArray(product.images) && product.images[0]
                    ? product.images[0]
                    : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80';

                return (
                  <tr key={prodId}>
                    {/* Product info */}
                    <td>
                      <div className="table-product-cell">
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="table-product-thumb"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80';
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                            {product.name}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                            {product.slug || prodId}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td>
                      <span className="badge-tag badge-category" style={{ fontSize: '0.78rem' }}>
                        {categoryName}
                      </span>
                    </td>

                    {/* Price */}
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        ${Number(product.price).toFixed(2)}
                      </span>
                    </td>

                    {/* Stock */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                          {stockVal} units
                        </span>
                        <span
                          className={`badge-tag ${
                            isOutOfStock
                              ? 'badge-out-of-stock'
                              : isLowStock
                              ? 'badge-low-stock'
                              : 'badge-stock'
                          }`}
                          style={{ fontSize: '0.72rem', alignSelf: 'flex-start' }}
                        >
                          {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                        </span>
                      </div>
                    </td>

                    {/* Status with quick toggle */}
                    <td>
                      <button
                        type="button"
                        onClick={() => handleToggle(product)}
                        disabled={togglingId === prodId}
                        title={`Click to ${isActive ? 'deactivate' : 'activate'} this product`}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <span
                          className={`badge-tag ${isActive ? 'badge-stock' : 'badge-out-of-stock'}`}
                          style={{
                            fontSize: '0.78rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            cursor: 'pointer',
                          }}
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

                    {/* Actions */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                        <Link
                          to={`/products/${prodId}`}
                          className="btn-table-action"
                          title="View specification detail"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          <span>View</span>
                        </Link>

                        <button
                          type="button"
                          className="btn-table-action btn-table-edit"
                          onClick={() => onEditProduct(product)}
                          title="Edit product information"
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
                          onClick={() => handleDelete(product)}
                          disabled={deletingId === prodId}
                          title="Delete product listing"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                          <span>{deletingId === prodId ? '...' : 'Delete'}</span>
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
  );
}
