import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Cart() {
  const {
    items,
    loading,
    actionLoading,
    cartError,
    fetchCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    cartCount,
    shipping,
    tax,
    grandTotal,
    toast,
  } = useCart();

  const { user } = useAuth();
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Admin access guard
  if (user?.role === 'admin') {
    return (
      <div className="cart-page-container">
        <div className="products-empty-state" style={{ marginTop: 40 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#eff6ff', color: 'var(--accent-color)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h3 className="empty-state-title">Admin Role Restriction</h3>
          <p className="empty-state-desc">
            Administrator accounts are restricted from consumer shopping carts and checkout operations. Please utilize the inventory management table and admin dashboard to manage products and store orders.
          </p>
          <Link to="/products" className="btn-empty-reset" style={{ textDecoration: 'none', display: 'inline-block', marginTop: 12 }}>
            Manage Inventory Table &rarr;
          </Link>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = () => {
    setOrderPlaced(true);
    setTimeout(async () => {
      await clearCart();
      setCheckoutModalOpen(false);
      setOrderPlaced(false);
    }, 2200);
  };

  return (
    <div className="cart-page-container">
      {/* Inline Toast Banner if present */}
      {toast && (
        <div className={`global-toast-notification ${toast.type || 'success'}`} style={{ position: 'relative', top: 0, left: 0, transform: 'none', marginBottom: 16 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Cart Page Header */}
      <div className="page-header-block">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-title">Shopping Cart</h1>
            <p className="page-subtitle">
              {user ? `Welcome back, ${user.name}. Your cart items are saved to your account.` : 'Review items, adjust quantities, and proceed to checkout.'}
            </p>
          </div>
          {items.length > 0 && !loading && (
            <button
              type="button"
              className="btn-clear-cart"
              onClick={clearCart}
              disabled={actionLoading}
              title="Remove all items from your cart"
            >
              Clear Cart
            </button>
          )}
        </div>
      </div>

      {/* Error state if server sync failed */}
      {cartError && (
        <div
          style={{
            marginBottom: 20,
            padding: '12px 16px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 8,
            color: '#991b1b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{cartError}</span>
          </div>
          <button
            type="button"
            onClick={fetchCart}
            style={{
              background: 'none',
              border: 'none',
              color: '#b91c1c',
              fontWeight: 600,
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div style={{ padding: '48px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, color: 'var(--text-secondary)' }}>
          <svg className="spinner-icon" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--accent-color)' }}>
            <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
          </svg>
          <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>Syncing shopping cart...</span>
        </div>
      ) : items.length === 0 ? (
        /* Empty Cart State */
        <div className="placeholder-empty-state">
          <div className="empty-state-icon-box">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </div>
          <h2 className="empty-state-title">Your Cart is Currently Empty</h2>
          <p className="empty-state-desc">
            Explore our curated catalog of electronics, lifestyle essentials, and apparel.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/" className="btn-empty-cart-action">
              &larr; Browse Storefront
            </Link>
            <Link to="/products" className="btn-empty-cart-action" style={{ background: '#f8fafc', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
              View All Products
            </Link>
          </div>
        </div>
      ) : (
        /* Active Cart Content */
        <div className="cart-content-grid">
          {/* Cart Items Column */}
          <div className="cart-items-column">
            <div className="cart-items-card">
              <div className="cart-items-header">
                <span>Products ({cartCount} {cartCount === 1 ? 'item' : 'items'})</span>
                <span>Price</span>
              </div>

              <div className="cart-items-list">
                {items.map(({ product, quantity, itemSubtotal }) => {
                  if (!product) return null;
                  const pId = product._id || product.id;
                  const itemPrice = Number(product.price) || 0;
                  const availableStock = typeof product.stock === 'number' ? product.stock : 99;
                  const computedSubtotal = itemSubtotal != null ? itemSubtotal : itemPrice * quantity;
                  const isMaxStockReached = quantity >= availableStock;
                  const imageUrl =
                    Array.isArray(product.images) && product.images[0]
                      ? product.images[0]
                      : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';

                  return (
                    <div key={pId} className="cart-item-row">
                      <div className="cart-item-image-col">
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="cart-item-thumb"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';
                          }}
                        />
                      </div>

                      <div className="cart-item-info-col">
                        <div className="cart-item-category">
                          {product.category?.name || 'Store Item'}
                        </div>
                        <h3 className="cart-item-name">{product.name}</h3>
                        <div className="cart-item-unit-price">
                          ${itemPrice.toFixed(2)} each
                        </div>

                        {/* Stock indicator badge */}
                        <div style={{ marginTop: 4, marginBottom: 8, fontSize: '0.8rem' }}>
                          {availableStock <= 5 ? (
                            <span style={{ color: '#b45309', fontWeight: 600 }}>
                              ⚠️ Only {availableStock} left in stock
                            </span>
                          ) : (
                            <span style={{ color: '#059669', fontWeight: 500 }}>
                              ✓ In Stock ({availableStock} available)
                            </span>
                          )}
                        </div>

                        {/* Quantity Stepper & Remove */}
                        <div className="cart-item-controls">
                          <div className="cart-quantity-stepper">
                            <button
                              type="button"
                              onClick={() => updateQuantity(pId, quantity - 1)}
                              disabled={actionLoading || quantity <= 1}
                              aria-label="Decrease quantity"
                              title={quantity <= 1 ? 'Minimum quantity is 1 (use Remove to delete)' : 'Decrease quantity'}
                            >
                              -
                            </button>
                            <span className="cart-quantity-num">{quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(pId, quantity + 1)}
                              disabled={actionLoading || isMaxStockReached}
                              aria-label="Increase quantity"
                              title={isMaxStockReached ? `Maximum available stock (${availableStock}) reached` : 'Increase quantity'}
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            className="cart-btn-remove"
                            onClick={() => removeFromCart(pId)}
                            disabled={actionLoading}
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className="cart-item-subtotal-col">
                        <span className="cart-item-subtotal">
                          ${computedSubtotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <Link to="/" className="btn-continue-shopping-link">
                &larr; Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="cart-summary-column">
            <div className="cart-summary-card">
              <h2 className="summary-title">Order Summary</h2>

              <div className="summary-rows">
                <div className="summary-row">
                  <span>Subtotal ({cartCount} {cartCount === 1 ? 'item' : 'items'})</span>
                  <span>${cartSubtotal.toFixed(2)}</span>
                </div>

                <div className="summary-row">
                  <span>
                    Shipping
                    {shipping === 0 && <span className="free-shipping-tag">FREE</span>}
                  </span>
                  <span>{shipping === 0 ? '$0.00' : `$${shipping.toFixed(2)}`}</span>
                </div>

                <div className="summary-row">
                  <span>Estimated Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>

                {cartSubtotal < 50 && (
                  <div className="shipping-progress-notice">
                    Add ${(50 - cartSubtotal).toFixed(2)} more to qualify for <strong>FREE shipping</strong>!
                  </div>
                )}

                <div className="summary-divider" />

                <div className="summary-row total">
                  <span>Estimated Total</span>
                  <span className="summary-total-val">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="button"
                className="btn-checkout-primary"
                onClick={() => setCheckoutModalOpen(true)}
                disabled={actionLoading || items.length === 0}
              >
                Proceed to Checkout &rarr;
              </button>

              <div className="summary-guarantees">
                <div className="guarantee-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span>Bank-grade 256-bit encrypted checkout</span>
                </div>
                <div className="guarantee-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>30-day money-back satisfaction guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {checkoutModalOpen && (
        <div className="quickview-modal-backdrop" onClick={() => !orderPlaced && setCheckoutModalOpen(false)}>
          <div className="checkout-modal-content" onClick={(e) => e.stopPropagation()}>
            {orderPlaced ? (
              <div className="order-success-pane">
                <div className="success-icon-box">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h2>Order Placed Successfully!</h2>
                <p>Thank you for your purchase. A confirmation email with tracking has been sent.</p>
                <div className="success-spinner-note">Finalizing order details...</div>
              </div>
            ) : (
              <div>
                <div className="checkout-modal-header">
                  <h2>Confirm Order</h2>
                  <button type="button" onClick={() => setCheckoutModalOpen(false)} className="close-btn">
                    &times;
                  </button>
                </div>

                <div className="checkout-summary-breakdown">
                  <p>You are about to place an order for <strong>{cartCount} items</strong>:</p>
                  <div className="checkout-items-preview">
                    {items.map(({ product, quantity }) => (
                      <div key={product._id || product.id} className="preview-line">
                        <span>{quantity}x {product.name}</span>
                        <span>${((Number(product.price) || 0) * quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="checkout-final-total">
                    <span>Total Amount:</span>
                    <strong>${grandTotal.toFixed(2)}</strong>
                  </div>
                </div>

                <div className="checkout-modal-actions">
                  <button
                    type="button"
                    className="btn-modal-cancel"
                    onClick={() => setCheckoutModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn-modal-confirm"
                    onClick={handlePlaceOrder}
                  >
                    Confirm &amp; Place Order (${grandTotal.toFixed(2)})
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
