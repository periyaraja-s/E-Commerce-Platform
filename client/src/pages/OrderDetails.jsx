import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';

export default function OrderDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';
  const isNewOrder = Boolean(location.state?.isNewOrder || location.pathname.startsWith('/order-confirmation'));

  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);
  const [error, setError] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [copied, setCopied] = useState(false);

  // Admin status update state
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState(null);
  const [statusError, setStatusError] = useState(null);

  useEffect(() => {
    // If order is not present or parameter changed, fetch from API
    if (!order || (order._id !== id && order.orderNumber !== id)) {
      setLoading(true);
      setError(null);
      setAccessDenied(false);

      api
        .get(`/orders/${id}`)
        .then((res) => {
          if (res.data?.success && res.data?.data) {
            setOrder(res.data.data);
          } else {
            setError('Order details could not be retrieved.');
          }
        })
        .catch((err) => {
          console.error('Failed to fetch order details:', err);
          if (err.response?.status === 403) {
            setAccessDenied(true);
            setError(err.response?.data?.message || 'Access denied: You are only authorized to view your own orders.');
          } else if (err.response?.status === 404) {
            setError('Order not found. Please verify the order reference number.');
          } else {
            setError(err.response?.data?.message || 'Failed to load order details.');
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  const handleCopyOrderNumber = () => {
    if (order?.orderNumber) {
      navigator.clipboard.writeText(order.orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAdminStatusChange = async (newStatus) => {
    if (!order?._id || !isAdmin) return;
    setIsUpdatingStatus(true);
    setStatusFeedback(null);
    setStatusError(null);

    try {
      const res = await api.patch(`/orders/${order._id}/status`, { status: newStatus });
      if (res.data?.success && res.data?.data) {
        setOrder(res.data.data);
        setStatusFeedback(`Order status successfully updated to "${newStatus.toUpperCase()}".`);
        setTimeout(() => setStatusFeedback(null), 4000);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      const msg = err.response?.data?.message || 'Server error: Failed to update order status.';
      setStatusError(msg);
      setTimeout(() => setStatusError(null), 5000);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <svg
          className="animate-spin text-blue-600 mx-auto mb-4"
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
        </svg>
        <h2 className="text-xl font-bold text-slate-900">Retrieving Order Details...</h2>
        <p className="text-sm text-slate-500 mt-1">Fetching order records and fulfillment status.</p>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-slate-900">Access Restricted</h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
          {error || 'You are only authorized to view your own customer orders.'}
        </p>
        <div className="mt-6 flex justify-center">
          <Link
            to="/orders"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold no-underline shadow-xs"
          >
            &larr; Return to My Orders
          </Link>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4 border border-rose-200">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-slate-900">Order Not Found</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {error || "We couldn't locate the specified order in store records."}
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            to="/orders"
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold no-underline shadow-xs"
          >
            {isAdmin ? 'Order Management' : 'My Orders'}
          </Link>
          {!isAdmin && (
            <Link
              to="/products"
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold no-underline shadow-xs"
            >
              Browse Catalog
            </Link>
          )}
        </div>
      </div>
    );
  }

  const items = order.items || [];
  const shippingAddress = order.shippingAddress || {};
  const orderDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const isCancelled = order.status === 'cancelled';
  const isDelivered = order.status === 'delivered';

  // Status timeline steps
  const steps = [
    { key: 'confirmed', label: 'Order Confirmed', desc: 'Order received and verified' },
    { key: 'processing', label: 'Processing', desc: 'Packing & preparing for dispatch' },
    { key: 'shipped', label: 'In Transit', desc: 'Package with delivery carrier' },
    { key: 'delivered', label: 'Delivered', desc: 'Delivered to recipient address' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === order.status?.toLowerCase());

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 print:hidden" aria-label="Breadcrumb">
        <Link
          to="/orders"
          className="text-slate-600 hover:text-blue-600 transition-colors no-underline font-semibold"
        >
          {isAdmin ? 'Order Management' : 'My Orders'}
        </Link>
        <span>/</span>
        <span className="font-mono text-slate-900 font-bold">{order.orderNumber}</span>
      </nav>

      {/* Hero Banner: New Order Celebration vs Order Overview */}
      {isNewOrder ? (
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden space-y-3 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Order Confirmed!</h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            Thank you for your purchase. We have received your order and our fulfillment team has begun processing it.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Order Reference</span>
              <span className="font-mono text-lg sm:text-xl font-black text-slate-900">{order.orderNumber}</span>
              <button
                type="button"
                onClick={handleCopyOrderNumber}
                className="text-slate-500 hover:text-slate-800 p-1 rounded-md hover:bg-slate-100 cursor-pointer text-xs font-semibold inline-flex items-center gap-1"
                title="Copy Order Number"
              >
                {copied ? (
                  <span className="text-emerald-600">✓ Copied</span>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">Placed on {orderDate}</p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                order.status === 'delivered'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : order.status === 'shipped'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : order.status === 'processing'
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : order.status === 'cancelled'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  order.status === 'delivered'
                    ? 'bg-emerald-500'
                    : order.status === 'shipped'
                    ? 'bg-blue-500'
                    : order.status === 'processing'
                    ? 'bg-purple-500'
                    : order.status === 'cancelled'
                    ? 'bg-rose-500'
                    : 'bg-amber-500'
                }`}
              />
              {order.status || 'confirmed'}
            </span>

            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 capitalize">
              Payment: {order.paymentStatus || 'Pending'} ({order.paymentMethod === 'cash_on_delivery' ? 'COD' : order.paymentMethod})
            </span>
          </div>
        </div>
      )}

      {/* Admin Status Management Box (Admin Only) */}
      {isAdmin && (
        <div className="bg-white border-2 border-purple-200 rounded-3xl p-6 shadow-xs space-y-4 print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-purple-600">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <h2 className="text-sm font-bold text-slate-900">Admin Fulfillment Control Panel</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Update customer order status. Inventory and notifications update automatically.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Set Status:</span>
              <select
                value={order.status || 'confirmed'}
                onChange={(e) => handleAdminStatusChange(e.target.value)}
                disabled={isUpdatingStatus || isCancelled || isDelivered}
                className={`text-xs font-semibold px-3 py-2 rounded-xl border bg-white text-slate-800 cursor-pointer focus:ring-2 focus:ring-purple-500 ${
                  isCancelled || isDelivered ? 'opacity-50 cursor-not-allowed border-slate-200' : 'border-purple-300 hover:border-purple-400'
                }`}
                aria-label="Admin status selector"
              >
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {statusFeedback && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{statusFeedback}</span>
            </div>
          )}

          {statusError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{statusError}</span>
            </div>
          )}
        </div>
      )}

      {/* Progress Timeline Stepper */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
          Fulfillment Timeline
        </h2>

        {isCancelled ? (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 text-rose-600 mt-0.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <div>
              <strong className="block font-bold">This order has been cancelled</strong>
              <span className="text-xs text-rose-700">
                Item inventory has been released and returned to the store catalog. No further delivery actions will occur.
              </span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-2 relative">
            {steps.map((step, idx) => {
              const isCompleted = currentStepIndex >= idx;
              const isCurrent = currentStepIndex === idx;

              return (
                <div key={step.key} className="flex sm:flex-col items-start gap-3 sm:gap-2 relative">
                  {/* Step Icon / Circle */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                      isCompleted
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {isCompleted ? '✓' : idx + 1}
                  </div>

                  <div>
                    <span
                      className={`block text-xs font-bold ${
                        isCurrent ? 'text-blue-600' : isCompleted ? 'text-slate-900' : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </span>
                    <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                      {step.desc}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Items & Financial Summary) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items Table */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
              Ordered Items ({items.reduce((sum, i) => sum + (i.quantity || 1), 0)})
            </h2>

            <div className="divide-y divide-slate-100">
              {items.map((item, idx) => {
                const img =
                  item.image ||
                  (item.product?.images && item.product.images[0]) ||
                  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';
                const unitPrice = Number(item.price || 0);
                const qty = Number(item.quantity || 1);
                const subtotal = item.subtotal != null ? Number(item.subtotal) : unitPrice * qty;

                return (
                  <div key={item._id || idx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={img}
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';
                        }}
                      />
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm block truncate" title={item.name}>
                          {item.name}
                        </span>
                        <span className="text-slate-500 text-xs block mt-0.5">
                          ${unitPrice.toFixed(2)} &times; {qty}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">
                        ${subtotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
              Financial Breakdown
            </h2>

            <div className="space-y-2 text-xs sm:text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-slate-900">${Number(order.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee:</span>
                <span className="font-semibold text-slate-900">
                  {Number(order.shippingFee || 0) === 0 ? (
                    <span className="text-emerald-600 font-bold">Free</span>
                  ) : (
                    `$${Number(order.shippingFee || 0).toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax:</span>
                <span className="font-semibold text-slate-900">${Number(order.tax || 0).toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-base sm:text-lg font-black text-slate-900">
                <span>Total Amount:</span>
                <span className="text-blue-600 font-mono">${Number(order.total || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Customer & Delivery Information) */}
        <div className="space-y-6">
          {/* Customer / Recipient Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Customer &amp; Recipient
            </h2>

            <div className="space-y-2 text-xs sm:text-sm">
              <div>
                <span className="block text-[11px] text-slate-400 uppercase font-semibold">Recipient Name</span>
                <span className="font-bold text-slate-900">
                  {shippingAddress.name || order.user?.name || 'Customer'}
                </span>
              </div>

              {order.user?.email && (
                <div>
                  <span className="block text-[11px] text-slate-400 uppercase font-semibold">Account Email</span>
                  <span className="text-slate-700">{order.user.email}</span>
                </div>
              )}

              {shippingAddress.phone && (
                <div>
                  <span className="block text-[11px] text-slate-400 uppercase font-semibold">Contact Phone</span>
                  <span className="text-slate-700">{shippingAddress.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Address Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Delivery Address
            </h2>

            <div className="text-xs sm:text-sm text-slate-700 space-y-1">
              <p className="font-medium text-slate-900">{shippingAddress.line1 || 'No street address provided'}</p>
              {shippingAddress.line2 && <p>{shippingAddress.line2}</p>}
              <p>
                {shippingAddress.city && `${shippingAddress.city}, `}
                {shippingAddress.state && `${shippingAddress.state} `}
                {shippingAddress.postalCode}
              </p>
              <p className="text-slate-500">{shippingAddress.country || 'United States'}</p>
            </div>

            {order.notes && (
              <div className="mt-3 pt-3 border-t border-slate-100 text-xs">
                <span className="block font-semibold text-slate-900">Delivery Instructions:</span>
                <p className="text-slate-600 mt-1 italic">"{order.notes}"</p>
              </div>
            )}
          </div>

          {/* Payment Method Details */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Payment Information
            </h2>

            <div className="space-y-1.5 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Method:</span>
                <span className="font-bold text-slate-900 capitalize">
                  {order.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : order.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Status:</span>
                <span className="font-bold text-slate-900 capitalize">{order.paymentStatus || 'Pending'}</span>
              </div>
            </div>
          </div>

          {/* Action Tools */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 print:hidden">
            <button
              type="button"
              onClick={handlePrint}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              <span>Print Order Receipt</span>
            </button>

            <Link
              to="/orders"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 no-underline transition-colors"
            >
              <span>&larr; Back to {isAdmin ? 'Order Management' : 'My Orders'}</span>
            </Link>

            {!isAdmin && (
              <Link
                to="/products"
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs flex items-center justify-center gap-2 no-underline transition-colors"
              >
                <span>Continue Shopping &rarr;</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
