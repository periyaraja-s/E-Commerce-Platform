import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function ProductQuickViewModal({ product, onClose }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const isAdmin = user?.role === 'admin';
  const isOutOfStock = Number(product.stock) <= 0;
  const maxStock = Number(product.stock) || 0;
  const categoryName = product.category?.name || 'General';

  const imageUrl =
    Array.isArray(product.images) && product.images[0]
      ? product.images[0]
      : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';

  const handleAddToCart = async () => {
    if (isAdmin || isOutOfStock) return;

    const res = await addToCart(product, quantity);
    if (res?.success) {
      setAdded(true);
      setTimeout(() => {
        setAdded(false);
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="quickview-modal-backdrop" onClick={onClose}>
      <div
        className="quickview-modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          className="quickview-modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          &times;
        </button>

        <div className="quickview-modal-grid">
          {/* Gallery / Image */}
          <div className="quickview-image-pane">
            <img
              src={imageUrl}
              alt={product.name}
              className="quickview-img"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';
              }}
            />
          </div>

          {/* Details */}
          <div className="quickview-details-pane">
            <div className="quickview-meta-badges">
              <span className="badge-category-chip">{categoryName}</span>
              <span className={`badge-stock-chip ${isOutOfStock ? 'out' : 'in'}`}>
                {isOutOfStock ? 'Out of Stock' : `${product.stock} units available`}
              </span>
            </div>

            <h2 className="quickview-title">{product.name}</h2>

            <div className="quickview-price-tag">
              ${Number(product.price).toFixed(2)}
            </div>

            <p className="quickview-description">
              {product.description || 'Crafted with premium materials and engineered for longevity.'}
            </p>

            {/* Inventory Meta */}
            <div className="quickview-specs-box">
              <div className="spec-item">
                <span className="spec-label">Product ID:</span>
                <span className="spec-val">{product.slug || product._id}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Shipping:</span>
                <span className="spec-val">Free on orders over $50</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Warranty:</span>
                <span className="spec-val">1-Year Standard Guarantee</span>
              </div>
            </div>

            {/* Action buttons */}
            {isAdmin ? (
              <div className="quickview-actions-row">
                <button
                  type="button"
                  className="btn-quickview-cart"
                  onClick={() => {
                    onClose();
                    navigate(`/products/${product._id || product.id}`);
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  <span>Manage in Inventory</span>
                </button>
              </div>
            ) : (
              <div className="quickview-actions-row">
                {!isOutOfStock && (
                  <div className="quantity-stepper">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="quantity-val">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                      disabled={quantity >= maxStock}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  className={`btn-quickview-cart ${added ? 'added' : ''}`}
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                >
                  {isOutOfStock ? (
                    <span>Out of Stock</span>
                  ) : added ? (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <circle cx="9" cy="21" r="1" />
                        <circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                      </svg>
                      <span>{user ? `Add ${quantity} to Cart` : 'Sign in to Add'}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
