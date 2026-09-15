import React from 'react';
import { Link } from 'react-router-dom';
import PublicHeader from '../components/PublicHeader.jsx';
import PublicFooter from '../components/PublicFooter.jsx';

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicHeader />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="mb-6 text-xs sm:text-sm text-slate-500 flex items-center gap-2">
          <Link to="/" className="text-blue-600 hover:text-blue-700 transition-colors no-underline">Home</Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800 font-medium">Terms of Service</span>
        </nav>

        {/* Header */}
        <div className="mb-10 pb-8 border-b border-slate-200">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Terms of Service
          </h1>
          <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-2xl">
            Last revised: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. Please read these terms carefully before accessing or using our platform.
          </p>
        </div>

        {/* Terms content */}
        <div className="space-y-6 text-slate-600 leading-relaxed text-sm">
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3">
              1. Acceptance of Terms
            </h2>
            <p>
              By creating an account, browsing our online storefront, or purchasing products through E-Commerce Platform (&quot;the Service&quot;), you acknowledge and agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must refrain from using the platform.
            </p>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3">
              2. User Accounts &amp; Security
            </h2>
            <p className="mb-3">
              When registering for an account, you must provide accurate, complete, and current information. You are solely responsible for maintaining the confidentiality of your credentials and account password.
            </p>
            <p>
              Administrative accounts are assigned strict operational roles and are restricted from consumer shopping carts and checkout flows. Any unauthorized activity under your credentials must be reported immediately to our support team.
            </p>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3">
              3. Products, Pricing &amp; Stock Availability
            </h2>
            <p className="mb-3">
              All prices displayed are in US Dollars ($) and exclude applicable sales taxes or shipping fees unless specified. We make every reasonable effort to display accurate product descriptions, specifications, and stock quantities.
            </p>
            <p>
              In the rare event of a pricing typo or simultaneous stock depletion, we reserve the right to cancel or adjust orders and will promptly issue a full refund to your original payment method.
            </p>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3">
              4. Orders &amp; Payment Processing
            </h2>
            <p className="mb-3">
              Placing an order constitutes an offer to purchase. Order confirmation emails acknowledge receipt of your order; formal acceptance occurs when items are fulfilled and dispatched.
            </p>
            <p>
              We accept major credit cards and approved digital payment channels. All payment transactions are processed securely through compliant payment gateways.
            </p>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3">
              5. Returns &amp; Refunds
            </h2>
            <p>
              Returns and warranty claims are governed by our dedicated{' '}
              <Link to="/returns" className="text-blue-600 font-semibold hover:underline">
                Return &amp; Refund Policy
              </Link>
              . Please review the return conditions before initiating a return request.
            </p>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3">
              6. Limitation of Liability
            </h2>
            <p>
              To the fullest extent permitted by applicable law, E-Commerce Platform and its affiliates shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use the platform or any products purchased through it.
            </p>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
