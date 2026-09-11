import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import api from '../services/api.js';

export default function OrderConfirmation() {
  const { id } = useParams();
  const location = useLocation();

  // Try to use order from navigation state if freshly placed
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // If order is not in state or ID changed, fetch from API
    if (!order || (order._id !== id && order.orderNumber !== id)) {
      setLoading(true);
      api
        .get(`/orders/${id}`)
        .then((res) => {
          if (res.data?.success && res.data?.data) {
            setOrder(res.data.data);
          } else {
            setError('Order details could not be found.');
          }
        })
        .catch((err) => {
          console.error('Failed to fetch order details:', err);
          setError(
            err.response?.data?.message || 'Failed to load order details. Please verify the order number.'
          );
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

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
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
        <h2 className="text-xl font-bold text-slate-900">
          Retrieving Order Confirmation...
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Fetching receipt information and item records.
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-900">Order Not Found</h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {error || "We couldn't locate the requested order in our records."}
        </p>
        <div className="flex items-center justify-center gap-3 mt-6">
          <Link
            to="/orders"
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-colors no-underline shadow-xs"
          >
            View All Orders
          </Link>
          <Link
            to="/products"
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors no-underline shadow-xs"
          >
            Browse Catalog
          </Link>
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Print-friendly Hero Banner */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-3xl p-8 sm:p-10 text-center relative overflow-hidden space-y-4 shadow-xs">
        <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Order Confirmed!</h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
          Thank you for shopping with us. We have received your order and are preparing it for shipment.
        </p>

        {/* Order Reference Number Card */}
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white border border-emerald-200 shadow-xs text-xs sm:text-sm">
          <span className="text-slate-500 font-medium">Order Reference:</span>
          <strong className="font-mono text-slate-900 font-bold tracking-wider">{order.orderNumber}</strong>
          <button
            type="button"
            className="text-slate-500 hover:text-slate-800 transition-colors p-1 rounded-md hover:bg-slate-100 cursor-pointer"
            onClick={handleCopyOrderNumber}
            title="Copy Order Reference Number"
          >
            {copied ? (
              <span className="text-emerald-600 font-semibold inline-flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Copied!
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-semibold text-slate-600">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-xs print:hidden">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            Status: {order.status?.toUpperCase()}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            Payment: {order.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery (Pending)' : order.paymentStatus?.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print Receipt
          </button>
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors no-underline shadow-xs"
          >
            View All Orders
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors no-underline shadow-xs"
          >
            Continue Shopping &rarr;
          </Link>
        </div>
      </div>

      {/* Confirmation Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Items List */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-slate-900 pb-4 border-b border-slate-100">
            Ordered Items ({items.reduce((s, i) => s + (i.quantity || 1), 0)})
          </h2>

          <div className="divide-y divide-slate-100">
            {items.map((item, idx) => {
              const unitPrice = Number(item.price) || 0;
              const qty = Number(item.quantity) || 1;
              const subtotal = item.subtotal != null ? item.subtotal : unitPrice * qty;
              const img =
                item.image ||
                (item.product?.images && item.product.images[0]) ||
                'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';

              return (
                <div key={item._id || item.product?._id || idx} className="py-4 flex items-center gap-4">
                  <img
                    src={img}
                    alt={item.name}
                    className="w-16 h-16 rounded-2xl object-cover bg-slate-100 shrink-0 border border-slate-200"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-slate-900 truncate">{item.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      ${unitPrice.toFixed(2)} each &times; {qty}
                    </div>
                  </div>
                  <div className="text-sm font-bold text-slate-900 text-right">
                    ${subtotal.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pricing Breakdown */}
          <div className="pt-4 border-t border-slate-100 space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-800">${Number(order.subtotal || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Shipping</span>
              <span className="font-semibold text-slate-800">
                {Number(order.shippingFee) === 0 ? 'FREE ($0.00)' : `$${Number(order.shippingFee).toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Tax</span>
              <span className="font-semibold text-slate-800">${Number(order.tax || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-slate-100 text-base font-extrabold text-slate-900">
              <span>Total Paid / Due</span>
              <span className="text-blue-600">${Number(order.total || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Customer & Delivery Info */}
        <div className="space-y-6">
          {/* Shipping Address Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-slate-900">Shipping Details</h3>
            </div>

            <div className="text-xs sm:text-sm space-y-1">
              <div className="font-bold text-slate-900">
                {shippingAddress.name || order.user?.name}
              </div>
              <div className="text-slate-600">
                {shippingAddress.line1}
              </div>
              {shippingAddress.line2 && (
                <div className="text-slate-600">
                  {shippingAddress.line2}
                </div>
              )}
              <div className="text-slate-600">
                {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
              </div>
              <div className="text-slate-400 text-xs">
                {shippingAddress.country || 'United States'}
              </div>

              {shippingAddress.phone && (
                <div className="mt-3 pt-3 border-t border-dashed border-slate-200 text-slate-700">
                  <strong>Phone:</strong> {shippingAddress.phone}
                </div>
              )}

              {order.notes && (
                <div className="mt-2 pt-2 border-t border-dashed border-slate-200 text-slate-500 text-xs">
                  <strong>Delivery Note:</strong> {order.notes}
                </div>
              )}
            </div>
          </div>

          {/* Order Details & Timing */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-slate-900">Order Timeline</h3>
            </div>

            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Date Placed:</span>
                <span className="font-semibold text-slate-900">{orderDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Est. Delivery:</span>
                <span className="font-semibold text-emerald-600">2–3 Business Days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fulfillment:</span>
                <span className="font-semibold text-slate-800">Standard Ground</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Method:</span>
                <span className="font-semibold text-slate-800">Cash / Pay on Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
