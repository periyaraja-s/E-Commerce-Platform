import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api.js';

export default function AdminOrderManagement() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successNotice, setSuccessNotice] = useState(null);

  // Filters & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Updating status tracker for inline selects
  const [updatingId, setUpdatingId] = useState(null);
  const [updateError, setUpdateError] = useState(null);

  // Quick view drawer/modal state for fast inspection
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
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
      console.error('Failed to load orders for admin:', err);
      setError(err.response?.data?.message || 'Failed to load store orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    setUpdateError(null);
    setSuccessNotice(null);

    try {
      const res = await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      if (res.data?.success && res.data?.data) {
        const updated = res.data.data;
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: updated.status, paymentStatus: updated.paymentStatus } : o))
        );
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder((prev) => ({ ...prev, status: updated.status, paymentStatus: updated.paymentStatus }));
        }
        setSuccessNotice(`Order #${updated.orderNumber} status changed to "${updated.status.toUpperCase()}".`);
        setTimeout(() => setSuccessNotice(null), 4000);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      const msg = err.response?.data?.message || 'Server error: Failed to update order status.';
      setUpdateError(msg);
      setTimeout(() => setUpdateError(null), 5000);
    } finally {
      setUpdatingId(null);
    }
  };

  // Status Metrics counts
  const metrics = useMemo(() => {
    const total = orders.length;
    const confirmed = orders.filter((o) => o.status === 'confirmed').length;
    const processing = orders.filter((o) => o.status === 'processing').length;
    const shipped = orders.filter((o) => o.status === 'shipped').length;
    const delivered = orders.filter((o) => o.status === 'delivered').length;
    const cancelled = orders.filter((o) => o.status === 'cancelled').length;
    const totalRevenue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    return { total, confirmed, processing, shipped, delivered, cancelled, totalRevenue };
  }, [orders]);

  // Filtered & Sorted orders
  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        // Status filter
        if (statusFilter !== 'all' && order.status?.toLowerCase() !== statusFilter.toLowerCase()) {
          return false;
        }
        // Payment filter
        if (paymentFilter !== 'all' && order.paymentStatus?.toLowerCase() !== paymentFilter.toLowerCase()) {
          return false;
        }
        // Search term (Order Number, customer name, customer email, shipping name/city)
        if (searchTerm.trim()) {
          const q = searchTerm.trim().toLowerCase();
          const orderNum = order.orderNumber?.toLowerCase() || '';
          const customerName = order.user?.name?.toLowerCase() || '';
          const customerEmail = order.user?.email?.toLowerCase() || '';
          const shippingName = order.shippingAddress?.name?.toLowerCase() || '';
          const shippingCity = order.shippingAddress?.city?.toLowerCase() || '';
          const itemNames = (order.items || []).map((i) => i.name?.toLowerCase() || '').join(' ');

          return (
            orderNum.includes(q) ||
            customerName.includes(q) ||
            customerEmail.includes(q) ||
            shippingName.includes(q) ||
            shippingCity.includes(q) ||
            itemNames.includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        }
        if (sortBy === 'total-high') {
          return (Number(b.total) || 0) - (Number(a.total) || 0);
        }
        if (sortBy === 'total-low') {
          return (Number(a.total) || 0) - (Number(b.total) || 0);
        }
        return 0;
      });
  }, [orders, statusFilter, paymentFilter, searchTerm, sortBy]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPaymentFilter('all');
    setSortBy('newest');
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'shipped':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'processing':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'confirmed':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getPaymentBadgeClass = (paymentStatus) => {
    switch (paymentStatus?.toLowerCase()) {
      case 'paid':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'failed':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'refunded':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Order Management
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Administrator View
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search, filter, monitor customer fulfillment, and update order statuses across the store.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={fetchOrders}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            disabled={loading}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              className={loading ? 'animate-spin' : ''}
            >
              <path d="M23 4v6h-6" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Refresh Orders
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-medium flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-600 shrink-0">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{successNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessNotice(null)}
            className="text-emerald-600 hover:text-emerald-800 font-bold p-1 cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {updateError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm font-medium flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-rose-600 shrink-0">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{updateError}</span>
          </div>
          <button
            type="button"
            onClick={() => setUpdateError(null)}
            className="text-rose-600 hover:text-rose-800 font-bold p-1 cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-medium">
          {error}
        </div>
      )}

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-semibold uppercase tracking-wider opacity-70">Total Orders</div>
          <div className="text-xl sm:text-2xl font-black tracking-tight mt-1">{metrics.total}</div>
        </div>

        <div
          onClick={() => setStatusFilter('confirmed')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'confirmed'
              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-semibold uppercase tracking-wider opacity-70">Confirmed</div>
          <div className="text-xl sm:text-2xl font-black tracking-tight mt-1">{metrics.confirmed}</div>
        </div>

        <div
          onClick={() => setStatusFilter('processing')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'processing'
              ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-semibold uppercase tracking-wider opacity-70">Processing</div>
          <div className="text-xl sm:text-2xl font-black tracking-tight mt-1">{metrics.processing}</div>
        </div>

        <div
          onClick={() => setStatusFilter('shipped')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'shipped'
              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-semibold uppercase tracking-wider opacity-70">Shipped</div>
          <div className="text-xl sm:text-2xl font-black tracking-tight mt-1">{metrics.shipped}</div>
        </div>

        <div
          onClick={() => setStatusFilter('delivered')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'delivered'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-semibold uppercase tracking-wider opacity-70">Delivered</div>
          <div className="text-xl sm:text-2xl font-black tracking-tight mt-1">{metrics.delivered}</div>
        </div>

        <div
          onClick={() => setStatusFilter('cancelled')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'cancelled'
              ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-semibold uppercase tracking-wider opacity-70">Cancelled</div>
          <div className="text-xl sm:text-2xl font-black tracking-tight mt-1">{metrics.cancelled}</div>
        </div>
      </div>

      {/* Filter and Search Controls Toolbar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1 max-w-lg">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
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
              placeholder="Search by order #, customer, email, address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 text-xs sm:text-sm placeholder-slate-400 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer text-sm font-bold"
                title="Clear search"
              >
                &times;
              </button>
            )}
          </div>

          {/* Dropdown Filters */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Status select */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-semibold text-slate-700 hidden sm:inline">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">All Statuses ({orders.length})</option>
                <option value="confirmed">Confirmed ({metrics.confirmed})</option>
                <option value="processing">Processing ({metrics.processing})</option>
                <option value="shipped">Shipped ({metrics.shipped})</option>
                <option value="delivered">Delivered ({metrics.delivered})</option>
                <option value="cancelled">Cancelled ({metrics.cancelled})</option>
              </select>
            </div>

            {/* Payment filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-semibold text-slate-700 hidden sm:inline">Payment:</span>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">All Payments</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-semibold text-slate-700 hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="total-high">Total: High to Low</option>
                <option value="total-low">Total: Low to High</option>
              </select>
            </div>

            {(searchTerm || statusFilter !== 'all' || paymentFilter !== 'all' || sortBy !== 'newest') && (
              <button
                type="button"
                onClick={clearFilters}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Results summary counter */}
        <div className="text-xs text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
          <span>
            Showing <strong>{filteredOrders.length}</strong> of <strong>{orders.length}</strong> total orders
          </span>
          <span className="text-slate-400">
            Store volume: <strong className="text-slate-700">${metrics.totalRevenue.toFixed(2)}</strong>
          </span>
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
          <p className="text-sm text-slate-600 font-medium">Loading store orders and records...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredOrders.length === 0 && (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 shadow-xs max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <h2 className="text-base font-bold text-slate-900">No Orders Matched</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm || statusFilter !== 'all' || paymentFilter !== 'all'
              ? 'Try modifying or resetting your search filters to view order records.'
              : 'No orders have been recorded in the database yet.'}
          </p>
          {(searchTerm || statusFilter !== 'all' || paymentFilter !== 'all') && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* Professional Admin Orders Table */}
      {!loading && filteredOrders.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-4 pl-6 pr-4">Order Reference</th>
                  <th className="py-4 px-4">Customer</th>
                  <th className="py-4 px-4">Date Placed</th>
                  <th className="py-4 px-4">Items</th>
                  <th className="py-4 px-4">Amount</th>
                  <th className="py-4 px-4">Payment</th>
                  <th className="py-4 px-4">Fulfillment Status</th>
                  <th className="py-4 pl-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => {
                  const dateStr = new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  const itemsCount = (order.items || []).reduce((s, i) => s + (i.quantity || 1), 0);
                  const firstItem = order.items?.[0]?.name || 'Product';
                  const extraCount = (order.items || []).length - 1;

                  const customerName = order.user?.name || order.shippingAddress?.name || 'Customer';
                  const customerEmail = order.user?.email || 'N/A';
                  const isUpdating = updatingId === order._id;

                  // Disabled status options based on current state
                  const isDelivered = order.status === 'delivered';
                  const isCancelled = order.status === 'cancelled';

                  return (
                    <tr
                      key={order._id || order.orderNumber}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Order Number */}
                      <td className="py-4 pl-6 pr-4">
                        <Link
                          to={`/orders/${order._id || order.orderNumber}`}
                          className="font-mono text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline block truncate max-w-[170px]"
                          title={order.orderNumber}
                        >
                          {order.orderNumber}
                        </Link>
                        <span className="text-[11px] text-slate-400 capitalize block mt-0.5">
                          {order.paymentMethod === 'cash_on_delivery' ? 'COD' : order.paymentMethod}
                        </span>
                      </td>

                      {/* Customer Info */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-900 truncate max-w-[160px]" title={customerName}>
                          {customerName}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[160px]" title={customerEmail}>
                          {customerEmail}
                        </div>
                        {order.shippingAddress?.city && (
                          <div className="text-[10px] text-slate-400 truncate mt-0.5">
                            📍 {order.shippingAddress.city}, {order.shippingAddress.state}
                          </div>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-xs text-slate-600 whitespace-nowrap">
                        {dateStr}
                      </td>

                      {/* Items */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {/* Thumbnail preview */}
                          <div className="flex items-center -space-x-2 shrink-0">
                            {(order.items || []).slice(0, 2).map((item, idx) => (
                              <img
                                key={item._id || idx}
                                src={
                                  item.image ||
                                  (item.product?.images && item.product.images[0]) ||
                                  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'
                                }
                                alt={item.name}
                                className="w-8 h-8 rounded-lg object-cover border-2 border-white bg-slate-100 shadow-2xs"
                                onError={(e) => {
                                  e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';
                                }}
                              />
                            ))}
                          </div>
                          <div className="min-w-0">
                            <span className="block font-medium text-slate-800 truncate max-w-[150px]" title={firstItem}>
                              {firstItem}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                              {extraCount > 0 && ` (+${extraCount} more)`}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-4 px-4">
                        <span className="font-extrabold text-slate-900 text-sm">
                          ${Number(order.total || 0).toFixed(2)}
                        </span>
                        {Number(order.shippingFee) === 0 && (
                          <span className="block text-[10px] text-emerald-600 font-medium">Free Delivery</span>
                        )}
                      </td>

                      {/* Payment Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${getPaymentBadgeClass(
                            order.paymentStatus
                          )}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              order.paymentStatus === 'paid'
                                ? 'bg-emerald-500'
                                : order.paymentStatus === 'failed'
                                ? 'bg-rose-500'
                                : 'bg-amber-500'
                            }`}
                          />
                          {order.paymentStatus || 'Pending'}
                        </span>
                      </td>

                      {/* Fulfillment Status & Inline Switcher */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusBadgeClass(
                              order.status
                            )}`}
                          >
                            {order.status || 'confirmed'}
                          </span>

                          {/* Quick Change Select */}
                          <div className="relative">
                            <select
                              value={order.status || 'confirmed'}
                              onChange={(e) => handleStatusChange(order._id, e.target.value)}
                              disabled={isUpdating || isCancelled || isDelivered}
                              className={`text-xs font-semibold px-2.5 py-1 rounded-lg border bg-white text-slate-700 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                                isCancelled || isDelivered
                                  ? 'opacity-50 cursor-not-allowed border-slate-200'
                                  : 'border-slate-300 hover:border-slate-400'
                              }`}
                              title={
                                isCancelled
                                  ? 'Cancelled orders cannot be modified'
                                  : isDelivered
                                  ? 'Delivered orders are final'
                                  : 'Change order status'
                              }
                              aria-label="Update order status"
                            >
                              <option value="confirmed">Confirmed</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                            {isUpdating && (
                              <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg">
                                <svg
                                  className="animate-spin text-blue-600"
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                >
                                  <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Action Links */}
                      <td className="py-4 pl-4 pr-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Quick View summary"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>
                          <Link
                            to={`/orders/${order._id || order.orderNumber}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold no-underline transition-colors shadow-2xs"
                          >
                            <span>Details</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M5 12h14" />
                              <path d="M12 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick View Drawer Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-2xl w-full shadow-xl space-y-6 animate-in fade-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quick Order Inspection</span>
                <h3 className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">
                  {selectedOrder.orderNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>

            {/* Status overview & updater */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="block text-xs text-slate-500">Current Fulfillment Status:</span>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border mt-1 ${getStatusBadgeClass(
                    selectedOrder.status
                  )}`}
                >
                  {selectedOrder.status || 'confirmed'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 font-semibold">Change to:</span>
                <select
                  value={selectedOrder.status || 'confirmed'}
                  onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                  disabled={
                    updatingId === selectedOrder._id ||
                    selectedOrder.status === 'cancelled' ||
                    selectedOrder.status === 'delivered'
                  }
                  className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Customer & Shipping summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">Customer</span>
                <div className="font-semibold text-slate-800 text-sm">{selectedOrder.user?.name || selectedOrder.shippingAddress?.name}</div>
                <div className="text-slate-500">{selectedOrder.user?.email}</div>
                {selectedOrder.shippingAddress?.phone && (
                  <div className="text-slate-600">📞 {selectedOrder.shippingAddress.phone}</div>
                )}
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">Shipping Address</span>
                <div className="text-slate-800">{selectedOrder.shippingAddress?.line1}</div>
                {selectedOrder.shippingAddress?.line2 && <div className="text-slate-600">{selectedOrder.shippingAddress.line2}</div>}
                <div className="text-slate-600">
                  {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.postalCode}
                </div>
              </div>
            </div>

            {/* Ordered items preview */}
            <div className="space-y-2">
              <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Order Items ({(selectedOrder.items || []).length})
              </span>
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 rounded-2xl border border-slate-200 p-2">
                {(selectedOrder.items || []).map((item, idx) => (
                  <div key={item._id || idx} className="py-2 px-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={
                          item.image ||
                          (item.product?.images && item.product.images[0]) ||
                          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'
                        }
                        alt={item.name}
                        className="w-8 h-8 rounded-lg object-cover bg-slate-100 shrink-0"
                      />
                      <div className="truncate">
                        <span className="font-semibold text-slate-900 block truncate">{item.name}</span>
                        <span className="text-slate-400 text-[11px]">Qty: {item.quantity} &times; ${Number(item.price).toFixed(2)}</span>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900 ml-3 shrink-0">
                      ${Number(item.subtotal || item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer totals & full view link */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div>
                <span className="text-xs text-slate-500">Order Grand Total:</span>
                <span className="block text-xl font-extrabold text-slate-900">${Number(selectedOrder.total || 0).toFixed(2)}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate(`/orders/${selectedOrder._id || selectedOrder.orderNumber}`);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Full Order Page &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
