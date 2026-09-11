import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function PublicFooter() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const isAdmin = user?.role === 'admin';

  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Col 1: Brand & Bio */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                </svg>
              </div>
              <span className="font-bold text-white text-base tracking-tight">E-Commerce Platform</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Modern full-stack commerce storefront designed for seamless shopping, real-time inventory tracking, and swift order fulfillment.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 text-xs font-medium text-slate-300 border border-slate-700/60">
                🔒 SSL Encrypted
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 text-xs font-medium text-slate-300 border border-slate-700/60">
                🛡️ Verified Store
              </span>
            </div>
          </div>

          {/* Col 2: Navigation / Catalog */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Catalog</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-slate-400 hover:text-white transition-colors no-underline">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/products?category=electronics" className="text-slate-400 hover:text-white transition-colors no-underline">
                  Electronics
                </Link>
              </li>
              <li>
                <Link to="/products?category=apparel-fashion" className="text-slate-400 hover:text-white transition-colors no-underline">
                  Apparel &amp; Fashion
                </Link>
              </li>
              <li>
                <Link to="/products?category=home-living" className="text-slate-400 hover:text-white transition-colors no-underline">
                  Home &amp; Living
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Portal */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Account &amp; Orders</h4>
            <ul className="space-y-2">
              {user ? (
                <>
                  <li>
                    <Link to="/dashboard" className="text-slate-400 hover:text-white transition-colors no-underline">
                      {isAdmin ? 'Admin Dashboard' : 'My Dashboard'}
                    </Link>
                  </li>
                  <li>
                    <Link to="/orders" className="text-slate-400 hover:text-white transition-colors no-underline">
                      {isAdmin ? 'Store Orders' : 'Order History'}
                    </Link>
                  </li>
                  {!isAdmin && (
                    <li>
                      <Link to="/cart" className="text-slate-400 hover:text-white transition-colors no-underline flex items-center justify-between">
                        <span>Cart</span>
                        {cartCount > 0 && (
                          <span className="bg-blue-600 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full">
                            {cartCount}
                          </span>
                        )}
                      </Link>
                    </li>
                  )}
                  <li>
                    <button
                      type="button"
                      onClick={logout}
                      className="text-slate-400 hover:text-red-400 transition-colors bg-transparent border-0 p-0 cursor-pointer text-sm"
                    >
                      Sign Out
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login" className="text-slate-400 hover:text-white transition-colors no-underline">
                      Sign In
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" className="text-slate-400 hover:text-white transition-colors no-underline">
                      Create Account
                    </Link>
                  </li>
                  <li>
                    <Link to="/login" className="text-slate-400 hover:text-white transition-colors no-underline">
                      Order Tracking
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Col 4: Public Policies & About */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Company &amp; Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-slate-400 hover:text-white transition-colors no-underline">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-slate-400 hover:text-white transition-colors no-underline">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-slate-400 hover:text-white transition-colors no-underline">
                  Return &amp; Refund Policy
                </Link>
              </li>
              <li className="pt-1">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  📦 Fast 2-3 Day Dispatch
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom copyright line */}
      <div className="border-t border-slate-800 bg-slate-950/60 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>&copy; {new Date().getFullYear()} E-Commerce Platform. All rights reserved.</span>
          <span>Built with React, Express, MongoDB &amp; Tailwind CSS</span>
        </div>
      </div>
    </footer>
  );
}
