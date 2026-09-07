import React from 'react';

export default function Orders() {
  return (
    <div>
      <div className="page-header-block">
        <h1 className="page-title">Orders</h1>
        <p className="page-subtitle">Track and view your order history.</p>
      </div>

      <div className="placeholder-empty-state">
        <div className="empty-state-icon-box">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        </div>
        <h2 className="empty-state-title">No Orders Placed Yet</h2>
        <p className="empty-state-desc">
          When you place an order, receipt details, payment confirmations, and delivery status updates will appear here.
        </p>
      </div>
    </div>
  );
}
