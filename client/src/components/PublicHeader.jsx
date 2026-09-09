import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function PublicHeader() {
  const { user } = useAuth();
  const { cartCount } = useCart();
  const isAdmin = user?.role === 'admin';
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="landing-navbar-sticky">
      <div className="landing-navbar-container">
        {/* Logo & Brand */}
        <Link to="/" className="landing-brand-group">
          <div className="brand-icon-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <div className="brand-text-col">
            <span className="brand-title-text">E-Commerce Platform</span>
            <span className="brand-sub-badge">Premium Marketplace</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="landing-nav-center" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <NavLink to="/" end className={({ isActive }) => `landing-nav-link ${isActive ? 'active' : ''}`}>
            Home
          </NavLink>
          <NavLink to="/products" className={({ isActive }) => `landing-nav-link ${isActive ? 'active' : ''}`}>
            Catalog
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => `landing-nav-link ${isActive ? 'active' : ''}`}>
            About
          </NavLink>
          <NavLink to="/terms" className={({ isActive }) => `landing-nav-link ${isActive ? 'active' : ''}`}>
            Terms
          </NavLink>
          <NavLink to="/returns" className={({ isActive }) => `landing-nav-link ${isActive ? 'active' : ''}`}>
            Returns
          </NavLink>
        </nav>

        {/* Right Actions */}
        <div className="landing-nav-right">
          {!isAdmin && (
            <Link to="/cart" className="landing-nav-cart-btn" title="View Shopping Cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <span className="nav-cart-label">Cart</span>
              {cartCount > 0 && <span className="nav-cart-badge">{cartCount}</span>}
            </Link>
          )}

          {user ? (
            <Link to="/dashboard" className="landing-nav-btn-account">
              {isAdmin ? 'Admin Dashboard' : 'My Dashboard'}
            </Link>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Link to="/login" className="landing-nav-btn-login">
                Sign In
              </Link>
              <Link to="/register" className="landing-nav-btn-register">
                Register
              </Link>
            </div>
          )}

          {/* Mobile toggle */}
          <button
            type="button"
            className="landing-mobile-menu-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div style={{ background: '#fff', borderBottom: '1px solid var(--border-color)', padding: '16px 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Link to="/" onClick={() => setMobileOpen(false)} style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 500 }}>
              Home
            </Link>
            <Link to="/products" onClick={() => setMobileOpen(false)} style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 500 }}>
              Catalog
            </Link>
            <Link to="/about" onClick={() => setMobileOpen(false)} style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 500 }}>
              About Us
            </Link>
            <Link to="/terms" onClick={() => setMobileOpen(false)} style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 500 }}>
              Terms of Service
            </Link>
            <Link to="/returns" onClick={() => setMobileOpen(false)} style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 500 }}>
              Returns &amp; Refunds
            </Link>
            {!isAdmin && (
              <Link to="/cart" onClick={() => setMobileOpen(false)} style={{ color: 'var(--accent-color)', textDecoration: 'none', fontWeight: 600 }}>
                Shopping Cart ({cartCount})
              </Link>
            )}
            {user ? (
              <Link to="/dashboard" onClick={() => setMobileOpen(false)} style={{ color: 'var(--accent-color)', textDecoration: 'none', fontWeight: 600 }}>
                {isAdmin ? 'Admin Dashboard' : 'My Dashboard'}
              </Link>
            ) : (
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="landing-nav-btn-login" style={{ flex: 1, textAlign: 'center' }}>
                  Sign In
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="landing-nav-btn-register" style={{ flex: 1, textAlign: 'center' }}>
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
