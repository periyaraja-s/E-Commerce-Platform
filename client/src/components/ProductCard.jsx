import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function ProductCard({ product, onQuickView }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [justAdded, setJustAdded] = useState(false);

  const isOutOfStock = Number(product.stock) <= 0;
  const isLowStock = !isOutOfStock && Number(product.stock) <= 10;
  const categoryName = product.category?.name || 'General';

  const imageUrl =
    Array.isArray(product.images) && product.images[0]
      ? product.images[0]
      : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';

  const handleAddToCart = async (e) => {
    e.stopPropagation();

    if (isOutOfStock) return;

    const res = await addToCart(product, 1);
    if (res?.success) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1800);
    }
  };

  return (
    <div className="catalog-product-card" onClick={() => onQuickView && onQuickView(product)}>
      {/* Card Image Container */}
      <div className="product-card-image-wrapper">
        <img
          src={imageUrl}
          alt={product.name}
          className="product-card-img"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';
          }}
        />

        {/* Category Badge */}
        <span className="product-card-badge-category">{categoryName}</span>

        {/* Stock Badge */}
        <span
          className={`product-card-badge-stock ${
            isOutOfStock ? 'badge-out' : isLowStock ? 'badge-low' : 'badge-in'
          }`}
        >
          {isOutOfStock ? 'Sold Out' : isLowStock ? `Only ${product.stock} Left` : 'In Stock'}
        </span>

        {/* Hover Quick View Trigger */}
        <button
          type="button"
          className="product-card-quickview-btn"
          onClick={(e) => {
            e.stopPropagation();
            if (onQuickView) onQuickView(product);
          }}
          aria-label={`Quick view ${product.name}`}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span>Quick View</span>
        </button>
      </div>

      {/* Card Details Body */}
      <div className="product-card-body">
        <div className="product-card-rating">
          <div className="stars-row">
            {'★'.repeat(5)}
          </div>
          <span className="rating-score">4.9</span>
        </div>

        <h3 className="product-card-name" title={product.name}>
          {product.name}
        </h3>

        <p className="product-card-desc">
          {product.description || 'Premium quality materials crafted for everyday excellence.'}
        </p>

        <div className="product-card-footer">
          <div className="product-card-price-col">
            <span className="product-card-price-label">Price</span>
            <span className="product-card-price-val">
              ${Number(product.price).toFixed(2)}
            </span>
          </div>

          <button
            type="button"
            className={`btn-card-add-cart ${justAdded ? 'added' : ''} ${isOutOfStock ? 'disabled' : ''}`}
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            title={
              isOutOfStock
                ? 'Product is currently out of stock'
                : user
                ? 'Add to Cart'
                : 'Sign in to add to cart'
            }
          >
            {isOutOfStock ? (
              <span>Out of Stock</span>
            ) : justAdded ? (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Added!</span>
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
