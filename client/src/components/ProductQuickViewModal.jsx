import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function ProductQuickViewModal({ product, onClose }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const isAdmin = user?.role === 'admin';
  const isOutOfStock = Number(product.stock) <= 0;
  const maxStock = Number(product.stock) || 0;
  const categoryName = product.category?.name || 'General';

  const imageUrl =
    Array.isArray(product.images) && product.images[0]
      ? product.images[0]
      : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';

  const handleAddToCart = async () => {
    if (isAdmin || isOutOfStock) return;

    const res = await addToCart(product, quantity);
    if (res?.success) {
      setAdded(true);
      setTimeout(() => {
        setAdded(false);
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto" onClick={onClose}>
      <div
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer text-lg leading-none"
          onClick={onClose}
          aria-label="Close modal"
        >
          &times;
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Gallery / Image */}
          <div className="aspect-square md:aspect-auto w-full bg-slate-100 flex items-center justify-center overflow-hidden">
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';
              }}
            />
          </div>

          {/* Details */}
          <div className="p-6 sm:p-8 flex flex-col justify-between gap-5">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                  {categoryName}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                    isOutOfStock
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {isOutOfStock ? 'Out of Stock' : `${product.stock} units available`}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {product.name}
              </h2>

              <div className="text-2xl font-extrabold text-blue-600">
                ${Number(product.price).toFixed(2)}
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                {product.description || 'Crafted with premium materials and engineered for longevity.'}
              </p>

              {/* Inventory Meta */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400 font-medium">Product ID:</span>
                  <span className="font-mono">{product.slug || product._id}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400 font-medium">Shipping:</span>
                  <span>Free on orders over $50</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400 font-medium">Guarantee:</span>
                  <span>1-Year Standard Guarantee</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            {isAdmin ? (
              <div className="pt-2">
                <button
                  type="button"
                  className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  onClick={() => {
                    onClose();
                    navigate(`/products/${product._id || product.id}`);
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  <span>Manage in Inventory</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 pt-2">
                {!isOutOfStock && (
                  <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden shrink-0">
                    <button
                      type="button"
                      className="w-9 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-40 cursor-pointer font-bold"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="w-9 text-center text-sm font-bold text-slate-800">{quantity}</span>
                    <button
                      type="button"
                      className="w-9 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-40 cursor-pointer font-bold"
                      onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                      disabled={quantity >= maxStock}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                    isOutOfStock
                      ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                      : added
                      ? 'bg-emerald-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white'
                  }`}
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                >
                  {isOutOfStock ? (
                    <span>Out of Stock</span>
                  ) : added ? (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <circle cx="9" cy="21" r="1" />
                        <circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                      </svg>
                      <span>{user ? `Add ${quantity} to Cart` : 'Sign in to Add'}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
