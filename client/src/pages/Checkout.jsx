import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    items,
    loading: cartLoading,
    cartSubtotal,
    cartCount,
    shipping,
    tax,
    grandTotal,
    clearCart,
  } = useCart();

  // Shipping & Contact form state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    notes: '',
  });

  // Validation errors
  const [errors, setErrors] = useState({});
  // Submission & server error state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  // Sync user name/email if user loads late
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  // Admin access restriction
  if (user?.role === 'admin') {
    return (
      <div className="cart-page-container">
        <div className="products-empty-state" style={{ marginTop: 40 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: '#eff6ff',
              color: 'var(--accent-color)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h3 className="empty-state-title">Admin Account Notice</h3>
          <p className="empty-state-desc">
            Administrators manage products and view store orders, but cannot place consumer retail orders.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
            <Link to="/orders" className="btn-empty-reset" style={{ textDecoration: 'none' }}>
              View Store Orders &rarr;
            </Link>
            <Link to="/products" className="btn-empty-reset" style={{ textDecoration: 'none', background: '#f1f5f9', color: '#334155' }}>
              Manage Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Handle empty cart state
  if (!cartLoading && items.length === 0) {
    return (
      <div className="cart-page-container">
        <div className="placeholder-empty-state" style={{ marginTop: 40 }}>
          <div className="empty-state-icon-box">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </div>
          <h2 className="empty-state-title">Your Cart is Empty</h2>
          <p className="empty-state-desc">
            You cannot proceed to checkout without items in your shopping cart. Add your favorite products first!
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link to="/products" className="btn-empty-cart-action">
              Explore Products &rarr;
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (formData.phone.trim().replace(/\D/g, '').length < 7) {
      newErrors.phone = 'Please provide a valid phone number (minimum 7 digits)';
    }

    if (!formData.line1.trim()) newErrors.line1 = 'Street address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State or province is required';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal / ZIP code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Map current cart items for backup validation
      const itemsPayload = items.map((item) => ({
        product: item.product._id || item.product.id || item.product,
        quantity: item.quantity,
        name: item.product.name,
        price: item.product.price,
      }));

      const payload = {
        shippingAddress: {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          line1: formData.line1.trim(),
          line2: (formData.line2 || '').trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          postalCode: formData.postalCode.trim(),
          country: formData.country.trim(),
        },
        paymentMethod: 'cash_on_delivery',
        notes: (formData.notes || '').trim(),
        items: itemsPayload,
      };

      const res = await api.post('/orders', payload);

      if (res.data?.success && res.data?.data) {
        const createdOrder = res.data.data;
        // Clear customer cart context state
        await clearCart();

        // Navigate to dedicated Order Confirmation screen
        navigate(`/order-confirmation/${createdOrder._id || createdOrder.orderNumber}`, {
          state: { order: createdOrder, isNewOrder: true },
          replace: true,
        });
      } else {
        throw new Error(res.data?.message || 'Order creation failed. Please try again.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      const message =
        err.response?.data?.message ||
        err.message ||
        'An error occurred while placing your order. Please check your information and try again.';
      setServerError(message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cart-page-container">
      {/* Breadcrumb Navigation */}
      <nav style={{ marginBottom: 16, fontSize: '0.86rem', color: 'var(--text-secondary)' }} aria-label="Breadcrumb">
        <Link to="/cart" style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>
          &larr; Return to Cart
        </Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Checkout</span>
      </nav>

      <div className="page-header-block" style={{ marginBottom: 24 }}>
        <h1 className="page-title">Checkout</h1>
        <p className="page-subtitle">
          Confirm your delivery address, review order items, and place your order.
        </p>
      </div>

      {/* Global Server Error Alert */}
      {serverError && (
        <div
          role="alert"
          style={{
            marginBottom: 24,
            padding: '16px 20px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 10,
            color: '#991b1b',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ flexShrink: 0, marginTop: 2 }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div style={{ flex: 1 }}>
            <strong style={{ display: 'block', fontSize: '0.95rem', marginBottom: 2 }}>Unable to place order</strong>
            <span style={{ fontSize: '0.9rem' }}>{serverError}</span>
          </div>
          <button
            type="button"
            onClick={() => setServerError(null)}
            style={{ background: 'none', border: 'none', color: '#991b1b', fontSize: '1.2rem', cursor: 'pointer', padding: 0 }}
            aria-label="Dismiss error"
          >
            &times;
          </button>
        </div>
      )}

      {/* Main Checkout Two-Column Grid */}
      <div className="checkout-main-grid">
        {/* Left Column: Customer & Delivery Address Form */}
        <div className="checkout-form-column">
          <form id="checkout-address-form" onSubmit={handleSubmitOrder}>
            {/* Contact Information */}
            <div className="checkout-section-card">
              <div className="checkout-section-header">
                <div className="step-badge">1</div>
                <div>
                  <h2 className="section-heading">Contact Information</h2>
                  <p className="section-subheading">We will use this to send order confirmations and delivery updates.</p>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-field-group">
                  <label htmlFor="checkout-name" className="field-label">
                    Full Name <span className="required-star">*</span>
                  </label>
                  <input
                    id="checkout-name"
                    type="text"
                    name="name"
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    className={`field-input ${errors.name ? 'input-error' : ''}`}
                    disabled={isSubmitting}
                  />
                  {errors.name && <span className="field-error-msg">{errors.name}</span>}
                </div>

                <div className="form-field-group">
                  <label htmlFor="checkout-email" className="field-label">
                    Email Address <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>(Account)</span>
                  </label>
                  <input
                    id="checkout-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    readOnly
                    className="field-input input-readonly"
                    disabled
                  />
                </div>
              </div>

              <div className="form-field-group" style={{ marginTop: 14 }}>
                <label htmlFor="checkout-phone" className="field-label">
                  Phone Number <span className="required-star">*</span>
                </label>
                <input
                  id="checkout-phone"
                  type="tel"
                  name="phone"
                  placeholder="e.g. +1 (555) 019-2834"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`field-input ${errors.phone ? 'input-error' : ''}`}
                  disabled={isSubmitting}
                />
                {errors.phone ? (
                  <span className="field-error-msg">{errors.phone}</span>
                ) : (
                  <span className="field-hint">Required for carrier delivery and dispatch notifications</span>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="checkout-section-card" style={{ marginTop: 20 }}>
              <div className="checkout-section-header">
                <div className="step-badge">2</div>
                <div>
                  <h2 className="section-heading">Shipping Address</h2>
                  <p className="section-subheading">Where should we deliver your order?</p>
                </div>
              </div>

              <div className="form-field-group">
                <label htmlFor="checkout-line1" className="field-label">
                  Street Address <span className="required-star">*</span>
                </label>
                <input
                  id="checkout-line1"
                  type="text"
                  name="line1"
                  placeholder="House / Flat No., Street, Building"
                  value={formData.line1}
                  onChange={handleChange}
                  className={`field-input ${errors.line1 ? 'input-error' : ''}`}
                  disabled={isSubmitting}
                />
                {errors.line1 && <span className="field-error-msg">{errors.line1}</span>}
              </div>

              <div className="form-field-group" style={{ marginTop: 14 }}>
                <label htmlFor="checkout-line2" className="field-label">
                  Apartment, Suite, Unit <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>(Optional)</span>
                </label>
                <input
                  id="checkout-line2"
                  type="text"
                  name="line2"
                  placeholder="Apt, Suite, Floor, Landmark"
                  value={formData.line2}
                  onChange={handleChange}
                  className="field-input"
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-grid-3" style={{ marginTop: 14 }}>
                <div className="form-field-group">
                  <label htmlFor="checkout-city" className="field-label">
                    City <span className="required-star">*</span>
                  </label>
                  <input
                    id="checkout-city"
                    type="text"
                    name="city"
                    placeholder="e.g. San Francisco"
                    value={formData.city}
                    onChange={handleChange}
                    className={`field-input ${errors.city ? 'input-error' : ''}`}
                    disabled={isSubmitting}
                  />
                  {errors.city && <span className="field-error-msg">{errors.city}</span>}
                </div>

                <div className="form-field-group">
                  <label htmlFor="checkout-state" className="field-label">
                    State / Province <span className="required-star">*</span>
                  </label>
                  <input
                    id="checkout-state"
                    type="text"
                    name="state"
                    placeholder="e.g. CA"
                    value={formData.state}
                    onChange={handleChange}
                    className={`field-input ${errors.state ? 'input-error' : ''}`}
                    disabled={isSubmitting}
                  />
                  {errors.state && <span className="field-error-msg">{errors.state}</span>}
                </div>

                <div className="form-field-group">
                  <label htmlFor="checkout-postal" className="field-label">
                    Postal / ZIP Code <span className="required-star">*</span>
                  </label>
                  <input
                    id="checkout-postal"
                    type="text"
                    name="postalCode"
                    placeholder="e.g. 94105"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className={`field-input ${errors.postalCode ? 'input-error' : ''}`}
                    disabled={isSubmitting}
                  />
                  {errors.postalCode && <span className="field-error-msg">{errors.postalCode}</span>}
                </div>
              </div>

              <div className="form-field-group" style={{ marginTop: 14 }}>
                <label htmlFor="checkout-country" className="field-label">
                  Country / Region
                </label>
                <select
                  id="checkout-country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="field-input"
                  disabled={isSubmitting}
                >
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="India">India</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                </select>
              </div>

              <div className="form-field-group" style={{ marginTop: 14 }}>
                <label htmlFor="checkout-notes" className="field-label">
                  Delivery Instructions <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>(Optional)</span>
                </label>
                <textarea
                  id="checkout-notes"
                  name="notes"
                  rows={2}
                  placeholder="e.g. Leave package on front porch, gate code #4912"
                  value={formData.notes}
                  onChange={handleChange}
                  className="field-input"
                  style={{ resize: 'vertical' }}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Payment Method Notice */}
            <div className="checkout-section-card" style={{ marginTop: 20 }}>
              <div className="checkout-section-header">
                <div className="step-badge">3</div>
                <div>
                  <h2 className="section-heading">Payment Method</h2>
                  <p className="section-subheading">Standard secure payment method</p>
                </div>
              </div>

              <div className="payment-method-tile active">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="payment-radio-circle checked">
                    <div className="payment-radio-inner" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                      Cash on Delivery / Standard Invoice
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 2 }}>
                      Pay conveniently upon package arrival. No payment card or credentials required today.
                    </div>
                  </div>
                </div>
                <span className="payment-badge-active">Standard</span>
              </div>

              <div className="payment-gateway-notice">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, color: 'var(--accent-color)' }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>
                  Online card payments &amp; digital wallets are in active certification and scheduled for an upcoming release.
                </span>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Order Summary & Review */}
        <div className="checkout-summary-column">
          <div className="checkout-summary-card">
            <div className="summary-card-header">
              <h2 className="summary-title">Order Summary</h2>
              <span className="summary-items-count-badge">
                {cartCount} {cartCount === 1 ? 'item' : 'items'}
              </span>
            </div>

            {/* Items List Preview */}
            <div className="checkout-items-scroll-list">
              {items.map(({ product, quantity, itemSubtotal }) => {
                if (!product) return null;
                const pId = product._id || product.id;
                const price = Number(product.price) || 0;
                const computed = itemSubtotal != null ? itemSubtotal : price * quantity;
                const img =
                  Array.isArray(product.images) && product.images[0]
                    ? product.images[0]
                    : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';

                return (
                  <div key={pId} className="checkout-summary-item-row">
                    <div className="checkout-item-thumb-wrapper">
                      <img
                        src={img}
                        alt={product.name}
                        className="checkout-item-thumb"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';
                        }}
                      />
                      <span className="checkout-item-qty-pill">{quantity}</span>
                    </div>

                    <div className="checkout-item-info">
                      <div className="checkout-item-name">{product.name}</div>
                      <div className="checkout-item-meta">
                        ${price.toFixed(2)} &times; {quantity}
                      </div>
                    </div>

                    <div className="checkout-item-total">
                      ${computed.toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Financial Breakdown */}
            <div className="summary-financials-block">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${cartSubtotal.toFixed(2)}</span>
              </div>

              <div className="summary-row">
                <span>
                  Shipping &amp; Handling
                  {shipping === 0 && <span className="free-shipping-tag">FREE</span>}
                </span>
                <span>{shipping === 0 ? '$0.00' : `$${shipping.toFixed(2)}`}</span>
              </div>

              <div className="summary-row">
                <span>Estimated Sales Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>

              {cartSubtotal < 50 && (
                <div className="shipping-progress-notice" style={{ marginTop: 8, marginBottom: 8 }}>
                  Add ${(50 - cartSubtotal).toFixed(2)} more to qualify for <strong>FREE shipping</strong>!
                </div>
              )}

              <div className="summary-divider" />

              <div className="summary-row total">
                <span>Total Amount Due</span>
                <span className="summary-total-val">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Submit / Place Order Button */}
            <button
              type="submit"
              form="checkout-address-form"
              className="btn-checkout-primary"
              disabled={isSubmitting || cartLoading || items.length === 0}
              style={{ marginTop: 20 }}
            >
              {isSubmitting ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                  <svg className="spinner-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
                  </svg>
                  Processing &amp; Creating Order...
                </span>
              ) : (
                `Place Order • $${grandTotal.toFixed(2)}`
              )}
            </button>

            {/* Trust and Guarantee Badges */}
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
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Stock reserved and validated server-side</span>
              </div>
              <div className="guarantee-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>30-day money-back return guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
