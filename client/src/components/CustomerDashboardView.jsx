import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';

export default function CustomerDashboardView({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMetrics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/dashboard/customer');
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const formatDate = (isoDate) => {
    if (!isoDate) return 'N/A';
    try {
      return new Date(isoDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoDate;
    }
  };

  return (
    <div>
      {/* Top Banner */}
      <div className="dashboard-top-banner">
        <div className="dashboard-banner-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h1 className="dashboard-banner-title">Welcome back, {user?.name || 'Customer'}!</h1>
            <span className="role-badge-chip role-badge-customer">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Customer Account
            </span>
          </div>
          <p className="dashboard-banner-subtitle">
            Track your order deliveries, manage shopping cart, and explore catalog deals.
          </p>
        </div>
        <div className="dashboard-quick-actions">
          <Link to="/products" className="btn-quick-action primary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
            </svg>
            <span>Browse Products</span>
          </Link>
          <Link to="/cart" className="btn-quick-action">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span>Go to Cart</span>
          </Link>
          <button type="button" onClick={fetchMetrics} className="btn-quick-action" title="Refresh metrics">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="form-error-banner" style={{ marginBottom: 20 }}>
          {error}
        </div>
      )}

      {/* Metrics Cards Grid (Total orders, Pending orders, Completed orders, Cart items) */}
      <div className="metrics-grid-customer">
        {/* Total Orders */}
        <div className="metric-stat-card">
          <div className="metric-icon-box metric-icon-blue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <div className="metric-stat-info">
            <span className="metric-stat-label">Total Orders</span>
            <span className="metric-stat-number">{loading ? '—' : data?.totalOrders ?? 0}</span>
            <span className="metric-stat-desc">Lifetime purchases</span>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="metric-stat-card">
          <div className="metric-icon-box metric-icon-amber">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="metric-stat-info">
            <span className="metric-stat-label">Pending Orders</span>
            <span className="metric-stat-number">{loading ? '—' : data?.pendingOrders ?? 0}</span>
            <span className="metric-stat-desc">In fulfillment</span>
          </div>
        </div>

        {/* Completed Orders */}
        <div className="metric-stat-card">
          <div className="metric-icon-box metric-icon-emerald">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="metric-stat-info">
            <span className="metric-stat-label">Completed Orders</span>
            <span className="metric-stat-number">{loading ? '—' : data?.completedOrders ?? 0}</span>
            <span className="metric-stat-desc">Delivered safely</span>
          </div>
        </div>

        {/* Cart Items */}
        <div className="metric-stat-card">
          <div className="metric-icon-box metric-icon-purple">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </div>
          <div className="metric-stat-info">
            <span className="metric-stat-label">Cart Items</span>
            <span className="metric-stat-number">{loading ? '—' : data?.cartItems ?? 0}</span>
            <Link to="/cart" style={{ fontSize: '0.78rem', color: '#7c3aed', fontWeight: 600, textDecoration: 'none' }}>
              View Cart &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="dashboard-section-card">
        <div className="section-card-header">
          <div>
            <h2 className="section-card-title">Recent Orders</h2>
            <p className="section-card-subtitle">Your most recent purchases and tracking details</p>
          </div>
          <Link
            to="/orders"
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--accent-color)',
              textDecoration: 'none',
            }}
          >
            All Orders &rarr;
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading your orders...
          </div>
        ) : !data?.recentOrders || data.recentOrders.length === 0 ? (
          <div className="placeholder-empty-state" style={{ border: 'none' }}>
            <div className="empty-state-icon-box">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
              </svg>
            </div>
            <h3 className="empty-state-title">No orders placed yet</h3>
            <p className="empty-state-desc">
              Browse our catalog of electronics, apparel, and lifestyle items to place your first order.
            </p>
            <Link to="/products" className="admin-action-btn" style={{ marginTop: 16, textDecoration: 'none' }}>
              Start Shopping
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="products-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Delivery Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((order) => {
                  const firstItem = order.items?.[0]?.name || 'Catalog Product';
                  const extraItems = (order.itemsCount || order.items?.length || 1) - 1;
                  const itemSummary = extraItems > 0 ? `${firstItem} (+${extraItems} more)` : firstItem;

                  return (
                    <tr key={order._id}>
                      <td style={{ fontWeight: 600, color: 'var(--accent-color)' }}>
                        {order.orderNumber || `ORD-${order._id.slice(-6).toUpperCase()}`}
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {formatDate(order.createdAt)}
                      </td>
                      <td style={{ maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {itemSummary}
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        ${typeof order.total === 'number' ? order.total.toFixed(2) : order.total}
                      </td>
                      <td>
                        <span className="payment-pill">
                          <span className={`payment-dot ${order.paymentStatus || 'pending'}`} />
                          <span style={{ textTransform: 'capitalize' }}>{order.paymentStatus || 'Pending'}</span>
                        </span>
                      </td>
                      <td>
                        <span className={`status-pill ${order.status || 'pending'}`}>
                          {order.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Account Info & Support Card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        <div className="content-card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" color="var(--accent-color)">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Customer Profile
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 6 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Name:</span>
              <span style={{ fontWeight: 600 }}>{user?.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 6 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Email:</span>
              <span style={{ fontWeight: 600 }}>{user?.email}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Access Level:</span>
              <span style={{ fontWeight: 600, color: '#059669', textTransform: 'capitalize' }}>
                {user?.role || 'Customer'}
              </span>
            </div>
          </div>
        </div>

        <div className="content-card" style={{ backgroundColor: '#f8fafc' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" color="#059669">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Buyer Protection Guarantee
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>
            Every purchase includes verified secure checkout, tracked parcel delivery, and our 30-day money-back satisfaction guarantee.
          </p>
          <Link
            to="/products"
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--accent-color)',
              textDecoration: 'none',
            }}
          >
            Explore featured catalog deals &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
