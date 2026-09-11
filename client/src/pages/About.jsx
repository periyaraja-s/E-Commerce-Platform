import React from 'react';
import { Link } from 'react-router-dom';
import PublicHeader from '../components/PublicHeader.jsx';
import PublicFooter from '../components/PublicFooter.jsx';

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicHeader />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="mb-6 text-xs sm:text-sm text-slate-500 flex items-center gap-2">
          <Link to="/" className="text-blue-600 hover:text-blue-700 transition-colors no-underline">Home</Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800 font-medium">About Us</span>
        </nav>

        {/* Header */}
        <div className="mb-10 pb-8 border-b border-slate-200">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            About E-Commerce Platform
          </h1>
          <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-2xl">
            Crafted for reliability, speed, and modern digital commerce. Discover our mission, core values, and engineering standards.
          </p>
        </div>

        {/* Content sections */}
        <div className="space-y-8 text-slate-700 leading-relaxed">
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">
              Our Mission
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              At E-Commerce Platform, we believe online shopping should be seamless, transparent, and built on rock-solid infrastructure. We bring together top-tier product catalog curation, accurate real-time inventory management, and instantaneous checkout processing.
            </p>
            <p className="text-sm text-slate-600">
              Whether you are browsing for the latest consumer technology, contemporary apparel, or modern home accents, our platform guarantees that what you see in stock is authentic, reserved in real time, and dispatched swiftly.
            </p>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Secure Transactions</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                End-to-end encrypted session credentials, protected payment gateways, and strict data privacy protocols.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Fast Fulfillment</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Orders are processed and verified within hours, supported by real-time inventory decrementing and shipment tracking.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Hassle-Free Returns</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Shop with complete peace of mind. Benefit from our clear 30-day return policy and straightforward refund processing.
              </p>
            </div>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">
              Our Technology Architecture
            </h2>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Powered by a performant, production-ready MERN stack with modern Vite frontend architecture, MongoDB document models, role-based JWT authentication, and atomic inventory stock controls.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <Link
                to="/products"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors no-underline shadow-xs"
              >
                Explore Our Products
              </Link>
              <Link
                to="/returns"
                className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors no-underline shadow-xs"
              >
                Review Return Policy
              </Link>
            </div>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
