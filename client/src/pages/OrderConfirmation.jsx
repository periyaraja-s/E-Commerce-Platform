import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import api from '../services/api.js';

export default function OrderConfirmation() {
  const { id } = useParams();
  const location = useLocation();

  // Try to use order from navigation state if freshly placed
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // If order is not in state or ID changed, fetch from API
    if (!order || (order._id !== id && order.orderNumber !== id)) {
      setLoading(true);
      api
        .get(`/orders/${id}`)
        .then((res) => {
          if (res.data?.success && res.data?.data) {
            setOrder(res.data.data);
          } else {
            setError('Order details could not be found.');
          }
        })
        .catch((err) => {
          console.error('Failed to fetch order details:', err);
          setError(
            err.response?.data?.message || 'Failed to load order details. Please verify the order number.'
          );
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  const handleCopyOrderNumber = () => {
    if (order?.orderNumber) {
      navigator.clipboard.writeText(order.orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="cart-page-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <svg
          className="spinner-icon"
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          style={{ color: 'var(--accent-color)', margin: '0 auto 16px' }}
        >
          <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
        </svg>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Retrieving Order Confirmation...
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: 6 }}>
          Fetching receipt information and item records.
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="cart-page-container">
        <div className="products-empty-state" style={{ marginTop: 40 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: '#fef2f2',
              color: '#ef4444',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h3 className="empty-state-title">Order Not Found</h3>
          <p className="empty-state-desc">
            {error || "We couldn't locate the requested order in our records."}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
            <Link to="/orders" className="btn-empty-reset" style={{ textDecoration: 'none' }}>
              View All Orders
            </Link>
            <Link to="/products" className="btn-empty-reset" style={{ textDecoration: 'none', background: '#f1f5f9', color: '#334155' }}>
              Browse Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const items = order.items || [];
  const shippingAddress = order.shippingAddress || {};
  const orderDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="cart-page-container order-confirmation-wrapper">
      {/* Print-friendly Header */}
      <div className="confirmation-hero-banner">
        <div className="confirmation-check-circle">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="confirmation-main-title">Order Confirmed!</h1>
        <p className="confirmation-main-subtitle">
          Thank you for shopping with us. We have received your order and are preparing it for shipment.
        </p>

        {/* Order Reference Number Card */}
        <div className="confirmation-ref-pill">
          <span className="ref-label">Order Reference:</span>
          <strong className="ref-code">{order.orderNumber}</strong>
          <button
            type="button"
            className="btn-copy-ref"
            onClick={handleCopyOrderNumber}
            title="Copy Order Reference Number"
          >
            {copied ? (
              <span style={{ color: '#059669', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Copied!
              </span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="confirmation-actions-toolbar no-print">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span className="order-status-badge confirmed">Status: {order.status?.toUpperCase()}</span>
          <span className="order-payment-badge">
            Payment: {order.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery (Pending)' : order.paymentStatus?.toUpperCase()}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" onClick={handlePrint} className="btn-confirm-action secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print Receipt
          </button>
          <Link to="/orders" className="btn-confirm-action secondary">
            View All Orders
          </Link>
          <Link to="/products" className="btn-confirm-action primary">
            Continue Shopping &rarr;
          </Link>
        </div>
      </div>

      {/* Confirmation Details Grid */}
      <div className="confirmation-details-grid">
        {/* Left Column: Items List */}
        <div className="confirmation-card">
          <h2 className="confirm-card-heading">
            Ordered Items ({items.reduce((s, i) => s + (i.quantity || 1), 0)})
          </h2>

          <div className="confirm-items-table">
            {items.map((item, idx) => {
              const unitPrice = Number(item.price) || 0;
              const qty = Number(item.quantity) || 1;
              const subtotal = item.subtotal != null ? item.subtotal : unitPrice * qty;
              const img =
                item.image ||
                (item.product?.images && item.product.images[0]) ||
                'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';

              return (
                <div key={item._id || item.product?._id || idx} className="confirm-item-row">
                  <img
                    src={img}
                    alt={item.name}
                    className="confirm-item-thumb"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';
                    }}
                  />
                  <div className="confirm-item-meta">
                    <div className="confirm-item-title">{item.name}</div>
                    <div className="confirm-item-subtitle">
                      ${unitPrice.toFixed(2)} each &times; {qty}
                    </div>
                  </div>
                  <div className="confirm-item-total">
                    ${subtotal.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pricing Breakdown */}
          <div className="confirm-pricing-breakdown">
            <div className="confirm-price-row">
              <span>Subtotal</span>
              <span>${Number(order.subtotal || 0).toFixed(2)}</span>
            </div>
            <div className="confirm-price-row">
              <span>Shipping</span>
              <span>
                {Number(order.shippingFee) === 0 ? 'FREE ($0.00)' : `$${Number(order.shippingFee).toFixed(2)}`}
              </span>
            </div>
            <div className="confirm-price-row">
              <span>Tax</span>
              <span>${Number(order.tax || 0).toFixed(2)}</span>
            </div>
            <div className="confirm-price-row total">
              <span>Total Paid / Due</span>
              <span className="total-highlight">${Number(order.total || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Customer & Delivery Info */}
        <div className="confirmation-sidebar-column">
          {/* Shipping Address Card */}
          <div className="confirmation-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div className="icon-badge-round">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <h3 className="confirm-card-heading" style={{ margin: 0 }}>Shipping Details</h3>
            </div>

            <div className="confirm-address-block">
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.96rem' }}>
                {shippingAddress.name || order.user?.name}
              </div>
              <div style={{ color: '#475569', fontSize: '0.88rem', marginTop: 4 }}>
                {shippingAddress.line1}
              </div>
              {shippingAddress.line2 && (
                <div style={{ color: '#475569', fontSize: '0.88rem' }}>
                  {shippingAddress.line2}
                </div>
              )}
              <div style={{ color: '#475569', fontSize: '0.88rem' }}>
                {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
              </div>
              <div style={{ color: '#64748b', fontSize: '0.84rem', marginTop: 2 }}>
                {shippingAddress.country || 'United States'}
              </div>

              {shippingAddress.phone && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px dashed #e2e8f0', fontSize: '0.86rem', color: '#334155' }}>
                  <strong>Phone:</strong> {shippingAddress.phone}
                </div>
              )}

              {order.notes && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px dashed #e2e8f0', fontSize: '0.84rem', color: '#64748b' }}>
                  <strong>Delivery Note:</strong> {order.notes}
                </div>
              )}
            </div>
          </div>

          {/* Order Details & Timing */}
          <div className="confirmation-card" style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div className="icon-badge-round">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3 className="confirm-card-heading" style={{ margin: 0 }}>Order Timeline</h3>
            </div>

            <div className="confirm-meta-list">
              <div className="confirm-meta-item">
                <span className="meta-label">Date Placed:</span>
                <span className="meta-val">{orderDate}</span>
              </div>
              <div className="confirm-meta-item">
                <span className="meta-label">Est. Delivery:</span>
                <span className="meta-val" style={{ color: '#059669', fontWeight: 600 }}>
                  2–3 Business Days
                </span>
              </div>
              <div className="confirm-meta-item">
                <span className="meta-label">Fulfillment:</span>
                <span className="meta-val">Standard Ground</span>
              </div>
              <div className="confirm-meta-item">
                <span className="meta-label">Payment Method:</span>
                <span className="meta-val">Cash / Pay on Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
