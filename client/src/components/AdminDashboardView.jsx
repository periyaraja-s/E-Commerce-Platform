import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';

export default function AdminDashboardView({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMetrics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/dashboard/admin');
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Access Denied: Admin authorization is required to view administrative metrics.');
      } else {
        setError(err.response?.data?.message || 'Unable to load administrative metrics');
      }
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
        hour: '2-digit',
        minute: '2-digit',
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
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Store Administration</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Administrator Role
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Welcome, {user?.name || 'Admin'} ({user?.email}). Real-time store performance, inventory, and orders overview.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold shadow-xs transition-colors no-underline"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            <span>Manage Products</span>
          </Link>
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 text-xs font-semibold shadow-xs transition-colors no-underline"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span>View All Orders</span>
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

      {/* Admin Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Total Products */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex items-start gap-4 transition-all hover:border-slate-300">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <span className="block text-xs font-semibold text-slate-500">Total Products</span>
            <span className="block text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight my-0.5">
              {loading ? '—' : data?.totalProducts ?? 0}
            </span>
            <Link to="/products" className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors no-underline">
              Manage Catalog &rarr;
            </Link>
          </div>
        </div>

        {/* Total Categories */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex items-start gap-4 transition-all hover:border-slate-300">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <span className="block text-xs font-semibold text-slate-500">Total Categories</span>
            <span className="block text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight my-0.5">
              {loading ? '—' : data?.totalCategories ?? 0}
            </span>
            <span className="block text-xs text-slate-400">Active taxonomies</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex items-start gap-4 transition-all hover:border-slate-300">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <span className="block text-xs font-semibold text-slate-500">Total Orders</span>
            <span className="block text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight my-0.5">
              {loading ? '—' : data?.totalOrders ?? 0}
            </span>
            <span className="block text-xs text-slate-400">Storewide all-time</span>
          </div>
        </div>

        {/* Today's Orders */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex items-start gap-4 transition-all hover:border-slate-300">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <span className="block text-xs font-semibold text-slate-500">Today&apos;s Orders</span>
            <span className="block text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight my-0.5">
              {loading ? '—' : data?.todayOrders ?? 0}
            </span>
            <span className="block text-xs text-slate-400">Placed since 00:00 UTC</span>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex items-start gap-4 transition-all hover:border-slate-300">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <span className="block text-xs font-semibold text-slate-500">Total Customers</span>
            <span className="block text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight my-0.5">
              {loading ? '—' : data?.totalCustomers ?? 0}
            </span>
            <span className="block text-xs text-slate-400">Verified customer accounts</span>
          </div>
        </div>

        {/* Today's Revenue */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex items-start gap-4 transition-all hover:border-slate-300">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <span className="block text-xs font-semibold text-slate-500">Today&apos;s Revenue</span>
            <span className="block text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight my-0.5">
              ${loading ? '—' : (data?.todayRevenue ?? 0).toFixed(2)}
            </span>
            <span className="block text-xs text-slate-400">
              All-time: ${(data?.totalRevenue ?? 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Storewide Recent Orders Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Store Orders</h2>
            <p className="text-xs text-slate-500 mt-0.5">Real-time order stream from customer checkouts</p>
          </div>
          <Link
            to="/orders"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors no-underline"
          >
            Manage All Orders &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs sm:text-sm">
            Loading storewide orders...
          </div>
        ) : !data?.recentOrders || data.recentOrders.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-slate-800">No store orders recorded yet</h3>
            <p className="text-xs text-slate-500 mt-1">Customer checkout orders will automatically stream here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 sm:-mx-8 px-6 sm:px-8 mt-4">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-3 pr-4">Order #</th>
                  <th className="pb-3 px-4">Customer</th>
                  <th className="pb-3 px-4">Date & Time</th>
                  <th className="pb-3 px-4">Items</th>
                  <th className="pb-3 px-4">Total</th>
                  <th className="pb-3 px-4">Payment</th>
                  <th className="pb-3 pl-4">Fulfillment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recentOrders.map((order) => {
                  const firstItem = order.items?.[0]?.name || 'Catalog Item';
                  const extraItems = (order.itemsCount || order.items?.length || 1) - 1;
                  const itemSummary = extraItems > 0 ? `${firstItem} (+${extraItems} more)` : firstItem;

                  return (
                    <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 pr-4 font-semibold text-blue-600">
                        {order.orderNumber || `ORD-${order._id.slice(-6).toUpperCase()}`}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-900">{order.customerName}</div>
                        <div className="text-[11px] text-slate-400">{order.customerEmail}</div>
                      </td>
                      <td className="py-4 px-4 text-slate-500 text-xs">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="py-4 px-4 max-w-[200px] truncate text-slate-700">
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

      {/* Role-Based Access Controls Notice */}
      <div className="rounded-3xl border border-purple-200 bg-purple-50/60 p-6 flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-bold text-purple-950">
            Administrative Privileges Active
          </h3>
          <p className="text-xs sm:text-sm text-purple-800 mt-1 leading-relaxed">
            You are signed in as a system administrator. You have full authorization to create, edit, and delete products, manage product categories, review storewide transactions, and view sales performance metrics.
          </p>
        </div>
      </div>
    </div>
  );
}
