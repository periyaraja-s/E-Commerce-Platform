import React from 'react';
import { Link } from 'react-router-dom';
import PublicHeader from '../components/PublicHeader.jsx';
import PublicFooter from '../components/PublicFooter.jsx';

export default function About() {
  return (
    <div className="landing-page-root" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicHeader />

      <main style={{ flex: 1, backgroundColor: 'var(--bg-app)', padding: '48px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          {/* Breadcrumb */}
          <nav style={{ marginBottom: 24, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            <Link to="/" style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>Home</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span>About Us</span>
          </nav>

          {/* Header */}
          <div style={{ marginBottom: 40, borderBottom: '1px solid var(--border-color)', paddingBottom: 28 }}>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 12 }}>
              About E-Commerce Platform
            </h1>
            <p style={{ fontSize: '1.12rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Crafted for reliability, speed, and modern digital commerce. Discover our mission, core values, and engineering standards.
            </p>
          </div>

          {/* Content sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32, lineHeight: 1.7, color: 'var(--text-primary)' }}>
            <section style={{ background: 'var(--bg-card)', padding: '32px', borderRadius: 12, border: '1px solid var(--border-color)' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 14, color: 'var(--text-primary)' }}>
                Our Mission
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
                At E-Commerce Platform, we believe online shopping should be seamless, transparent, and built on rock-solid infrastructure. We bring together top-tier product catalog curation, accurate real-time inventory management, and instantaneous checkout processing.
              </p>
              <p style={{ color: 'var(--text-secondary)' }}>
                Whether you are browsing for the latest consumer technology, contemporary apparel, or modern home accents, our platform guarantees that what you see in stock is authentic, reserved in real time, and dispatched swiftly.
              </p>
            </section>

            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
              <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                <div style={{ width: 44, height: 44, borderRadius: 8, background: '#eff6ff', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>Secure Transactions</h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                  End-to-end encrypted session credentials, protected payment gateways, and strict data privacy protocols.
                </p>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                <div style={{ width: 44, height: 44, borderRadius: 8, background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="1" y="3" width="15" height="13" />
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>Fast Fulfillment</h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                  Orders are processed and verified within hours, supported by real-time inventory decrementing and shipment tracking.
                </p>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                <div style={{ width: 44, height: 44, borderRadius: 8, background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <polyline points="23 4 23 10 17 10" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  </svg>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>Hassle-Free Returns</h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                  Shop with complete peace of mind. Benefit from our clear 30-day return policy and straightforward refund processing.
                </p>
              </div>
            </section>

            <section style={{ background: 'var(--bg-card)', padding: '32px', borderRadius: 12, border: '1px solid var(--border-color)' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 14, color: 'var(--text-primary)' }}>
                Our Technology Architecture
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 14 }}>
                Powered by a performant, production-ready MERN stack with modern Vite frontend architecture, MongoDB document models, role-based JWT authentication, and atomic inventory stock controls.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 18 }}>
                <Link to="/products" className="btn-card-action btn-card-primary" style={{ padding: '10px 20px', textDecoration: 'none' }}>
                  Explore Our Products
                </Link>
                <Link to="/returns" className="btn-card-action" style={{ padding: '10px 20px', textDecoration: 'none' }}>
                  Review Return Policy
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
