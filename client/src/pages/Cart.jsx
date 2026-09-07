import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';

export default function Cart() {
  const { items, updateQuantity, removeFromCart, clearCart, cartTotal, cartCount } = useCart();
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const shipping = cartTotal >= 50 ? 0 : 9.99;
  const tax = cartTotal * 0.08;
  const grandTotal = cartTotal + (cartTotal > 0 ? shipping + tax : 0);

  const handlePlaceOrder = () => {
    setOrderPlaced(true);
    setTimeout(() => {
      clearCart();
      setCheckoutModalOpen(false);
      setOrderPlaced(false);
    }, 2200);
  };

  return (
    <div className="cart-page-container">
      {/* Header */}
      <div className="page-header-block">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-title">Shopping Cart</h1>
            <p className="page-subtitle">Review items, adjust quantities, and proceed to checkout.</p>
          </div>
          {items.length > 0 && (
            <button
              type="button"
              className="btn-clear-cart"
              onClick={clearCart}
            >
              Clear Cart
            </button>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="placeholder-empty-state">
          <div className="empty-state-icon-box">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </div>
          <h2 className="empty-state-title">Your Cart is Currently Empty</h2>
          <p className="empty-state-desc">
            Explore our curated selection of premium audio, workplace essentials, and apparel.
          </p>
          <Link to="/" className="btn-empty-cart-action">
            &larr; Browse Catalog &amp; Shop
          </Link>
        </div>
      ) : (
        <div className="cart-content-grid">
          {/* Cart Items Column */}
          <div className="cart-items-column">
            <div className="cart-items-card">
              <div className="cart-items-header">
                <span>Products ({cartCount} {cartCount === 1 ? 'item' : 'items'})</span>
                <span>Price</span>
              </div>

              <div className="cart-items-list">
                {items.map(({ product, quantity }) => {
                  const pId = product._id || product.id;
                  const itemPrice = Number(product.price) || 0;
                  const maxStock = typeof product.stock === 'number' ? product.stock : 99;
                  const itemSubtotal = itemPrice * quantity;
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
                          {product.category?.name || 'Category'}
                        </div>
                        <h3 className="cart-item-name">{product.name}</h3>
                        <div className="cart-item-unit-price">
                          ${itemPrice.toFixed(2)} each
                        </div>

                        {/* Quantity Stepper & Remove */}
                        <div className="cart-item-controls">
                          <div className="cart-quantity-stepper">
                            <button
                              type="button"
                              onClick={() => updateQuantity(pId, quantity - 1)}
                              aria-label="Decrease quantity"
                            >
                              -
                            </button>
                            <span className="cart-quantity-num">{quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(pId, Math.min(maxStock, quantity + 1))}
                              disabled={quantity >= maxStock}
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            className="cart-btn-remove"
                            onClick={() => removeFromCart(pId)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className="cart-item-subtotal-col">
                        <span className="cart-item-subtotal">
                          ${itemSubtotal.toFixed(2)}
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
                  <span>Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
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

                {cartTotal < 50 && (
                  <div className="shipping-progress-notice">
                    Add ${(50 - cartTotal).toFixed(2)} more to qualify for <strong>FREE shipping</strong>!
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
