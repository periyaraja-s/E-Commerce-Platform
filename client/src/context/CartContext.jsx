import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const userId = user?._id || user?.id || 'guest';
  const storageKey = `ecommerce_cart_${userId}`;

  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [toast, setToast] = useState(null);

  // Sync with storage on user change
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      const userItems = stored ? JSON.parse(stored) : [];

      // If logging in from guest and guest had items, merge them into user's cart
      if (userId !== 'guest') {
        const guestStored = localStorage.getItem('ecommerce_cart_guest');
        if (guestStored) {
          try {
            const guestItems = JSON.parse(guestStored);
            if (Array.isArray(guestItems) && guestItems.length > 0) {
              const merged = [...userItems];
              guestItems.forEach((gItem) => {
                const existingIndex = merged.findIndex(
                  (m) => (m.product?._id || m.product?.id) === (gItem.product?._id || gItem.product?.id)
                );
                if (existingIndex > -1) {
                  merged[existingIndex].quantity += gItem.quantity;
                } else {
                  merged.push(gItem);
                }
              });
              localStorage.removeItem('ecommerce_cart_guest');
              localStorage.setItem(storageKey, JSON.stringify(merged));
              setItems(merged);
              return;
            }
          } catch {
            // ignore parse error
          }
        }
      }

      setItems(userItems);
    } catch {
      setItems([]);
    }
  }, [userId, storageKey]);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items, storageKey]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 3500);
  };

  const addToCart = (product, quantity = 1) => {
    if (!product) return;
    const pId = product._id || product.id;
    const maxStock = typeof product.stock === 'number' ? product.stock : 99;

    setItems((prev) => {
      const index = prev.findIndex((item) => (item.product?._id || item.product?.id) === pId);
      if (index > -1) {
        const updated = [...prev];
        const newQty = Math.min(updated[index].quantity + quantity, maxStock);
        updated[index] = { ...updated[index], quantity: newQty };
        return updated;
      }
      return [...prev, { product, quantity: Math.min(quantity, maxStock) }];
    });

    showToast(`Added "${product.name}" to your cart!`);
  };

  const updateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        const pId = item.product?._id || item.product?.id;
        if (pId === productId) {
          const maxStock = typeof item.product?.stock === 'number' ? item.product.stock : 99;
          return { ...item, quantity: Math.min(newQty, maxStock) };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId) => {
    setItems((prev) => {
      const removed = prev.find((item) => (item.product?._id || item.product?.id) === productId);
      if (removed?.product?.name) {
        showToast(`Removed "${removed.product.name}" from cart`, 'info');
      }
      return prev.filter((item) => (item.product?._id || item.product?.id) !== productId);
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const cartCount = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  }, [items]);

  const cartTotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const price = Number(item.product?.price) || 0;
      const qty = Number(item.quantity) || 0;
      return sum + price * qty;
    }, 0);
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      cartCount,
      cartTotal,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      toast,
      showToast,
    }),
    [items, cartCount, cartTotal, toast]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
