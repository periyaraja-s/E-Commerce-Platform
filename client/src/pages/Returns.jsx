import React from 'react';
import { Link } from 'react-router-dom';
import PublicHeader from '../components/PublicHeader.jsx';
import PublicFooter from '../components/PublicFooter.jsx';

export default function Returns() {
  return (
    <div className="landing-page-root" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicHeader />

      <main style={{ flex: 1, backgroundColor: 'var(--bg-app)', padding: '48px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          {/* Breadcrumb */}
          <nav style={{ marginBottom: 24, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            <Link to="/" style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>Home</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span>Returns &amp; Refunds</span>
          </nav>

          {/* Header */}
          <div style={{ marginBottom: 40, borderBottom: '1px solid var(--border-color)', paddingBottom: 28 }}>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 12 }}>
              Return &amp; Refund Policy
            </h1>
            <p style={{ fontSize: '1.12rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              We want you to be completely satisfied with your purchase. Enjoy our transparent, customer-first 30-day return policy.
            </p>
          </div>

          {/* Steps highlight */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
            <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: 10, border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-color)', marginBottom: 6 }}>30 Days</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Standard Window</div>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                Request a return within 30 days of shipment delivery date.
              </p>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: 10, border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981', marginBottom: 6 }}>100%</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Full Product Refund</div>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                Full refund issued back to your original payment method.
              </p>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: 10, border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#7c3aed', marginBottom: 6 }}>3-5 Days</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Inspection &amp; Payout</div>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                Prompt warehouse inspection upon receiving return merchandise.
              </p>
            </div>
          </div>

          {/* Policy Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
            <section style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 12, border: '1px solid var(--border-color)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                1. Eligibility for Returns
              </h2>
              <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>Items must be received back in their original condition and packaging, including all accessories, manuals, and tags.</li>
                <li>Items must show no signs of user-inflicted wear, cosmetic damage, or alteration.</li>
                <li>Proof of purchase (Order ID or receipt) must accompany the return.</li>
              </ul>
            </section>

            <section style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 12, border: '1px solid var(--border-color)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                2. How to Initiate a Return
              </h2>
              <ol style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>
                  Visit your{' '}
                  <Link to="/orders" style={{ color: 'var(--accent-color)', fontWeight: 600 }}>
                    Order History
                  </Link>{' '}
                  page and locate the order containing the items you wish to return.
                </li>
                <li>Contact our support team with your order ID and the reason for your return.</li>
                <li>Print the prepaid return shipping label provided by our support team and affix it securely to the parcel.</li>
                <li>Drop off the package at any authorized parcel courier collection point.</li>
              </ol>
            </section>

            <section style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 12, border: '1px solid var(--border-color)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                3. Damaged, Defective or Incorrect Items
              </h2>
              <p>
                If you receive an item that is defective, damaged during transit, or different from what you ordered, please notify us within 48 hours of delivery. We will immediately arrange a priority replacement or full refund at no additional shipping cost to you.
              </p>
            </section>

            <section style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 12, border: '1px solid var(--border-color)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                4. Questions &amp; Support
              </h2>
              <p style={{ marginBottom: 16 }}>
                Have questions about an existing return or need assistance with your order? Our support team is ready to assist you.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link to="/products" className="btn-card-action btn-card-primary" style={{ padding: '10px 20px', textDecoration: 'none' }}>
                  Return to Storefront
                </Link>
                <Link to="/terms" className="btn-card-action" style={{ padding: '10px 20px', textDecoration: 'none' }}>
                  Read Terms of Service
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
