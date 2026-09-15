import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function AdminProductsTable({
  products,
  loading,
  onEditProduct,
  onDeleteProduct,
  onToggleStatus,
  onAddNew,
}) {
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const handleDelete = async (product) => {
    const confirmMsg = `Are you sure you want to delete "${product.name}"? This action cannot be undone.`;
    if (!window.confirm(confirmMsg)) return;

    setDeletingId(product._id || product.id);
    try {
      await onDeleteProduct(product._id || product.id, product.name);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggle = async (product) => {
    setTogglingId(product._id || product.id);
    try {
      await onToggleStatus(product);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="w-full">
      <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm" aria-label="Admin Product Inventory Table">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3.5 min-w-[260px]">Product</th>
                <th className="px-6 py-3.5 min-w-[140px]">Category</th>
                <th className="px-6 py-3.5 min-w-[110px]">Price</th>
                <th className="px-6 py-3.5 min-w-[140px]">Stock Level</th>
                <th className="px-6 py-3.5 min-w-[120px]">Status</th>
                <th className="px-6 py-3.5 min-w-[180px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-lg bg-slate-200 shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="w-1/3 h-4 bg-slate-200 rounded" />
                          <div className="w-1/4 h-3 bg-slate-100 rounded" />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 px-6">
                    <div className="flex flex-col items-center gap-3 max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <rect x="2" y="3" width="20" height="14" rx="2" />
                          <line x1="8" y1="21" x2="16" y2="21" />
                          <line x1="12" y1="17" x2="12" y2="21" />
                        </svg>
                      </div>
                      <span className="text-base font-bold text-slate-900">
                        No inventory items found
                      </span>
                      <span className="text-xs text-slate-500">
                        No products match your current search and filter settings.
                      </span>
                      <button
                        type="button"
                        className="mt-2 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-xs transition-colors"
                        onClick={onAddNew}
                      >
                        Add New Product
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const prodId = product._id || product.id;
                  const stockVal = Number(product.stock) || 0;
                  const isOutOfStock = stockVal <= 0;
                  const isLowStock = !isOutOfStock && stockVal <= 10;
                  const categoryName = product.category?.name || 'Unassigned';
                  const isActive = product.isActive !== false;
                  const imageUrl =
                    Array.isArray(product.images) && product.images[0]
                      ? product.images[0]
                      : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80';

                  return (
                    <tr key={prodId} className="hover:bg-slate-50/70 transition-colors">
                      {/* Product info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-11 h-11 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80';
                            }}
                          />
                          <div>
                            <div className="font-semibold text-slate-900 text-sm">
                              {product.name}
                            </div>
                            <div className="text-xs text-slate-400 font-mono mt-0.5">
                              {product.slug || prodId}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                          {categoryName}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900">
                          ${Number(product.price).toFixed(2)}
                        </span>
                      </td>

                      {/* Stock */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-1">
                          <span className="font-semibold text-slate-900 text-sm">
                            {stockVal} units
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                              isOutOfStock
                                ? 'bg-rose-100 text-rose-700'
                                : isLowStock
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                          </span>
                        </div>
                      </td>

                      {/* Status with quick toggle */}
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => handleToggle(product)}
                          disabled={togglingId === prodId}
                          title={`Click to ${isActive ? 'deactivate' : 'activate'} this product`}
                          className="bg-transparent border-0 p-0 cursor-pointer inline-flex items-center"
                        >
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isActive ? 'bg-emerald-500' : 'bg-slate-400'
                              }`}
                            />
                            {isActive ? 'Active' : 'Inactive'}
                          </span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/products/${prodId}`}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-medium inline-flex items-center gap-1 no-underline transition-colors"
                            title="View specification detail"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                            <span>View</span>
                          </Link>

                          <button
                            type="button"
                            className="px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50/50 text-blue-700 hover:bg-blue-100 text-xs font-medium inline-flex items-center gap-1 cursor-pointer transition-colors"
                            onClick={() => onEditProduct(product)}
                            title="Edit product information"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            className="px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50/50 text-rose-700 hover:bg-rose-100 text-xs font-medium inline-flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                            onClick={() => handleDelete(product)}
                            disabled={deletingId === prodId}
                            title="Delete product listing"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                            <span>{deletingId === prodId ? '...' : 'Delete'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
