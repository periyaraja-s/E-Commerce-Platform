import React from 'react';

export default function Products() {
  return (
    <div>
      <div className="page-header-block">
        <h1 className="page-title">Products</h1>
        <p className="page-subtitle">Browse and explore the product catalog.</p>
      </div>

      <div className="placeholder-empty-state">
        <div className="empty-state-icon-box">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </div>
        <h2 className="empty-state-title">Products Catalog</h2>
        <p className="empty-state-desc">
          The product catalog is ready. Product listings, categories, filtering, and search will appear here.
        </p>
      </div>
    </div>
  );
}
