import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import api from '../services/api.js';
import ProductCard from '../components/ProductCard.jsx';
import ProductQuickViewModal from '../components/ProductQuickViewModal.jsx';

export default function LandingPage() {
  const { user, logout } = useAuth();
  const { cartCount, toast } = useCart();
  const navigate = useNavigate();

  // Catalog State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [catalogError, setCatalogError] = useState('');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('-createdAt');
  const [activeQuickViewProduct, setActiveQuickViewProduct] = useState(null);

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Section reference for smooth scroll
  const productsSectionRef = useRef(null);

  const isAdmin = user?.role === 'admin';
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  // Fetch Categories
  useEffect(() => {
    let isMounted = true;
    api
      .get('/categories')
      .then((res) => {
        if (isMounted && res.data?.success) {
          setCategories(res.data.data || []);
        }
      })
      .catch((err) => {
        console.error('Failed to load categories:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingCategories(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch Products based on search, category, sort
  const fetchProducts = async () => {
    setLoadingProducts(true);
    setCatalogError('');

    try {
      const params = {};
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      if (selectedCategory && selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      if (selectedSort) {
        params.sort = selectedSort;
      }

      const res = await api.get('/products', { params });
      if (res.data?.success) {
        setProducts(res.data.data || []);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setCatalogError('Unable to load products. Please check connection and retry.');
    } finally {
      setLoadingProducts(false);
    }
  };

  // Debounced search query & filter trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedSort]);

  const scrollToProducts = () => {
    if (productsSectionRef.current) {
      productsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const handleSelectCategoryPill = (catSlugOrId) => {
    setSelectedCategory(catSlugOrId);
    scrollToProducts();
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedSort('-createdAt');
  };

  const featuredHeroProduct = products.length > 0 ? products[0] : null;

  return (
    <div className="landing-page-root">
      {/* Toast Notification Notification banner */}
      {toast && (
        <div className={`global-toast-notification ${toast.type || 'success'}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{toast.message}</span>
          {user && (
            <Link to="/cart" className="toast-action-link">
              View Cart &rarr;
            </Link>
          )}
        </div>
      )}

      {/* =========================================
          Sticky Public Navigation Bar (Navbar)
          ========================================= */}
      <header className="landing-navbar-sticky">
        <div className="landing-navbar-container">
          {/* Logo & Brand */}
          <Link to="/" className="landing-nav-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="landing-brand-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
            <div className="landing-brand-text">
              <span className="landing-brand-title">E-Commerce Platform</span>
              <span className="landing-brand-sub">Premium Storefront</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="landing-nav-links">
            <button
              type="button"
              className="nav-anchor-btn active"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Home
            </button>
            <button type="button" className="nav-anchor-btn" onClick={scrollToProducts}>
              Products
            </button>
            <a href="#categories" className="nav-anchor-btn" onClick={() => setMobileMenuOpen(false)}>
              Categories
            </a>
            <a href="#benefits" className="nav-anchor-btn" onClick={() => setMobileMenuOpen(false)}>
              Why Us
            </a>
          </nav>

          {/* Desktop Right Actions (Auth / Account & Cart) */}
          <div className="landing-nav-actions">
            {user ? (
              // Logged-in State: Show Cart & User Account info
              <div className="landing-user-controls">
                {/* Cart Button */}
                <Link to="/cart" className="landing-nav-cart-btn" title="View Shopping Cart">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  <span className="nav-cart-label">Cart</span>
                  {cartCount > 0 && <span className="nav-cart-badge">{cartCount}</span>}
                </Link>

                {/* User / Account Badge */}
                <div className="landing-user-badge">
                  <div
                    className="landing-avatar-circle"
                    style={{ backgroundColor: isAdmin ? '#7c3aed' : '#2563eb' }}
                    title={user.email}
                  >
                    {userInitial}
                  </div>
                  <div className="landing-user-meta">
                    <span className="landing-user-name">{user.name || 'User'}</span>
                    <span className="landing-user-role-tag">
                      {isAdmin ? '🛡️ Admin' : '👤 Customer'}
                    </span>
                  </div>
                </div>

                {/* Direct Dashboard Link */}
                <Link to="/dashboard" className="btn-nav-dashboard">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="14" width="7" height="7" rx="1.5" />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" />
                  </svg>
                  <span>Dashboard</span>
                </Link>

                {/* Quick Logout */}
                <button
                  type="button"
                  onClick={logout}
                  className="btn-nav-logout"
                  title="Sign out of your account"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              </div>
            ) : (
              // Unauthenticated State: Show Login & Register buttons
              <div className="landing-auth-buttons">
                <Link to="/login" className="btn-nav-login">
                  Sign In
                </Link>
                <Link to="/register" className="btn-nav-register">
                  <span>Register</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14" />
                    <path d="M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              className="landing-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
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

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="landing-mobile-menu">
            <div className="mobile-links-group">
              <button
                type="button"
                className="mobile-nav-link"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setMobileMenuOpen(false);
                }}
              >
                Home
              </button>
              <button
                type="button"
                className="mobile-nav-link"
                onClick={scrollToProducts}
              >
                Products
              </button>
              <a
                href="#categories"
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Categories
              </a>
              <a
                href="#benefits"
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Why Choose Us
              </a>
            </div>

            <div className="mobile-auth-section">
              {user ? (
                <div className="mobile-user-details">
                  <div className="mobile-user-row">
                    <div
                      className="landing-avatar-circle"
                      style={{ backgroundColor: isAdmin ? '#7c3aed' : '#2563eb' }}
                    >
                      {userInitial}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{user.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {isAdmin ? 'Store Admin' : 'Customer'}
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/cart"
                    className="mobile-action-btn"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="9" cy="21" r="1" />
                      <circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                    <span>View Shopping Cart ({cartCount})</span>
                  </Link>

                  <Link
                    to="/dashboard"
                    className="mobile-action-btn primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>Go to Dashboard</span>
                  </Link>

                  <button
                    type="button"
                    className="mobile-action-btn"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="mobile-auth-grid">
                  <Link
                    to="/login"
                    className="mobile-action-btn"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="mobile-action-btn primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Create Free Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* =========================================
          Hero Section with E-Commerce CTA
          ========================================= */}
      <section className="landing-hero-section">
        <div className="landing-hero-container">
          <div className="landing-hero-text-col">
            {/* Announcement Pill */}
            <div className="hero-announcement-pill">
              <span className="hero-pill-sparkle">✨</span>
              <span>Spring 2026 Collection • Free Express Delivery over $50</span>
            </div>

            <h1 className="hero-headline">
              Curated Essentials for <span className="hero-headline-accent">Everyday Excellence</span>
            </h1>

            <p className="hero-subheadline">
              Discover high-fidelity audio gear, ergonomic workplace solutions, and premium apparel crafted for enduring comfort, modern performance, and aesthetic precision.
            </p>

            {/* CTAs */}
            <div className="hero-cta-group">
              <button
                type="button"
                className="btn-hero-primary"
                onClick={scrollToProducts}
              >
                <span>Explore Catalog</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14" />
                  <path d="M12 5l7 7-7 7" />
                </svg>
              </button>

              {user ? (
                <Link to="/dashboard" className="btn-hero-secondary">
                  <span>Go to Dashboard</span>
                </Link>
              ) : (
                <Link to="/register" className="btn-hero-secondary">
                  <span>Create Customer Account</span>
                </Link>
              )}
            </div>

            {/* Social Proof & Trust Metric Bar */}
            <div className="hero-trust-metrics">
              <div className="trust-metric-item">
                <div className="trust-metric-value">4.9 / 5.0</div>
                <div className="trust-metric-label">★★★★★ 12k+ Reviews</div>
              </div>
              <div className="trust-divider" />
              <div className="trust-metric-item">
                <div className="trust-metric-value">100%</div>
                <div className="trust-metric-label">Verified Authentic</div>
              </div>
              <div className="trust-divider" />
              <div className="trust-metric-item">
                <div className="trust-metric-value">2-3 Days</div>
                <div className="trust-metric-label">Fast Tracked Delivery</div>
              </div>
            </div>
          </div>

          {/* Hero Visual Spotlight Card */}
          <div className="landing-hero-visual-col">
            {featuredHeroProduct ? (
              <div
                className="hero-spotlight-card"
                onClick={() => setActiveQuickViewProduct(featuredHeroProduct)}
              >
                <div className="spotlight-tag">⭐ Featured Pick</div>
                <div className="spotlight-image-box">
                  <img
                    src={
                      Array.isArray(featuredHeroProduct.images) && featuredHeroProduct.images[0]
                        ? featuredHeroProduct.images[0]
                        : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'
                    }
                    alt={featuredHeroProduct.name}
                    className="spotlight-img"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';
                    }}
                  />
                </div>
                <div className="spotlight-content">
                  <div className="spotlight-category">
                    {featuredHeroProduct.category?.name || 'Electronics'}
                  </div>
                  <h2 className="spotlight-title">{featuredHeroProduct.name}</h2>
                  <p className="spotlight-desc">
                    {featuredHeroProduct.description || 'Engineered for exceptional acoustic clarity and tactile feel.'}
                  </p>
                  <div className="spotlight-price-row">
                    <div>
                      <span className="spotlight-price-label">Regular Price</span>
                      <div className="spotlight-price-num">
                        ${Number(featuredHeroProduct.price).toFixed(2)}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="spotlight-view-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveQuickViewProduct(featuredHeroProduct);
                      }}
                    >
                      Quick View &rarr;
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hero-spotlight-card fallback">
                <div className="spotlight-tag">⭐ Premium Catalog</div>
                <div className="spotlight-image-box">
                  <img
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"
                    alt="Premium Gear"
                    className="spotlight-img"
                  />
                </div>
                <div className="spotlight-content">
                  <div className="spotlight-category">Electronics</div>
                  <h2 className="spotlight-title">Wireless Studio Headphones</h2>
                  <div className="spotlight-price-row">
                    <div className="spotlight-price-num">$199.99</div>
                    <button type="button" className="spotlight-view-btn" onClick={scrollToProducts}>
                      Shop Now &rarr;
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================================
          Value Propositions & Benefits Strip
          ========================================= */}
      <section id="benefits" className="landing-benefits-section">
        <div className="landing-benefits-container">
          <div className="benefit-card">
            <div className="benefit-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>
            <h3 className="benefit-title">Fast & Free Shipping</h3>
            <p className="benefit-desc">Free nationwide express delivery on all orders exceeding $50 with live carrier tracking.</p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            </div>
            <h3 className="benefit-title">100% Authentic Quality</h3>
            <p className="benefit-desc">Hand-inspected merchandise backed by direct manufacturer warranties and certifications.</p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
            </div>
            <h3 className="benefit-title">30-Day Hassle-Free Returns</h3>
            <p className="benefit-desc">Changed your mind? Return any unused item within 30 days for an instant, no-questions refund.</p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h3 className="benefit-title">Bank-Grade Security</h3>
            <p className="benefit-desc">256-bit encrypted authentication safeguards your personal data and payments at every step.</p>
          </div>
        </div>
      </section>

      {/* =========================================
          Featured Categories Bar
          ========================================= */}
      <section id="categories" className="landing-categories-section">
        <div className="landing-categories-container">
          <div className="categories-header-row">
            <div>
              <span className="section-eyebrow">Explore Collections</span>
              <h2 className="section-main-title">Shop by Category</h2>
            </div>
            <button
              type="button"
              className="categories-view-all-link"
              onClick={() => handleSelectCategoryPill('all')}
            >
              View Full Catalog &rarr;
            </button>
          </div>

          <div className="categories-chips-grid">
            <button
              type="button"
              className={`category-pill-btn ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => handleSelectCategoryPill('all')}
            >
              <span className="pill-icon">✨</span>
              <span>All Categories</span>
            </button>

            {categories.map((cat) => (
              <button
                key={cat._id || cat.slug}
                type="button"
                className={`category-pill-btn ${
                  selectedCategory === cat.slug || selectedCategory === cat._id ? 'active' : ''
                }`}
                onClick={() => handleSelectCategoryPill(cat.slug || cat._id)}
              >
                <span className="pill-icon">🏷️</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================
          Real Products Catalog Section
          ========================================= */}
      <section id="products" ref={productsSectionRef} className="landing-products-section">
        <div className="landing-products-container">
          {/* Section Header */}
          <div className="products-section-header">
            <div>
              <span className="section-eyebrow">Inventory Connected</span>
              <h2 className="section-main-title">Featured Products</h2>
              <p className="section-subtitle">
                Explore authentic merchandise with live pricing and verified stock status.
              </p>
            </div>

            {/* Total items badge */}
            <div className="products-counter-badge">
              {loadingProducts ? 'Refreshing...' : `${products.length} Products Available`}
            </div>
          </div>

          {/* Search, Category Filter & Sorting Toolbar */}
          <div className="products-filter-toolbar">
            {/* Search Input Box */}
            <div className="filter-search-box">
              <svg className="search-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="filter-search-input"
                placeholder="Search products by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search query"
                >
                  &times;
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="filter-select-group">
              <label htmlFor="cat-filter-select" className="filter-label">
                Category:
              </label>
              <select
                id="cat-filter-select"
                className="filter-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id || c.slug} value={c.slug || c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="filter-select-group">
              <label htmlFor="sort-filter-select" className="filter-label">
                Sort by:
              </label>
              <select
                id="sort-filter-select"
                className="filter-select"
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
              >
                <option value="-createdAt">Newest Arrivals</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="name">Product Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Active Filter Chips Indicator */}
          {(searchQuery || selectedCategory !== 'all') && (
            <div className="active-filters-row">
              <span className="active-filter-label">Active filters:</span>
              {searchQuery && (
                <span className="active-filter-chip">
                  Search: &ldquo;{searchQuery}&rdquo;
                  <button type="button" onClick={() => setSearchQuery('')}>
                    &times;
                  </button>
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="active-filter-chip">
                  Category:{' '}
                  {categories.find((c) => c.slug === selectedCategory || c._id === selectedCategory)?.name ||
                    selectedCategory}
                  <button type="button" onClick={() => setSelectedCategory('all')}>
                    &times;
                  </button>
                </span>
              )}
              <button type="button" className="btn-reset-filters" onClick={clearAllFilters}>
                Reset all filters
              </button>
            </div>
          )}

          {/* Catalog Error Banner */}
          {catalogError && (
            <div className="catalog-error-banner">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{catalogError}</span>
              <button type="button" onClick={fetchProducts} className="catalog-retry-btn">
                Retry
              </button>
            </div>
          )}

          {/* Products Grid */}
          {loadingProducts ? (
            <div className="products-grid-container">
              {[1, 2, 3, 4, 5, 6].map((sk) => (
                <div key={sk} className="product-skeleton-card">
                  <div className="skeleton-image-box" />
                  <div className="skeleton-content-box">
                    <div className="skeleton-line short" />
                    <div className="skeleton-line medium" />
                    <div className="skeleton-line long" />
                    <div className="skeleton-button" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="products-grid-container">
              {products.map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                  onQuickView={(p) => setActiveQuickViewProduct(p)}
                />
              ))}
            </div>
          ) : (
            <div className="products-empty-state">
              <div className="empty-state-icon-box">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
              </div>
              <h3 className="empty-state-title">No products match your criteria</h3>
              <p className="empty-state-desc">
                We couldn&apos;t find any active items matching your search or category filter. Try clearing your filters to see all available products.
              </p>
              <button type="button" className="btn-empty-reset" onClick={clearAllFilters}>
                Clear Filters & Show All Products
              </button>
            </div>
          )}
        </div>
      </section>

      {/* =========================================
          Promotional Membership Callout
          ========================================= */}
      <section className="landing-promo-banner">
        <div className="landing-promo-container">
          <div className="promo-text-col">
            <span className="promo-badge">Limited Time Member Offer</span>
            <h2 className="promo-headline">Unlock 15% Off Your First Purchase</h2>
            <p className="promo-desc">
              Create a free customer account today to access member-only deals, instant order tracking, and expedited checkout.
            </p>
          </div>
          <div className="promo-cta-col">
            {user ? (
              <Link to="/cart" className="btn-promo-cta">
                View Shopping Cart ({cartCount})
              </Link>
            ) : (
              <Link to="/register" className="btn-promo-cta">
                Register Free Account &rarr;
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* =========================================
          Footer Section
          ========================================= */}
      <footer className="landing-footer">
        <div className="landing-footer-container">
          {/* Col 1: Brand Info */}
          <div className="footer-col brand-col">
            <div className="footer-brand-header">
              <div className="landing-brand-icon" style={{ width: 32, height: 32 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
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

          {/* Col 2: Navigation */}
          <div className="footer-col">
            <h4 className="footer-heading">Store Catalog</h4>
            <ul className="footer-links-list">
              <li>
                <button type="button" onClick={() => handleSelectCategoryPill('all')}>
                  All Products
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleSelectCategoryPill('electronics')}>
                  Electronics
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleSelectCategoryPill('apparel-fashion')}>
                  Apparel & Fashion
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleSelectCategoryPill('home-living')}>
                  Home & Living
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Portal */}
          <div className="footer-col">
            <h4 className="footer-heading">Account & Orders</h4>
            <ul className="footer-links-list">
              {user ? (
                <>
                  <li>
                    <Link to="/dashboard">My Dashboard</Link>
                  </li>
                  <li>
                    <Link to="/orders">Order History</Link>
                  </li>
                  <li>
                    <Link to="/cart">Cart ({cartCount})</Link>
                  </li>
                  <li>
                    <button type="button" onClick={logout}>
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

          {/* Col 4: Trust & Policies */}
          <div className="footer-col">
            <h4 className="footer-heading">Customer Care</h4>
            <ul className="footer-links-list">
              <li>
                <a href="#benefits">Fast 2-3 Day Shipping</a>
              </li>
              <li>
                <a href="#benefits">30-Day Easy Returns</a>
              </li>
              <li>
                <a href="#benefits">Privacy Policy</a>
              </li>
              <li>
                <a href="#benefits">Terms of Service</a>
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

      {/* Quick View Modal */}
      {activeQuickViewProduct && (
        <ProductQuickViewModal
          product={activeQuickViewProduct}
          onClose={() => setActiveQuickViewProduct(null)}
        />
      )}
    </div>
  );
}
