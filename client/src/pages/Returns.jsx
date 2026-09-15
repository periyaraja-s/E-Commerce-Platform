import React from 'react';
import { Link } from 'react-router-dom';
import PublicHeader from '../components/PublicHeader.jsx';
import PublicFooter from '../components/PublicFooter.jsx';

export default function Returns() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicHeader />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="mb-6 text-xs sm:text-sm text-slate-500 flex items-center gap-2">
          <Link to="/" className="text-blue-600 hover:text-blue-700 transition-colors no-underline">Home</Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800 font-medium">Returns &amp; Refunds</span>
        </nav>

        {/* Header */}
        <div className="mb-10 pb-8 border-b border-slate-200">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Return &amp; Refund Policy
          </h1>
          <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-2xl">
            We want you to be completely satisfied with your purchase. Enjoy our transparent, customer-first 30-day return policy.
          </p>
        </div>

        {/* Steps highlight */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <div className="text-2xl font-extrabold text-blue-600 mb-1">30 Days</div>
            <div className="font-bold text-slate-900 text-sm mb-1">Standard Window</div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Request a return within 30 days of shipment delivery date.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <div className="text-2xl font-extrabold text-emerald-600 mb-1">100%</div>
            <div className="font-bold text-slate-900 text-sm mb-1">Full Product Refund</div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Full refund issued back to your original payment method.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <div className="text-2xl font-extrabold text-purple-600 mb-1">3-5 Days</div>
            <div className="font-bold text-slate-900 text-sm mb-1">Inspection &amp; Payout</div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Prompt warehouse inspection upon receiving return merchandise.
            </p>
          </div>
        </div>

        {/* Policy Sections */}
        <div className="space-y-6 text-slate-600 leading-relaxed text-sm">
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3">
              1. Eligibility for Returns
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Items must be received back in their original condition and packaging, including all accessories, manuals, and tags.</li>
              <li>Items must show no signs of user-inflicted wear, cosmetic damage, or alteration.</li>
              <li>Proof of purchase (Order ID or receipt) must accompany the return.</li>
            </ul>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3">
              2. How to Initiate a Return
            </h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                Visit your{' '}
                <Link to="/orders" className="text-blue-600 font-semibold hover:underline">
                  Order History
                </Link>{' '}
                page and locate the order containing the items you wish to return.
              </li>
              <li>Contact our support team with your order ID and the reason for your return.</li>
              <li>Print the prepaid return shipping label provided by our support team and affix it securely to the parcel.</li>
              <li>Drop off the package at any authorized parcel courier collection point.</li>
            </ol>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3">
              3. Damaged, Defective or Incorrect Items
            </h2>
            <p>
              If you receive an item that is defective, damaged during transit, or different from what you ordered, please notify us within 48 hours of delivery. We will immediately arrange a priority replacement or full refund at no additional shipping cost to you.
            </p>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3">
              4. Questions &amp; Support
            </h2>
            <p className="mb-6">
              Have questions about an existing return or need assistance with your order? Our support team is ready to assist you.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <Link
                to="/products"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors no-underline shadow-xs"
              >
                Return to Storefront
              </Link>
              <Link
                to="/terms"
                className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors no-underline shadow-xs"
              >
                Read Terms of Service
              </Link>
            </div>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
