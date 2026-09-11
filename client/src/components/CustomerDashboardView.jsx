import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';

export default function CustomerDashboardView({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMetrics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/dashboard/customer');
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const formatDate = (isoDate) => {
    if (!isoDate) return 'N/A';
    try {
      return new Date(isoDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoDate;
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back, {user?.name || 'Customer'}!</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Customer Account
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track your order deliveries, manage shopping cart, and explore catalog deals.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold shadow-xs transition-colors no-underline"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
            </svg>
            <span>Browse Products</span>
          </Link>
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 text-xs font-semibold shadow-xs transition-colors no-underline"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span>Go to Cart</span>
          </Link>
          <button
            type="button"
            onClick={fetchMetrics}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Refresh metrics"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-medium">
          {error}
        </div>
      )}

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Orders */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex items-start gap-4 transition-all hover:border-slate-300">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <span className="block text-xs font-semibold text-slate-500">Total Orders</span>
            <span className="block text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight my-0.5">
              {loading ? '—' : data?.totalOrders ?? 0}
            </span>
            <span className="block text-xs text-slate-400">Lifetime purchases</span>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex items-start gap-4 transition-all hover:border-slate-300">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <span className="block text-xs font-semibold text-slate-500">Pending Orders</span>
            <span className="block text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight my-0.5">
              {loading ? '—' : data?.pendingOrders ?? 0}
            </span>
            <span className="block text-xs text-slate-400">In fulfillment</span>
          </div>
        </div>

        {/* Completed Orders */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex items-start gap-4 transition-all hover:border-slate-300">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <span className="block text-xs font-semibold text-slate-500">Completed Orders</span>
            <span className="block text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight my-0.5">
              {loading ? '—' : data?.completedOrders ?? 0}
            </span>
            <span className="block text-xs text-slate-400">Delivered safely</span>
          </div>
        </div>

        {/* Cart Items */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex items-start gap-4 transition-all hover:border-slate-300">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <span className="block text-xs font-semibold text-slate-500">Cart Items</span>
            <span className="block text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight my-0.5">
              {loading ? '—' : data?.cartItems ?? 0}
            </span>
            <Link to="/cart" className="text-xs font-semibold text-purple-600 hover:text-purple-800 transition-colors no-underline">
              View Cart &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Orders</h2>
            <p className="text-xs text-slate-500 mt-0.5">Your most recent purchases and tracking details</p>
          </div>
          <Link
            to="/orders"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors no-underline"
          >
            All Orders &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs sm:text-sm">
            Loading your orders...
          </div>
        ) : !data?.recentOrders || data.recentOrders.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-slate-800">No orders placed yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Browse our catalog of electronics, apparel, and lifestyle items to place your first order.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold no-underline transition-colors shadow-xs"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 sm:-mx-8 px-6 sm:px-8 mt-4">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-3 pr-4">Order #</th>
                  <th className="pb-3 px-4">Date</th>
                  <th className="pb-3 px-4">Items</th>
                  <th className="pb-3 px-4">Total</th>
                  <th className="pb-3 px-4">Payment</th>
                  <th className="pb-3 pl-4">Delivery Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recentOrders.map((order) => {
                  const firstItem = order.items?.[0]?.name || 'Catalog Product';
                  const extraItems = (order.itemsCount || order.items?.length || 1) - 1;
                  const itemSummary = extraItems > 0 ? `${firstItem} (+${extraItems} more)` : firstItem;

                  return (
                    <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 pr-4 font-semibold text-blue-600">
                        {order.orderNumber || `ORD-${order._id.slice(-6).toUpperCase()}`}
                      </td>
                      <td className="py-4 px-4 text-slate-500 text-xs">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="py-4 px-4 max-w-[240px] truncate text-slate-700">
                        {itemSummary}
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-900">
                        ${typeof order.total === 'number' ? order.total.toFixed(2) : order.total}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 capitalize">
                          <span
                            className={`w-2 h-2 rounded-full ${
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
                      <td className="py-4 pl-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                            order.status === 'delivered'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : order.status === 'shipped'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : order.status === 'cancelled'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {order.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Account Info & Support Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Customer Profile
          </h3>
          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500">Name:</span>
              <span className="font-semibold text-slate-900">{user?.name}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500">Email:</span>
              <span className="font-semibold text-slate-900">{user?.email}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-500">Access Level:</span>
              <span className="font-semibold text-emerald-600 capitalize">
                {user?.role || 'Customer'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-600">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Buyer Protection Guarantee
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-4">
            Every purchase includes verified secure checkout, tracked parcel delivery, and our 30-day money-back satisfaction guarantee.
          </p>
          <Link
            to="/products"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors no-underline"
          >
            Explore featured catalog deals &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
