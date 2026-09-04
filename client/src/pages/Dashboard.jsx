import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    api
      .get('/products?limit=1')
      .then((res) => {
        if (res.data?.pagination?.total !== undefined) {
          setProductCount(res.data.pagination.total);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <div className="page-header-block">
        <h1 className="page-title">E-Commerce Dashboard</h1>
        <p className="page-subtitle">Welcome back, {user?.name || 'User'}. Manage your orders, browse products, and configure your account.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="content-card" style={{ padding: 20 }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 8 }}>
            Available Products
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
            {productCount}
          </div>
          <Link to="/products" style={{ color: 'var(--accent-color)', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>
            Explore Catalog &rarr;
          </Link>
        </div>

        <div className="content-card" style={{ padding: 20 }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 8 }}>
            Account Role
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'capitalize', marginBottom: 8 }}>
            {user?.role || 'Customer'}
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {isAdmin ? 'Full administrative privileges' : 'Standard shopping permissions'}
          </span>
        </div>

        <div className="content-card" style={{ padding: 20 }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 8 }}>
            Active Orders
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
            0
          </div>
          <Link to="/orders" style={{ color: 'var(--accent-color)', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>
            View Order History &rarr;
          </Link>
        </div>
      </div>

      <div className="content-card" style={{ maxWidth: 640 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 12 }}>Account Overview</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          <p style={{ color: 'var(--text-secondary)' }}>
            Logged in as: <strong style={{ color: 'var(--text-primary)' }}>{user?.name}</strong> ({user?.email})
          </p>
          <p style={{ color: 'var(--text-secondary)' }}>
            User ID: <code style={{ fontSize: '0.85rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>{user?.id || user?._id}</code>
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link
            to="/products"
            className="btn-card-action btn-card-primary"
            style={{ maxWidth: 160 }}
          >
            Browse Products
          </Link>
          <button
            type="button"
            onClick={logout}
            style={{
              padding: '9px 18px',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 500,
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
