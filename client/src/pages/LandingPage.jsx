import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import api from '../services/api.js';
import ProductCard from '../components/ProductCard.jsx';
import ProductQuickViewModal from '../components/ProductQuickViewModal.jsx';
import PublicHeader from '../components/PublicHeader.jsx';
import PublicFooter from '../components/PublicFooter.jsx';

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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Toast Notification banner */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-sm border border-slate-800">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-400">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{toast.message}</span>
          {user && !isAdmin && (
            <Link to="/cart" className="text-blue-400 font-semibold hover:underline no-underline ml-2">
              View Cart &rarr;
            </Link>
          )}
        </div>
      )}

      {/* Sticky Public Navigation Bar (Navbar) */}
      <PublicHeader />

      {/* Hero Section with E-Commerce CTA */}
      <section className="bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            {/* Announcement Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold">
              <span>✨</span>
              <span>Spring 2026 Collection • Free Express Delivery over $50</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Curated Essentials for <span className="text-blue-600">Everyday Excellence</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              Discover high-fidelity audio gear, ergonomic workplace solutions, and premium apparel crafted for enduring comfort, modern performance, and aesthetic precision.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                onClick={scrollToProducts}
              >
                <span>Explore Catalog</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14" />
                  <path d="M12 5l7 7-7 7" />
                </svg>
              </button>

              {user ? (
                <Link
                  to="/dashboard"
                  className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-sm transition-all no-underline shadow-xs inline-flex items-center"
                >
                  <span>Go to Dashboard</span>
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-sm transition-all no-underline shadow-xs inline-flex items-center"
                >
                  <span>Create Customer Account</span>
                </Link>
              )}
            </div>

            {/* Social Proof & Trust Metric Bar */}
            <div className="pt-6 border-t border-slate-200 grid grid-cols-3 gap-4">
              <div>
                <div className="text-lg sm:text-xl font-bold text-slate-900">4.9 / 5.0</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">★★★★★ 12k+ Reviews</div>
              </div>
              <div className="border-l border-slate-200 pl-4">
                <div className="text-lg sm:text-xl font-bold text-slate-900">100%</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">Verified Authentic</div>
              </div>
              <div className="border-l border-slate-200 pl-4">
                <div className="text-lg sm:text-xl font-bold text-slate-900">2-3 Days</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">Fast Tracked Delivery</div>
              </div>
            </div>
          </div>

          {/* Hero Visual Spotlight Card */}
          <div className="lg:col-span-5">
            {featuredHeroProduct ? (
              <div
                className="bg-white rounded-3xl border border-slate-200 shadow-md p-5 relative overflow-hidden group hover:shadow-xl transition-all cursor-pointer"
                onClick={() => setActiveQuickViewProduct(featuredHeroProduct)}
              >
                <div className="absolute top-7 left-7 z-10 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-600 text-white shadow-xs">
                  ⭐ Featured Pick
                </div>
                <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-100 mb-4">
                  <img
                    src={
                      Array.isArray(featuredHeroProduct.images) && featuredHeroProduct.images[0]
                        ? featuredHeroProduct.images[0]
                        : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'
                    }
                    alt={featuredHeroProduct.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                    {featuredHeroProduct.category?.name || 'Electronics'}
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 line-clamp-1">{featuredHeroProduct.name}</h2>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {featuredHeroProduct.description || 'Engineered for exceptional acoustic clarity and tactile feel.'}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div>
                      <span className="block text-[11px] text-slate-400 font-medium">Regular Price</span>
                      <div className="text-lg font-bold text-slate-900">
                        ${Number(featuredHeroProduct.price).toFixed(2)}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
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
              <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-5 relative overflow-hidden">
                <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-100 mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"
                    alt="Premium Gear"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Electronics</div>
                  <h2 className="text-lg font-bold text-slate-900">Wireless Studio Headphones</h2>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="text-lg font-bold text-slate-900">$199.99</div>
                    <button
                      type="button"
                      className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                      onClick={scrollToProducts}
                    >
                      Shop Now &rarr;
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Value Propositions & Benefits Strip */}
      <section id="benefits" className="bg-white py-12 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/60 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Fast &amp; Free Shipping</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Free nationwide express delivery on all orders exceeding $50 with live carrier tracking.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/60 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">100% Authentic Quality</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Hand-inspected merchandise backed by direct manufacturer warranties and certifications.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/60 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">30-Day Hassle-Free Returns</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Changed your mind? Return any unused item within 30 days for an instant, no-questions refund.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/60 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Bank-Grade Security</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              256-bit encrypted authentication safeguards your personal data and payments at every step.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Categories Bar */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 w-full">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">Explore Collections</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Shop by Category</h2>
          </div>
          <button
            type="button"
            className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer bg-transparent border-0"
            onClick={() => handleSelectCategoryPill('all')}
          >
            View Full Catalog &rarr;
          </button>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border flex items-center gap-2 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            onClick={() => handleSelectCategoryPill('all')}
          >
            <span>✨</span>
            <span>All Categories</span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat._id || cat.slug}
              type="button"
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border flex items-center gap-2 cursor-pointer ${
                selectedCategory === cat.slug || selectedCategory === cat._id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              onClick={() => handleSelectCategoryPill(cat.slug || cat._id)}
            >
              <span>🏷️</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Real Products Catalog Section */}
      <section id="products" ref={productsSectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 w-full">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">Inventory Connected</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Featured Products</h2>
            <p className="text-sm text-slate-500 mt-1">
              Explore authentic merchandise with live pricing and verified stock status.
            </p>
          </div>

          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
            {loadingProducts ? 'Refreshing...' : `${products.length} Products Available`}
          </div>
        </div>

        {/* Search, Category Filter & Sorting Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          {/* Search Input Box */}
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              placeholder="Search products by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer text-lg leading-none"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search query"
              >
                &times;
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="cat-filter-select" className="text-xs font-semibold text-slate-600 shrink-0">
              Category:
            </label>
            <select
              id="cat-filter-select"
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
          <div className="flex items-center gap-2">
            <label htmlFor="sort-filter-select" className="text-xs font-semibold text-slate-600 shrink-0">
              Sort by:
            </label>
            <select
              id="sort-filter-select"
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Active filters:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-semibold">
                Search: &ldquo;{searchQuery}&rdquo;
                <button type="button" onClick={() => setSearchQuery('')} className="hover:text-blue-900 cursor-pointer">
                  &times;
                </button>
              </span>
            )}
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-semibold">
                Category:{' '}
                {categories.find((c) => c.slug === selectedCategory || c._id === selectedCategory)?.name ||
                  selectedCategory}
                <button type="button" onClick={() => setSelectedCategory('all')} className="hover:text-blue-900 cursor-pointer">
                  &times;
                </button>
              </span>
            )}
            <button
              type="button"
              className="text-slate-500 hover:text-slate-800 underline ml-2 cursor-pointer bg-transparent border-0"
              onClick={clearAllFilters}
            >
              Reset all filters
            </button>
          </div>
        )}

        {/* Catalog Error Banner */}
        {catalogError && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{catalogError}</span>
            </div>
            <button
              type="button"
              onClick={fetchProducts}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Products Grid */}
        {loadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sk) => (
              <div key={sk} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 animate-pulse">
                <div className="aspect-4/3 bg-slate-200 rounded-xl" />
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="h-5 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 rounded w-full" />
                </div>
                <div className="h-9 bg-slate-200 rounded-xl" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product._id || product.id}
                product={product}
                onQuickView={(p) => setActiveQuickViewProduct(p)}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 px-4 text-center rounded-3xl border border-dashed border-slate-300 bg-white max-w-lg mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">No products match your criteria</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                We couldn&apos;t find any active items matching your search or category filter. Try clearing your filters to see all available products.
              </p>
            </div>
            <button
              type="button"
              className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer"
              onClick={clearAllFilters}
            >
              Clear Filters &amp; Show All Products
            </button>
          </div>
        )}
      </section>

      {/* Promotional Membership Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="bg-linear-to-r from-blue-700 to-indigo-800 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md">
          <div className="space-y-3 max-w-xl">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-xs">
              Limited Time Member Offer
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Unlock 15% Off Your First Purchase</h2>
            <p className="text-sm text-blue-100 leading-relaxed">
              Create a free customer account today to access member-only deals, instant order tracking, and expedited checkout.
            </p>
          </div>
          <div className="shrink-0">
            {isAdmin ? (
              <Link
                to="/products"
                className="py-3 px-6 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm shadow-md transition-colors inline-block no-underline"
              >
                Manage Inventory Table &rarr;
              </Link>
            ) : user ? (
              <Link
                to="/cart"
                className="py-3 px-6 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm shadow-md transition-colors inline-block no-underline"
              >
                View Shopping Cart ({cartCount})
              </Link>
            ) : (
              <Link
                to="/register"
                className="py-3 px-6 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm shadow-md transition-colors inline-block no-underline"
              >
                Register Free Account &rarr;
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Public Footer */}
      <PublicFooter />

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
