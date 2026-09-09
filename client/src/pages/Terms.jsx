import React from 'react';
import { Link } from 'react-router-dom';
import PublicHeader from '../components/PublicHeader.jsx';
import PublicFooter from '../components/PublicFooter.jsx';

export default function Terms() {
  return (
    <div className="landing-page-root" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicHeader />

      <main style={{ flex: 1, backgroundColor: 'var(--bg-app)', padding: '48px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          {/* Breadcrumb */}
          <nav style={{ marginBottom: 24, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            <Link to="/" style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>Home</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span>Terms of Service</span>
          </nav>

          {/* Header */}
          <div style={{ marginBottom: 40, borderBottom: '1px solid var(--border-color)', paddingBottom: 28 }}>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 12 }}>
              Terms of Service
            </h1>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Last revised: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. Please read these terms carefully before accessing or using our platform.
            </p>
          </div>

          {/* Terms content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
            <section style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 12, border: '1px solid var(--border-color)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                1. Acceptance of Terms
              </h2>
              <p>
                By creating an account, browsing our online storefront, or purchasing products through E-Commerce Platform (&quot;the Service&quot;), you acknowledge and agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must refrain from using the platform.
              </p>
            </section>

            <section style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 12, border: '1px solid var(--border-color)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                2. User Accounts &amp; Security
              </h2>
              <p style={{ marginBottom: 12 }}>
                When registering for an account, you must provide accurate, complete, and current information. You are solely responsible for maintaining the confidentiality of your credentials and account password.
              </p>
              <p>
                Administrative accounts are assigned strict operational roles and are restricted from consumer shopping carts and checkout flows. Any unauthorized activity under your credentials must be reported immediately to our support team.
              </p>
            </section>

            <section style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 12, border: '1px solid var(--border-color)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                3. Products, Pricing &amp; Stock Availability
              </h2>
              <p style={{ marginBottom: 12 }}>
                All prices displayed are in US Dollars ($) and exclude applicable sales taxes or shipping fees unless specified. We make every reasonable effort to display accurate product descriptions, specifications, and stock quantities.
              </p>
              <p>
                In the rare event of a pricing typo or simultaneous stock depletion, we reserve the right to cancel or adjust orders and will promptly issue a full refund to your original payment method.
              </p>
            </section>

            <section style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 12, border: '1px solid var(--border-color)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                4. Orders &amp; Payment Processing
              </h2>
              <p style={{ marginBottom: 12 }}>
                Placing an order constitutes an offer to purchase. Order confirmation emails acknowledge receipt of your order; formal acceptance occurs when items are fulfilled and dispatched.
              </p>
              <p>
                We accept major credit cards and approved digital payment channels. All payment transactions are processed securely through compliant payment gateways.
              </p>
            </section>

            <section style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 12, border: '1px solid var(--border-color)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                5. Returns &amp; Refunds
              </h2>
              <p>
                Returns and warranty claims are governed by our dedicated{' '}
                <Link to="/returns" style={{ color: 'var(--accent-color)', fontWeight: 600, textDecoration: 'underline' }}>
                  Return &amp; Refund Policy
                </Link>
                . Please review the return conditions before initiating a return request.
              </p>
            </section>

            <section style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 12, border: '1px solid var(--border-color)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                6. Limitation of Liability
              </h2>
              <p>
                To the fullest extent permitted by applicable law, E-Commerce Platform and its affiliates shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use the platform or any products purchased through it.
              </p>
            </section>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
