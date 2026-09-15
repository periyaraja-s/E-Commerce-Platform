import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import api from '../services/api.js';
import ProductFormModal from '../components/ProductFormModal.jsx';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const isAdmin = user?.role === 'admin';

  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProduct = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/products/${id}`);
      if (res.data?.success && res.data?.data) {
        setProduct(res.data.data);
      } else {
        setError('Product not found');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (isAdmin) {
      api
        .get('/categories')
        .then((res) => {
          if (res.data?.success) setCategories(res.data.data || []);
        })
        .catch(() => {});
    }
  }, [isAdmin]);

  const handleAddToCart = async () => {
    if (isAdmin || !product || product.stock <= 0) return;
    const res = await addToCart(product, quantity);
    if (res?.success) {
      setAddedNotice(true);
      setTimeout(() => setAddedNotice(false), 2500);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return;
    }
    setIsDeleting(true);
    try {
      await api.delete(`/products/${product._id}`);
      navigate('/products', { replace: true });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product');
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-blue-600 flex items-center justify-center mb-3 animate-pulse">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-900">Loading Product Details</h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">Fetching specifications and real-time inventory...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-900">Product Unavailable</h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">{error || 'The requested product could not be found or has been removed.'}</p>
        <Link
          to="/products"
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors no-underline"
        >
          Return to Products
        </Link>
      </div>
    );
  }

  const categoryName = product.category?.name || 'General';
  const imageUrl =
    Array.isArray(product.images) && product.images[0]
      ? product.images[0]
      : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="flex items-center flex-wrap gap-2 text-xs sm:text-sm text-slate-500 mb-6 font-medium">
        <Link to="/products" className="text-slate-600 hover:text-blue-600 transition-colors no-underline">
          &larr; Back to Products
        </Link>
        <span>/</span>
        <span>{categoryName}</span>
        <span>/</span>
        <span className="text-slate-900 font-semibold">{product.name}</span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 p-6 sm:p-10">
        {/* Gallery */}
        <div>
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full aspect-square object-cover rounded-2xl bg-slate-50 border border-slate-100"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';
            }}
          />
        </div>

        {/* Info */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                {categoryName}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  isOutOfStock ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {isOutOfStock ? 'Out of Stock' : `${product.stock} in stock`}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{product.name}</h1>

            <div className="text-3xl font-extrabold text-blue-600 mt-3">${Number(product.price).toFixed(2)}</div>

            <div className="mt-6 py-4 border-y border-slate-100 space-y-2.5 text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">SKU / Slug:</span>
                <span className="font-mono text-slate-700">{product.slug || product._id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Category:</span>
                <span className="font-semibold text-slate-900">{categoryName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Inventory:</span>
                <span className={`font-semibold ${isOutOfStock ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {isOutOfStock ? 'Currently Sold Out' : `${product.stock} Units Available`}
                </span>
              </div>
            </div>

            <p className="mt-6 text-sm sm:text-base text-slate-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Customer Purchasing Controls (Hidden from Admin) */}
          {!isAdmin && (
            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-3">
                {!isOutOfStock && (
                  <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-50 shrink-0">
                    <button
                      type="button"
                      className="w-10 h-11 flex items-center justify-center text-slate-600 hover:bg-slate-200 text-base font-bold transition-colors cursor-pointer border-0 bg-transparent"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <div className="w-11 h-11 flex items-center justify-center font-bold text-slate-900 text-sm">
                      {quantity}
                    </div>
                    <button
                      type="button"
                      className="w-10 h-11 flex items-center justify-center text-slate-600 hover:bg-slate-200 text-base font-bold transition-colors cursor-pointer border-0 bg-transparent"
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      disabled={quantity >= product.stock}
                    >
                      +
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  className="flex-1 py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  {isOutOfStock ? 'Out of Stock' : `Add ${quantity} to Cart`}
                </button>
              </div>

              {addedNotice && (
                <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  Added {quantity} item(s) to your shopping cart!
                </div>
              )}
            </div>
          )}

          {/* Admin Management Controls */}
          {isAdmin && (
            <div className="mt-8 p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Admin Product Controls</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Update product details, stock levels, or delete this SKU.
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    product.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {product.isActive ? 'Status: Active' : 'Status: Inactive'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit Product
                </button>
                <button
                  type="button"
                  className="px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-700 text-xs font-semibold inline-flex items-center gap-2 cursor-pointer shadow-xs transition-colors disabled:opacity-50"
                  disabled={isDeleting}
                  onClick={handleDelete}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  {isDeleting ? 'Deleting...' : 'Delete Product'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isAdmin && (
        <ProductFormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={fetchProduct}
          productToEdit={product}
          categories={categories}
        />
      )}
    </div>
  );
}
