import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function PublicFooter() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const isAdmin = user?.role === 'admin';

  return (
    <footer className="landing-footer">
      <div className="landing-footer-container">
        {/* Col 1: Brand */}
        <div className="footer-col footer-col-brand">
          <div className="footer-brand-header">
            <div className="brand-icon-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              </svg>
            </div>
            <span className="footer-brand-title">E-Commerce Platform</span>
          </div>
          <p className="footer-brand-desc">
            Modern full-stack commerce storefront designed for seamless shopping, real-time inventory tracking, and swift order fulfillment.
          </p>
          <div className="footer-security-badges">
            <span className="security-badge-item">🔒 SSL Encrypted</span>
            <span className="security-badge-item">🛡️ Verified Store</span>
          </div>
        </div>

        {/* Col 2: Navigation / Catalog */}
        <div className="footer-col">
          <h4 className="footer-heading">Store Catalog</h4>
          <ul className="footer-links-list">
            <li>
              <Link to="/products">All Products</Link>
            </li>
            <li>
              <Link to="/products?category=electronics">Electronics</Link>
            </li>
            <li>
              <Link to="/products?category=apparel-fashion">Apparel &amp; Fashion</Link>
            </li>
            <li>
              <Link to="/products?category=home-living">Home &amp; Living</Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Customer Portal */}
        <div className="footer-col">
          <h4 className="footer-heading">Account &amp; Orders</h4>
          <ul className="footer-links-list">
            {user ? (
              <>
                <li>
                  <Link to="/dashboard">{isAdmin ? 'Admin Dashboard' : 'My Dashboard'}</Link>
                </li>
                <li>
                  <Link to="/orders">{isAdmin ? 'Store Orders' : 'Order History'}</Link>
                </li>
                {!isAdmin && (
                  <li>
                    <Link to="/cart">Cart ({cartCount})</Link>
                  </li>
                )}
                <li>
                  <button type="button" onClick={logout} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'inherit', font: 'inherit' }}>
                    Sign Out
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login">Sign In</Link>
                </li>
                <li>
                  <Link to="/register">Create Account</Link>
                </li>
                <li>
                  <Link to="/login">Order Tracking</Link>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Col 4: Public Policies & About Pages */}
        <div className="footer-col">
          <h4 className="footer-heading">Company &amp; Policies</h4>
          <ul className="footer-links-list">
            <li>
              <Link to="/about">About Us</Link>
            </li>
            <li>
              <Link to="/terms">Terms of Service</Link>
            </li>
            <li>
              <Link to="/returns">Return &amp; Refund Policy</Link>
            </li>
            <li>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Fast 2-3 Day Shipping</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom copyright line */}
      <div className="footer-bottom-bar">
        <div className="footer-bottom-container">
          <span>&copy; {new Date().getFullYear()} E-Commerce Platform. All rights reserved.</span>
          <span className="footer-built-with">
            Built with React, Express, MongoDB &amp; Node.js
          </span>
        </div>
      </div>
    </footer>
  );
}
