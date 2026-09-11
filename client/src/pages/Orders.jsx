import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';

export default function Orders() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

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
      console.error('Failed to load orders:', err);
      setError(err.response?.data?.message || 'Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      if (res.data?.success && res.data?.data) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === 'all') return true;
    return order.status?.toLowerCase() === statusFilter.toLowerCase();
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isAdmin ? 'Store Orders' : 'My Orders'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isAdmin
              ? 'Review, track, and update all customer retail orders and delivery statuses.'
              : 'Track past purchases, shipping addresses, delivery statuses, and print receipts.'}
          </p>
        </div>

        <button
          type="button"
          onClick={fetchOrders}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          disabled={loading}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={loading ? 'animate-spin' : ''}>
            <path d="M23 4v6h-6" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Refresh Orders
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none">
        {['all', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((tab) => (
          <button
            key={tab}
            type="button"
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer capitalize ${
              statusFilter === tab
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
            onClick={() => setStatusFilter(tab)}
          >
            {tab}
            {tab === 'all' && <span className="ml-1.5 opacity-70">({orders.length})</span>}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-16">
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
          <p className="text-sm text-slate-500 font-medium">Loading orders...</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-medium">
          <p>{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredOrders.length === 0 && (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 shadow-xs max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            {statusFilter === 'all' ? 'No Orders Found' : `No ${statusFilter} Orders`}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {statusFilter === 'all'
              ? isAdmin
                ? 'No customer orders have been placed yet.'
                : "You haven't placed any orders yet. Discover our quality catalog and place your first order today!"
              : `There are currently no orders in "${statusFilter}" status.`}
          </p>
          {!isAdmin && (
            <div className="mt-5">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors no-underline"
              >
                Start Shopping &rarr;
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Orders List */}
      {!loading && filteredOrders.length > 0 && (
        <div className="space-y-5">
          {filteredOrders.map((order) => {
            const itemsCount = (order.items || []).reduce((s, i) => s + (i.quantity || 1), 0);
            const dateStr = new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

            return (
              <div key={order._id || order.orderNumber} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs hover:border-slate-300 transition-all space-y-5">
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold">
                      <span className="text-slate-500">Order #</span>
                      <strong>{order.orderNumber}</strong>
                    </div>
                    <span className="text-xs text-slate-500">{dateStr}</span>
                    {isAdmin && order.user && (
                      <span className="text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                        Customer: <strong className="text-slate-900">{order.user.name || order.user.email}</strong>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Status Pill */}
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        order.status === 'delivered'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : order.status === 'shipped'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : order.status === 'cancelled'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : order.status === 'processing'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {order.status || 'confirmed'}
                    </span>

                    {/* Admin status switcher */}
                    {isAdmin && (
                      <select
                        value={order.status || 'confirmed'}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        disabled={updatingId === order._id}
                        className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        aria-label="Update Order Status"
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    )}
                  </div>
                </div>

                {/* Items Summary & Images Preview */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center -space-x-2 overflow-hidden">
                      {(order.items || []).slice(0, 4).map((item, idx) => {
                        const img =
                          item.image ||
                          (item.product?.images && item.product.images[0]) ||
                          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';
                        return (
                          <div
                            key={item._id || idx}
                            className="relative w-12 h-12 rounded-xl bg-slate-100 border-2 border-white overflow-hidden shadow-2xs shrink-0"
                            title={`${item.name} (${item.quantity}x)`}
                          >
                            <img src={img} alt={item.name} className="w-full h-full object-cover" />
                            {item.quantity > 1 && (
                              <span className="absolute bottom-0 right-0 bg-slate-900/80 text-white text-[9px] font-bold px-1 rounded-tl">
                                {item.quantity}
                              </span>
                            )}
                          </div>
                        );
                      })}
                      {(order.items || []).length > 4 && (
                        <div className="relative w-12 h-12 rounded-xl bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                          +{(order.items || []).length - 4}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-slate-900">
                        {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                      </div>
                      <div className="text-xs text-slate-500 max-w-md truncate">
                        {(order.items || []).map((i) => i.name).join(', ')}
                      </div>
                    </div>
                  </div>

                  {/* Delivery summary */}
                  {order.shippingAddress && (
                    <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-2">
                      <span className="font-semibold text-slate-700">Deliver to:</span>
                      <span>
                        {order.shippingAddress.name}, {order.shippingAddress.city}, {order.shippingAddress.state}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Footer with total and link to receipt */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-semibold text-slate-500">Total Amount:</span>
                    <span className="text-base sm:text-lg font-extrabold text-slate-900">
                      ${Number(order.total || 0).toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full capitalize">
                      {order.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : order.paymentMethod}
                    </span>
                  </div>

                  <Link
                    to={`/order-confirmation/${order._id || order.orderNumber}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors no-underline shadow-xs self-start sm:self-auto"
                  >
                    View Receipt &amp; Details &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
