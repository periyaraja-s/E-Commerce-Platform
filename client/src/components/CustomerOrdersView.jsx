import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';

export default function CustomerOrdersView() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter State
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMyOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/orders');
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setOrders(res.data.data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Failed to load my orders:', err);
      setError(err.response?.data?.message || 'Unable to retrieve your order history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const metrics = useMemo(() => {
    const total = orders.length;
    const confirmed = orders.filter((o) => o.status === 'confirmed').length;
    const processing = orders.filter((o) => o.status === 'processing').length;
    const shipped = orders.filter((o) => o.status === 'shipped').length;
    const delivered = orders.filter((o) => o.status === 'delivered').length;
    const cancelled = orders.filter((o) => o.status === 'cancelled').length;
    return { total, confirmed, processing, shipped, delivered, cancelled };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== 'all' && order.status?.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        const orderNum = order.orderNumber?.toLowerCase() || '';
        const itemNames = (order.items || []).map((i) => i.name?.toLowerCase() || '').join(' ');
        return orderNum.includes(q) || itemNames.includes(q);
      }
      return true;
    });
  }, [orders, statusFilter, searchTerm]);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return {
          label: 'Delivered',
          classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
        };
      case 'shipped':
        return {
          label: 'Shipped (In Transit)',
          classes: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500',
        };
      case 'processing':
        return {
          label: 'Processing & Packing',
          classes: 'bg-purple-50 text-purple-700 border-purple-200',
          dot: 'bg-purple-500',
        };
      case 'confirmed':
        return {
          label: 'Order Confirmed',
          classes: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          classes: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
        };
      default:
        return {
          label: status || 'Pending',
          classes: 'bg-slate-50 text-slate-700 border-slate-200',
          dot: 'bg-slate-500',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Orders
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Check the status of current shipments, inspect order details, and review your past purchases.
          </p>
        </div>

        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors no-underline shrink-0"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <span>Browse Products</span>
        </Link>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-medium">
          {error}
        </div>
      )}

      {/* Filter and Search controls */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { key: 'all', label: 'All Orders', count: metrics.total },
              { key: 'confirmed', label: 'Confirmed', count: metrics.confirmed },
              { key: 'processing', label: 'Processing', count: metrics.processing },
              { key: 'shipped', label: 'Shipped', count: metrics.shipped },
              { key: 'delivered', label: 'Delivered', count: metrics.delivered },
              { key: 'cancelled', label: 'Cancelled', count: metrics.cancelled },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === tab.key
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    statusFilter === tab.key ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64 shrink-0">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by order # or product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-7 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs placeholder-slate-400 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                &times;
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <svg
            className="animate-spin text-blue-600 mx-auto mb-3"
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
          </svg>
          <p className="text-sm text-slate-600 font-medium">Fetching your orders...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredOrders.length === 0 && (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 shadow-xs max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            {searchTerm || statusFilter !== 'all' ? 'No matching orders found' : 'You haven’t placed any orders yet'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xs mx-auto">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search criteria or resetting filters to see your orders.'
              : 'Explore our catalog and find the products you love. Your purchases will appear here.'}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            {searchTerm || statusFilter !== 'all' ? (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Reset Filters
              </button>
            ) : (
              <Link
                to="/products"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold no-underline shadow-xs"
              >
                Start Shopping &rarr;
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Orders List / Cards View */}
      {!loading && filteredOrders.length > 0 && (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const badge = getStatusBadge(order.status);
            const dateStr = new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const totalItems = (order.items || []).reduce((acc, i) => acc + (i.quantity || 1), 0);

            return (
              <div
                key={order._id || order.orderNumber}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow"
              >
                {/* Order Card Top Bar */}
                <div className="p-4 sm:p-5 bg-slate-50/60 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div>
                      <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Order Number
                      </span>
                      <span className="font-mono text-xs sm:text-sm font-bold text-slate-900">
                        {order.orderNumber}
                      </span>
                    </div>

                    <div className="hidden sm:block border-l border-slate-200 h-7" />

                    <div>
                      <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Date Placed
                      </span>
                      <span className="text-xs sm:text-sm font-medium text-slate-700">
                        {dateStr}
                      </span>
                    </div>

                    <div className="hidden sm:block border-l border-slate-200 h-7" />

                    <div>
                      <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Total Amount
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        ${Number(order.total || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border capitalize ${badge.classes}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      {badge.label}
                    </span>
                  </div>
                </div>

                {/* Ordered Items List */}
                <div className="p-4 sm:p-6 divide-y divide-slate-100">
                  {(order.items || []).map((item, index) => {
                    const imageUrl =
                      item.image ||
                      (item.product?.images && item.product.images[0]) ||
                      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';

                    const itemSubtotal = Number(item.subtotal || item.price * item.quantity).toFixed(2);

                    return (
                      <div key={item._id || index} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <img
                            src={imageUrl}
                            alt={item.name}
                            className="w-14 h-14 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';
                            }}
                          />
                          <div className="min-w-0">
                            <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate" title={item.name}>
                              {item.name}
                            </h3>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Qty: <strong>{item.quantity}</strong> &times; ${Number(item.price).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="block text-xs sm:text-sm font-bold text-slate-900">
                            ${itemSubtotal}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Order Card Footer */}
                <div className="p-4 sm:p-5 bg-slate-50/40 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    <span>
                      Shipping to: <strong className="text-slate-700">{order.shippingAddress?.name || 'Customer'}</strong> ({order.shippingAddress?.city}, {order.shippingAddress?.state})
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      to={`/orders/${order._id || order.orderNumber}`}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold no-underline shadow-2xs transition-colors"
                    >
                      <span>View Order Details & Receipt</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14" />
                        <path d="M12 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
