import React, { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function PublicHeader() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();

  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = user?.role === 'admin';

  const userInitial = user?.name
    ? user.name.charAt(0).toUpperCase()
    : 'U';

  /*
   * Home button
   */
  const handleHomeClick = () => {
    setMobileMenuOpen(false);

    if (location.pathname === '/') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } else {
      navigate('/');
    }
  };

  /*
   * Products button
   */
  const handleProductsClick = () => {
    setMobileMenuOpen(false);

    if (location.pathname === '/') {
      const productsSection = document.getElementById('products');

      if (productsSection) {
        productsSection.scrollIntoView({
          behavior: 'smooth',
        });
      }
    } else {
      navigate('/#products');
    }
  };

  /*
   * Close mobile menu after navigation
   */
  const handleMobileNavigation = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="landing-navbar-sticky">
      <div className="landing-navbar-container">

        {/* =========================================
            Logo & Brand
            ========================================= */}
        <Link
          to="/"
          className="landing-nav-brand"
          onClick={handleHomeClick}
        >
          <div className="landing-brand-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>

          <div className="landing-brand-text">
            <span className="landing-brand-title">
              E-Commerce Platform
            </span>

            <span className="landing-brand-sub">
              Premium Marketplace
            </span>
          </div>
        </Link>

        {/* =========================================
            Desktop Navigation Links
            ========================================= */}
        <nav className="landing-nav-links">

          <button
            type="button"
            className={`nav-anchor-btn ${
              location.pathname === '/' ? 'active' : ''
            }`}
            onClick={handleHomeClick}
          >
            Home
          </button>

          <button
            type="button"
            className="nav-anchor-btn"
            onClick={handleProductsClick}
          >
            Products
          </button>

          <NavLink
            to="/about"
            className={({ isActive }) => `nav-anchor-btn ${isActive ? 'active' : ''}`}
            style={{ textDecoration: 'none' }}
          >
            About
          </NavLink>

          <NavLink
            to="/terms"
            className={({ isActive }) => `nav-anchor-btn ${isActive ? 'active' : ''}`}
            style={{ textDecoration: 'none' }}
          >
            Terms
          </NavLink>

          <NavLink
            to="/returns"
            className={({ isActive }) => `nav-anchor-btn ${isActive ? 'active' : ''}`}
            style={{ textDecoration: 'none' }}
          >
            Returns
          </NavLink>

        </nav>

        {/* =========================================
            Desktop Right Actions
            ========================================= */}
        <div className="landing-nav-actions">

          {/* Shopping Cart - Hidden for Admin */}
          {!isAdmin && (
            <Link
              to="/cart"
              className="landing-nav-cart-btn"
              title="View Shopping Cart"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />

                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>

              <span className="nav-cart-label">
                Cart
              </span>

              {cartCount > 0 && (
                <span className="nav-cart-badge">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {/* Admin Inventory */}
          {isAdmin && (
            <Link
              to="/products"
              className="btn-card-action"
              style={{
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
              </svg>

              Manage Inventory
            </Link>
          )}

          {/* =========================================
              Logged-in User
              ========================================= */}
          {user ? (
            <div className="landing-user-controls">

              {/* User Badge */}
              <div className="landing-user-badge">

                <div
                  className="landing-avatar-circle"
                  style={{
                    backgroundColor: isAdmin
                      ? '#7c3aed'
                      : '#2563eb',
                  }}
                  title={user.email}
                >
                  {userInitial}
                </div>

                <div className="landing-user-meta">
                  <span className="landing-user-name">
                    {user.name || 'User'}
                  </span>

                  <span className="landing-user-role-tag">
                    {isAdmin
                      ? '🛡️ Admin'
                      : '👤 Customer'}
                  </span>
                </div>

              </div>

              {/* Dashboard */}
              <Link
                to="/dashboard"
                className="btn-nav-dashboard"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                </svg>

                <span>
                  Dashboard
                </span>
              </Link>

              {/* Logout */}
              <button
                type="button"
                onClick={logout}
                className="btn-nav-logout"
                title="Sign out of your account"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>

            </div>
          ) : (

            /* =========================================
               Unauthenticated User
               ========================================= */
            <div className="landing-auth-buttons">

              <Link
                to="/login"
                className="btn-nav-login"
              >
                Sign In
              </Link>

              <Link
                to="/register"
                className="btn-nav-register"
              >
                <span>
                  Register
                </span>

                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M5 12h14" />
                  <path d="M12 5l7 7-7 7" />
                </svg>
              </Link>

            </div>
          )}

          {/* =========================================
              Mobile Hamburger
              ========================================= */}
          <button
            type="button"
            className="landing-mobile-toggle"
            onClick={() =>
              setMobileMenuOpen(!mobileMenuOpen)
            }
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>

        </div>
      </div>

      {/* =========================================
          Mobile Navigation Dropdown
          ========================================= */}
      {mobileMenuOpen && (
        <div className="landing-mobile-menu">

          <div className="mobile-links-group">

            <button
              type="button"
              className="mobile-nav-link"
              onClick={handleHomeClick}
            >
              Home
            </button>

            <button
              type="button"
              className="mobile-nav-link"
              onClick={handleProductsClick}
            >
              Products
            </button>

            <Link
              to="/about"
              className="mobile-nav-link"
              onClick={handleMobileNavigation}
            >
              About
            </Link>

            <Link
              to="/terms"
              className="mobile-nav-link"
              onClick={handleMobileNavigation}
            >
              Terms
            </Link>

            <Link
              to="/returns"
              className="mobile-nav-link"
              onClick={handleMobileNavigation}
            >
              Returns
            </Link>

          </div>

          {/* =========================================
              Mobile Authentication
              ========================================= */}
          <div className="mobile-auth-section">

            {user ? (

              <div className="mobile-user-details">

                <div className="mobile-user-row">

                  <div
                    className="landing-avatar-circle"
                    style={{
                      backgroundColor: isAdmin
                        ? '#7c3aed'
                        : '#2563eb',
                    }}
                  >
                    {userInitial}
                  </div>

                  <div>
                    <div style={{ fontWeight: 700 }}>
                      {user.name}
                    </div>

                    <div
                      style={{
                        fontSize: '0.8rem',
                        color: '#64748b',
                      }}
                    >
                      {isAdmin
                        ? 'Store Admin'
                        : 'Customer'}
                    </div>
                  </div>

                </div>

                {/* Cart for Customer */}
                {!isAdmin && (
                  <Link
                    to="/cart"
                    className="mobile-action-btn"
                    onClick={handleMobileNavigation}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="9" cy="21" r="1" />
                      <circle cx="20" cy="21" r="1" />

                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>

                    <span>
                      View Shopping Cart ({cartCount})
                    </span>
                  </Link>
                )}

                {/* Dashboard */}
                <Link
                  to="/dashboard"
                  className="mobile-action-btn primary"
                  onClick={handleMobileNavigation}
                >
                  <span>
                    Go to Dashboard
                  </span>
                </Link>

                {/* Logout */}
                <button
                  type="button"
                  className="mobile-action-btn"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                >
                  <span>
                    Sign Out
                  </span>
                </button>

              </div>

            ) : (

              /* =========================================
                 Mobile Guest Actions
                 ========================================= */
              <div className="mobile-auth-grid">

                <Link
                  to="/cart"
                  className="mobile-action-btn"
                  onClick={handleMobileNavigation}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />

                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>

                  <span>
                    View Shopping Cart ({cartCount})
                  </span>
                </Link>

                <Link
                  to="/login"
                  className="mobile-action-btn"
                  onClick={handleMobileNavigation}
                >
                  Sign In
                </Link>

                <Link
                  to="/register"
                  className="mobile-action-btn primary"
                  onClick={handleMobileNavigation}
                >
                  Create Free Account
                </Link>

              </div>
            )}

          </div>
        </div>
      )}
    </header>
  );
}