import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';

export default function Orders() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/orders');
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setOrders(res.data.data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError(err.response?.data?.message || 'Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      if (res.data?.success && res.data?.data) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === 'all') return true;
    return order.status?.toLowerCase() === statusFilter.toLowerCase();
  });

  return (
    <div className="cart-page-container">
      <div className="page-header-block" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title">{isAdmin ? 'Store Orders' : 'My Orders'}</h1>
          <p className="page-subtitle">
            {isAdmin
              ? 'Review, track, and update all customer retail orders and delivery statuses.'
              : 'Track past purchases, shipping addresses, delivery statuses, and print receipts.'}
          </p>
        </div>

        <button
          type="button"
          onClick={fetchOrders}
          className="btn-add-product-primary"
          style={{ background: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1' }}
          disabled={loading}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={loading ? 'spinner-icon' : ''}>
            <path d="M23 4v6h-6" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="orders-filter-bar">
        {['all', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((tab) => (
          <button
            key={tab}
            type="button"
            className={`order-filter-tab ${statusFilter === tab ? 'active' : ''}`}
            onClick={() => setStatusFilter(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'all' && <span className="tab-count">({orders.length})</span>}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <svg
            className="spinner-icon"
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            style={{ color: 'var(--accent-color)', margin: '0 auto 12px' }}
          >
            <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
          </svg>
          <p style={{ color: 'var(--text-secondary)' }}>Loading orders...</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 10,
            color: '#991b1b',
            marginBottom: 20,
          }}
        >
          <p>{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredOrders.length === 0 && (
        <div className="placeholder-empty-state" style={{ marginTop: 24 }}>
          <div className="empty-state-icon-box">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <h2 className="empty-state-title">
            {statusFilter === 'all' ? 'No Orders Found' : `No ${statusFilter} Orders`}
          </h2>
          <p className="empty-state-desc">
            {statusFilter === 'all'
              ? isAdmin
                ? 'No customer orders have been placed yet.'
                : "You haven't placed any orders yet. Discover our quality catalog and place your first order today!"
              : `There are currently no orders in "${statusFilter}" status.`}
          </p>
          {!isAdmin && (
            <div style={{ marginTop: 16 }}>
              <Link to="/products" className="btn-empty-cart-action">
                Start Shopping &rarr;
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Orders List */}
      {!loading && filteredOrders.length > 0 && (
        <div className="orders-cards-list">
          {filteredOrders.map((order) => {
            const itemsCount = (order.items || []).reduce((s, i) => s + (i.quantity || 1), 0);
            const dateStr = new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

            return (
              <div key={order._id || order.orderNumber} className="order-history-card">
                {/* Header row */}
                <div className="order-card-header">
                  <div className="order-card-primary-meta">
                    <div className="order-num-badge">
                      <span>Order #</span>
                      <strong>{order.orderNumber}</strong>
                    </div>
                    <span className="order-date-tag">{dateStr}</span>
                    {isAdmin && order.user && (
                      <span className="order-customer-tag">
                        Customer: <strong>{order.user.name || order.user.email}</strong>
                      </span>
                    )}
                  </div>

                  <div className="order-card-status-controls">
                    {/* Status Pill */}
                    <span className={`order-status-pill status-${order.status || 'confirmed'}`}>
                      {(order.status || 'confirmed').toUpperCase()}
                    </span>

                    {/* Admin status switcher */}
                    {isAdmin && (
                      <select
                        value={order.status || 'confirmed'}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        disabled={updatingId === order._id}
                        className="admin-status-dropdown"
                        aria-label="Update Order Status"
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    )}
                  </div>
                </div>

                {/* Items Summary & Images Preview */}
                <div className="order-card-body">
                  <div className="order-items-thumbnails-row">
                    {(order.items || []).slice(0, 4).map((item, idx) => {
                      const img =
                        item.image ||
                        (item.product?.images && item.product.images[0]) ||
                        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';
                      return (
                        <div key={item._id || idx} className="order-thumb-box" title={`${item.name} (${item.quantity}x)`}>
                          <img src={img} alt={item.name} />
                          {item.quantity > 1 && <span className="order-thumb-qty">{item.quantity}</span>}
                        </div>
                      );
                    })}
                    {(order.items || []).length > 4 && (
                      <div className="order-thumb-more">
                        +{(order.items || []).length - 4}
                      </div>
                    )}

                    <div className="order-items-summary-text">
                      <div className="items-title">
                        {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                      </div>
                      <div className="items-names-preview">
                        {(order.items || []).map((i) => i.name).join(', ')}
                      </div>
                    </div>
                  </div>

                  {/* Delivery summary */}
                  {order.shippingAddress && (
                    <div className="order-delivery-snippet">
                      <span className="snippet-label">Deliver to:</span>
                      <span className="snippet-val">
                        {order.shippingAddress.name}, {order.shippingAddress.city}, {order.shippingAddress.state}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Footer with total and link to receipt */}
                <div className="order-card-footer">
                  <div className="order-pricing-summary">
                    <span className="order-total-label">Total Amount:</span>
                    <span className="order-total-val">${Number(order.total || 0).toFixed(2)}</span>
                    <span className="order-payment-method-tag">
                      {order.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : order.paymentMethod}
                    </span>
                  </div>

                  <Link
                    to={`/order-confirmation/${order._id || order.orderNumber}`}
                    className="btn-view-order-details"
                  >
                    View Receipt &amp; Details &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
