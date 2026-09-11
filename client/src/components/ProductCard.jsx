import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function ProductCard({ product, onQuickView }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [justAdded, setJustAdded] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isOutOfStock = Number(product.stock) <= 0;
  const isLowStock = !isOutOfStock && Number(product.stock) <= 10;
  const categoryName = product.category?.name || 'General';

  const imageUrl =
    Array.isArray(product.images) && product.images[0]
      ? product.images[0]
      : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (isAdmin || isOutOfStock) return;

    const res = await addToCart(product, 1);
    if (res?.success) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1800);
    }
  };

  return (
    <div
      className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col cursor-pointer"
      onClick={() => onQuickView && onQuickView(product)}
    >
      {/* Card Image Container */}
      <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';
          }}
        />

        {/* Category Badge */}
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-semibold bg-white/90 backdrop-blur-xs text-slate-700 shadow-xs border border-white/40">
          {categoryName}
        </span>

        {/* Stock Badge */}
        <span
          className={`absolute top-3 right-3 px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide uppercase ${
            isOutOfStock
              ? 'bg-rose-100 text-rose-700 border border-rose-200'
              : isLowStock
              ? 'bg-amber-100 text-amber-800 border border-amber-200'
              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
          }`}
        >
          {isOutOfStock ? 'Sold Out' : isLowStock ? `Only ${product.stock} Left` : 'In Stock'}
        </span>

        {/* Hover Quick View Trigger */}
        <button
          type="button"
          className="absolute inset-x-4 bottom-3 py-2 rounded-xl bg-white/95 backdrop-blur-xs text-slate-800 text-xs font-semibold shadow-md flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            if (onQuickView) onQuickView(product);
          }}
          aria-label={`Quick view ${product.name}`}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span>Quick View</span>
        </button>
      </div>

      {/* Card Details Body */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-1 text-xs text-amber-500 font-medium mb-1">
            <span>{'★'.repeat(5)}</span>
            <span className="text-slate-500 ml-1">4.9</span>
          </div>

          <h3 className="font-semibold text-slate-900 text-sm line-clamp-1 group-hover:text-blue-600 transition-colors" title={product.name}>
            {product.name}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mt-1">
            {product.description || 'Premium quality materials crafted for everyday excellence.'}
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
          <div>
            <span className="block text-[11px] text-slate-400 uppercase tracking-wider font-medium">Price</span>
            <span className="text-base font-bold text-slate-900">
              ${Number(product.price).toFixed(2)}
            </span>
          </div>

          {isAdmin ? (
            <button
              type="button"
              className="py-1.5 px-3 rounded-lg text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/products/${product._id || product.id}`);
              }}
              title="Manage product specification and inventory"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              <span>Manage</span>
            </button>
          ) : (
            <button
              type="button"
              className={`py-1.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isOutOfStock
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : justAdded
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-xs'
              }`}
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              title={
                isOutOfStock
                  ? 'Product is currently out of stock'
                  : user
                  ? 'Add to Cart'
                  : 'Sign in to add to cart'
              }
            >
              {isOutOfStock ? (
                <span>Out of Stock</span>
              ) : justAdded ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
