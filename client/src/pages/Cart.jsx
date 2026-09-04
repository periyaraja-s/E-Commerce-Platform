import React from 'react';

export default function Cart() {
  return (
    <div>
      <div className="page-header-block">
        <h1 className="page-title">Cart</h1>
        <p className="page-subtitle">Review items in your shopping cart.</p>
      </div>

      <div className="placeholder-empty-state">
        <div className="empty-state-icon-box">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </div>
        <h2 className="empty-state-title">Your Cart is Empty</h2>
        <p className="empty-state-desc">
          Items added to your shopping cart will be displayed here with real-time totals and checkout options.
        </p>
      </div>
    </div>
  );
}
