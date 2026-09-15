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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* =========================================
            Logo & Brand
            ========================================= */}
        <Link
          to="/"
          className="flex items-center gap-2.5 group cursor-pointer no-underline"
          onClick={handleHomeClick}
        >
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:bg-blue-700 transition-colors">
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

          <div className="flex flex-col">
            <span className="font-bold text-slate-900 text-base leading-tight tracking-tight group-hover:text-blue-600 transition-colors">
              E-Commerce
            </span>
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Storefront
            </span>
          </div>
        </Link>

        {/* =========================================
            Desktop Navigation Links
            ========================================= */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            type="button"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              location.pathname === '/' ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            onClick={handleHomeClick}
          >
            Home
          </button>

          <button
            type="button"
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            onClick={handleProductsClick}
          >
            Products
          </button>

          <NavLink
            to="/about"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors no-underline ${
                isActive ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`
            }
          >
            About
          </NavLink>

          <NavLink
            to="/terms"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors no-underline ${
                isActive ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`
            }
          >
            Terms
          </NavLink>

          <NavLink
            to="/returns"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors no-underline ${
                isActive ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`
            }
          >
            Returns
          </NavLink>
        </nav>

        {/* =========================================
            Desktop Right Actions
            ========================================= */}
        <div className="flex items-center gap-2.5">

          {/* Shopping Cart - Hidden for Admin */}
          {!isAdmin && (
            <Link
              to="/cart"
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors text-sm font-medium no-underline shadow-2xs"
              title="View Shopping Cart"
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
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="bg-blue-600 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-none">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {/* Admin Inventory Quick Link */}
          {isAdmin && (
            <Link
              to="/products"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold no-underline"
            >
              <svg
                width="14"
                height="14"
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

          {/* Logged-in User */}
          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/80">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                    isAdmin ? 'bg-purple-600' : 'bg-blue-600'
                  }`}
                  title={user.email}
                >
                  {userInitial}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[100px]">
                    {user.name || 'User'}
                  </span>
                  <span className="text-[10px] font-medium text-slate-500">
                    {isAdmin ? '🛡️ Admin' : '👤 Customer'}
                  </span>
                </div>
              </div>

              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-2xs no-underline"
              >
                <span>Dashboard</span>
              </Link>

              <button
                type="button"
                onClick={logout}
                className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors no-underline"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-2xs transition-all flex items-center gap-1 no-underline"
              >
                <span>Register</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14" />
                  <path d="M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 shadow-lg">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className="text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
              onClick={handleHomeClick}
            >
              Home
            </button>
            <button
              type="button"
              className="text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
              onClick={handleProductsClick}
            >
              Products
            </button>
            <Link
              to="/about"
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 no-underline"
              onClick={handleMobileNavigation}
            >
              About
            </Link>
            <Link
              to="/terms"
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 no-underline"
              onClick={handleMobileNavigation}
            >
              Terms
            </Link>
            <Link
              to="/returns"
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 no-underline col-span-2"
              onClick={handleMobileNavigation}
            >
              Returns Policy
            </Link>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                      isAdmin ? 'bg-purple-600' : 'bg-blue-600'
                    }`}
                  >
                    {userInitial}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{user.name}</div>
                    <div className="text-xs text-slate-500">{isAdmin ? 'Store Admin' : 'Customer'}</div>
                  </div>
                </div>

                {!isAdmin && (
                  <Link
                    to="/cart"
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-100 text-sm font-medium text-slate-800 no-underline"
                    onClick={handleMobileNavigation}
                  >
                    <span>View Shopping Cart</span>
                    <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {cartCount}
                    </span>
                  </Link>
                )}

                <Link
                  to="/dashboard"
                  className="block text-center py-2 px-3 rounded-lg bg-blue-600 text-white text-sm font-semibold no-underline"
                  onClick={handleMobileNavigation}
                >
                  Go to Dashboard
                </Link>

                <button
                  type="button"
                  className="w-full py-2 px-3 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-100 cursor-pointer"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  className="text-center py-2 px-3 rounded-lg border border-slate-200 text-slate-800 text-sm font-medium hover:bg-slate-100 no-underline"
                  onClick={handleMobileNavigation}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-center py-2 px-3 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 no-underline"
                  onClick={handleMobileNavigation}
                >
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