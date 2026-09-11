import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Cart() {
  const navigate = useNavigate();
  const {
    items,
    loading,
    actionLoading,
    cartError,
    fetchCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    cartCount,
    shipping,
    tax,
    grandTotal,
    toast,
  } = useCart();

  const { user } = useAuth();

  // Admin access guard
  if (user?.role === 'admin') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="max-w-md mx-auto text-center bg-white p-8 rounded-3xl border border-slate-200 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900">Admin Role Restriction</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
            Administrator accounts are restricted from consumer shopping carts and checkout operations. Please utilize the inventory management table and admin dashboard to manage products and store orders.
          </p>
          <Link
            to="/products"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold no-underline transition-colors shadow-xs"
          >
            Manage Inventory Table &rarr;
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Inline Toast Banner if present */}
      {toast && (
        <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2 shadow-xs">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Cart Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Shopping Cart</h1>
          <p className="text-sm text-slate-500 mt-1">
            {user ? `Welcome back, ${user.name}. Your cart items are saved to your account.` : 'Review items, adjust quantities, and proceed to checkout.'}
          </p>
        </div>
        {items.length > 0 && !loading && (
          <button
            type="button"
            className="px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-700 text-xs font-semibold cursor-pointer transition-colors self-start sm:self-auto disabled:opacity-50"
            onClick={clearCart}
            disabled={actionLoading}
            title="Remove all items from your cart"
          >
            Clear Cart
          </button>
        )}
      </div>

      {/* Error state if server sync failed */}
      {cartError && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 flex items-center justify-between gap-3 text-sm shadow-xs">
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{cartError}</span>
          </div>
          <button
            type="button"
            onClick={fetchCart}
            className="text-rose-700 hover:text-rose-900 font-bold underline cursor-pointer bg-transparent border-0 text-xs"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-500">
          <svg className="w-8 h-8 text-blue-600 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
          </svg>
          <span className="text-sm font-medium">Syncing shopping cart...</span>
        </div>
      ) : items.length === 0 ? (
        /* Empty Cart State */
        <div className="py-16 text-center max-w-md mx-auto bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Your Cart is Currently Empty</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 mb-6">
            Explore our curated catalog of electronics, lifestyle essentials, and apparel.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              to="/"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold no-underline transition-colors shadow-xs"
            >
              &larr; Browse Storefront
            </Link>
            <Link
              to="/products"
              className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold no-underline transition-colors shadow-xs"
            >
              View All Products
            </Link>
          </div>
        </div>
      ) : (
        /* Active Cart Content */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items Column */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span>Products ({cartCount} {cartCount === 1 ? 'item' : 'items'})</span>
                <span className="hidden sm:inline">Price</span>
              </div>

              <div className="divide-y divide-slate-100">
                {items.map(({ product, quantity, itemSubtotal }) => {
                  if (!product) return null;
                  const pId = product._id || product.id;
                  const itemPrice = Number(product.price) || 0;
                  const availableStock = typeof product.stock === 'number' ? product.stock : 99;
                  const computedSubtotal = itemSubtotal != null ? itemSubtotal : itemPrice * quantity;
                  const isMaxStockReached = quantity >= availableStock;
                  const imageUrl =
                    Array.isArray(product.images) && product.images[0]
                      ? product.images[0]
                      : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';

                  return (
                    <div key={pId} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                      <div className="shrink-0">
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover bg-slate-50 border border-slate-100"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';
                          }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
                          {product.category?.name || 'Store Item'}
                        </div>
                        <h3 className="text-base font-bold text-slate-900 truncate">{product.name}</h3>
                        <div className="text-xs text-slate-500 mt-0.5">
                          ${itemPrice.toFixed(2)} each
                        </div>

                        {/* Stock indicator badge */}
                        <div className="mt-2 text-xs">
                          {availableStock <= 5 ? (
                            <span className="text-amber-700 font-semibold">
                              ⚠️ Only {availableStock} left in stock
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-medium">
                              ✓ In Stock ({availableStock} available)
                            </span>
                          )}
                        </div>

                        {/* Quantity Stepper & Remove */}
                        <div className="mt-3 flex items-center gap-3">
                          <div className="inline-flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-50">
                            <button
                              type="button"
                              onClick={() => updateQuantity(pId, quantity - 1)}
                              disabled={actionLoading || quantity <= 1}
                              aria-label="Decrease quantity"
                              title={quantity <= 1 ? 'Minimum quantity is 1 (use Remove to delete)' : 'Decrease quantity'}
                              className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors font-bold text-sm cursor-pointer border-0 bg-transparent disabled:opacity-50"
                            >
                              -
                            </button>
                            <span className="w-8 h-8 flex items-center justify-center font-bold text-xs text-slate-900">
                              {quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(pId, quantity + 1)}
                              disabled={actionLoading || isMaxStockReached}
                              aria-label="Increase quantity"
                              title={isMaxStockReached ? `Maximum available stock (${availableStock}) reached` : 'Increase quantity'}
                              className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors font-bold text-sm cursor-pointer border-0 bg-transparent disabled:opacity-50"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition-colors cursor-pointer bg-transparent border-0 p-1"
                            onClick={() => removeFromCart(pId)}
                            disabled={actionLoading}
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className="sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 flex sm:flex-col justify-between items-center sm:items-end">
                        <span className="text-xs text-slate-400 sm:hidden">Total</span>
                        <span className="font-extrabold text-slate-900 text-base sm:text-lg">
                          ${computedSubtotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2">
              <Link to="/" className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors no-underline inline-flex items-center gap-1.5">
                &larr; Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4 sticky top-24">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Order Summary</h2>

              <div className="space-y-3.5 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Subtotal ({cartCount} {cartCount === 1 ? 'item' : 'items'})</span>
                  <span className="font-semibold text-slate-900">${cartSubtotal.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    Shipping
                    {shipping === 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                        FREE
                      </span>
                    )}
                  </span>
                  <span className="font-semibold text-slate-900">{shipping === 0 ? '$0.00' : `$${shipping.toFixed(2)}`}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-semibold text-slate-900">${tax.toFixed(2)}</span>
                </div>

                {cartSubtotal < 50 && (
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-800 text-xs font-medium">
                    Add ${(50 - cartSubtotal).toFixed(2)} more to qualify for <strong>FREE shipping</strong>!
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-base font-extrabold text-slate-900">
                  <span>Estimated Total</span>
                  <span className="text-xl text-blue-600">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="button"
                className="w-full mt-6 py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                onClick={() => navigate('/checkout')}
                disabled={actionLoading || items.length === 0}
              >
                Proceed to Checkout &rarr;
              </button>

              <div className="mt-6 pt-6 border-t border-slate-100 space-y-2.5 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span>Bank-grade 256-bit encrypted checkout</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>30-day money-back satisfaction guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
