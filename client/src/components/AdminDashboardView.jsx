import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';

export default function AdminDashboardView({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMetrics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/dashboard/admin');
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Access Denied: Admin authorization is required to view administrative metrics.');
      } else {
        setError(err.response?.data?.message || 'Unable to load administrative metrics');
      }
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
        hour: '2-digit',
        minute: '2-digit',
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
            <h1 className="dashboard-banner-title">Store Administration</h1>
            <span className="role-badge-chip role-badge-admin">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Administrator Role
            </span>
          </div>
          <p className="dashboard-banner-subtitle">
            Welcome, {user?.name || 'Admin'} ({user?.email}). Real-time store performance, inventory, and orders overview.
          </p>
        </div>
        <div className="dashboard-quick-actions">
          <Link to="/products" className="btn-quick-action primary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            <span>Manage Products</span>
          </Link>
          <Link to="/orders" className="btn-quick-action">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span>View All Orders</span>
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

      {/* Admin Metrics Grid (6 items: Total products, Total categories, Total orders, Today's orders, Total customers, Today's revenue) */}
      <div className="metrics-grid-admin">
        {/* Total Products */}
        <div className="metric-stat-card">
          <div className="metric-icon-box metric-icon-blue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <div className="metric-stat-info">
            <span className="metric-stat-label">Total Products</span>
            <span className="metric-stat-number">{loading ? '—' : data?.totalProducts ?? 0}</span>
            <Link to="/products" style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
              Manage Catalog &rarr;
            </Link>
          </div>
        </div>

        {/* Total Categories */}
        <div className="metric-stat-card">
          <div className="metric-icon-box metric-icon-indigo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </div>
          <div className="metric-stat-info">
            <span className="metric-stat-label">Total Categories</span>
            <span className="metric-stat-number">{loading ? '—' : data?.totalCategories ?? 0}</span>
            <span className="metric-stat-desc">Active taxonomies</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="metric-stat-card">
          <div className="metric-icon-box metric-icon-purple">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <div className="metric-stat-info">
            <span className="metric-stat-label">Total Orders</span>
            <span className="metric-stat-number">{loading ? '—' : data?.totalOrders ?? 0}</span>
            <span className="metric-stat-desc">Storewide all-time</span>
          </div>
        </div>

        {/* Today's Orders */}
        <div className="metric-stat-card">
          <div className="metric-icon-box metric-icon-amber">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div className="metric-stat-info">
            <span className="metric-stat-label">Today&apos;s Orders</span>
            <span className="metric-stat-number">{loading ? '—' : data?.todayOrders ?? 0}</span>
            <span className="metric-stat-desc">Placed since 00:00 UTC</span>
          </div>
        </div>

        {/* Total Customers */}
        <div className="metric-stat-card">
          <div className="metric-icon-box metric-icon-emerald">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="metric-stat-info">
            <span className="metric-stat-label">Total Customers</span>
            <span className="metric-stat-number">{loading ? '—' : data?.totalCustomers ?? 0}</span>
            <span className="metric-stat-desc">Verified customer accounts</span>
          </div>
        </div>

        {/* Today's Revenue */}
        <div className="metric-stat-card">
          <div className="metric-icon-box metric-icon-rose">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="metric-stat-info">
            <span className="metric-stat-label">Today&apos;s Revenue</span>
            <span className="metric-stat-number">
              ${loading ? '—' : (data?.todayRevenue ?? 0).toFixed(2)}
            </span>
            <span className="metric-stat-desc">
              All-time: ${(data?.totalRevenue ?? 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Storewide Recent Orders Section */}
      <div className="dashboard-section-card">
        <div className="section-card-header">
          <div>
            <h2 className="section-card-title">Recent Store Orders</h2>
            <p className="section-card-subtitle">Real-time order stream from customer checkouts</p>
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
            Manage All Orders &rarr;
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading storewide orders...
          </div>
        ) : !data?.recentOrders || data.recentOrders.length === 0 ? (
          <div className="placeholder-empty-state" style={{ border: 'none' }}>
            <div className="empty-state-icon-box">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <h3 className="empty-state-title">No store orders recorded yet</h3>
            <p className="empty-state-desc">Customer checkout orders will automatically stream here.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="products-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Date & Time</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Fulfillment Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((order) => {
                  const firstItem = order.items?.[0]?.name || 'Catalog Item';
                  const extraItems = (order.itemsCount || order.items?.length || 1) - 1;
                  const itemSummary = extraItems > 0 ? `${firstItem} (+${extraItems} more)` : firstItem;

                  return (
                    <tr key={order._id}>
                      <td style={{ fontWeight: 600, color: 'var(--accent-color)' }}>
                        {order.orderNumber || `ORD-${order._id.slice(-6).toUpperCase()}`}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{order.customerName}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{order.customerEmail}</div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {formatDate(order.createdAt)}
                      </td>
                      <td style={{ maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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

      {/* Role-Based Access Controls Notice */}
      <div className="content-card" style={{ backgroundColor: '#f5f3ff', border: '1px solid #ddd6fe' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: '#7c3aed', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#5b21b6', marginBottom: 4 }}>
              Administrative Privileges Active
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#6d28d9', lineHeight: 1.5 }}>
              You are signed in as a system administrator. You have full authorization to create, edit, and delete products, manage product categories, review storewide transactions, and view sales performance metrics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
