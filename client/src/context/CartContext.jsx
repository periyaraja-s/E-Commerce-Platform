import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { useAuth } from './AuthContext.jsx';
import api from '../services/api.js';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const userId = user?._id || user?.id || null;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartError, setCartError] = useState('');
  const [toast, setToast] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 3800);
  }, []);

  // Fetch cart from backend or local fallback
  const fetchCart = useCallback(async () => {
    if (user?.role === 'admin') {
      setItems([]);
      setLoading(false);
      return;
    }

    if (!userId) {
      // Guest mode: load from localStorage
      try {
        const guestStored = localStorage.getItem('ecommerce_cart_guest');
        setItems(guestStored ? JSON.parse(guestStored) : []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    setCartError('');

    try {
      // Check if guest cart needs merging into persisted account cart
      const guestStored = localStorage.getItem('ecommerce_cart_guest');
      if (guestStored) {
        try {
          const guestItems = JSON.parse(guestStored);
          if (Array.isArray(guestItems) && guestItems.length > 0) {
            const syncPayload = guestItems.map((gi) => ({
              productId: gi.product?._id || gi.product?.id,
              quantity: gi.quantity || 1,
            }));
            await api.post('/cart/sync', { items: syncPayload });
            localStorage.removeItem('ecommerce_cart_guest');
          }
        } catch (syncErr) {
          console.warn('Could not sync guest cart items:', syncErr);
        }
      }

      // Fetch customer's persistent cart from server
      const res = await api.get('/cart');
      if (res.data?.success && res.data?.data) {
        setItems(res.data.data.items || []);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error('Failed to fetch cart from server:', err);
      // Fallback to cached local copy if offline
      try {
        const cached = localStorage.getItem(`ecommerce_cart_${userId}`);
        if (cached) {
          setItems(JSON.parse(cached));
        } else {
          setItems([]);
        }
      } catch {
        setItems([]);
      }
      setCartError('Unable to sync cart with server. Displaying offline version.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Re-fetch or switch cart whenever user logs in or out
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Keep local cache up to date for instant render and offline resilience
  useEffect(() => {
    if (userId) {
      try {
        localStorage.setItem(`ecommerce_cart_${userId}`, JSON.stringify(items));
      } catch {
        // ignore
      }
    } else {
      try {
        localStorage.setItem('ecommerce_cart_guest', JSON.stringify(items));
      } catch {
        // ignore
      }
    }
  }, [items, userId]);

  /**
   * Add a product to the cart with server stock validation
   */
  const addToCart = async (product, quantity = 1) => {
    if (user?.role === 'admin') {
      showToast('Admin accounts do not support customer shopping cart actions.', 'error');
      return { success: false, message: 'Admin accounts cannot add to cart' };
    }
    if (!product) return { success: false };
    const productId = product._id || product.id;
    const requestedQty = Math.max(1, Number(quantity) || 1);
    const availableStock = Number(product.stock) || 0;

    if (availableStock <= 0) {
      showToast(`"${product.name}" is currently out of stock`, 'error');
      return { success: false, message: 'Out of stock' };
    }

    // Authenticated user: persist to backend API
    if (userId) {
      setActionLoading(true);
      try {
        const res = await api.post('/cart/items', {
          productId,
          quantity: requestedQty,
        });

        if (res.data?.success) {
          const updatedItems = res.data.data.items || [];
          setItems(updatedItems);
          showToast(res.data.message || `Added "${product.name}" to cart`, 'success');
          return { success: true };
        }
      } catch (err) {
        const errMsg = err.response?.data?.message || 'Failed to add item to cart';
        showToast(errMsg, 'error');
        return { success: false, message: errMsg };
      } finally {
        setActionLoading(false);
      }
    } else {
      // Guest user fallback
      setItems((prev) => {
        const idx = prev.findIndex((i) => (i.product?._id || i.product?.id) === productId);
        if (idx > -1) {
          const curQty = prev[idx].quantity;
          if (curQty + requestedQty > availableStock) {
            showToast(`Only ${availableStock} units available in stock`, 'warning');
            return prev;
          }
          const updated = [...prev];
          updated[idx] = { ...updated[idx], quantity: curQty + requestedQty };
          return updated;
        }
        return [...prev, { product, quantity: Math.min(requestedQty, availableStock) }];
      });
      showToast(`Added "${product.name}" to cart!`, 'success');
      return { success: true };
    }
  };

  /**
   * Update item quantity with server stock validation
   */
  const updateQuantity = async (productId, newQty) => {
    const targetQty = Number(newQty);

    if (targetQty <= 0) {
      return removeFromCart(productId);
    }

    if (userId) {
      setActionLoading(true);
      try {
        const res = await api.put(`/cart/items/${productId}`, {
          quantity: targetQty,
        });

        if (res.data?.success) {
          setItems(res.data.data.items || []);
          return { success: true };
        }
      } catch (err) {
        const errMsg = err.response?.data?.message || 'Failed to update quantity';
        showToast(errMsg, 'error');
        // Refresh to guarantee client matches server
        fetchCart();
        return { success: false, message: errMsg };
      } finally {
        setActionLoading(false);
      }
    } else {
      // Guest mode
      setItems((prev) =>
        prev.map((i) => {
          const pId = i.product?._id || i.product?.id;
          if (pId === productId) {
            const max = typeof i.product?.stock === 'number' ? i.product.stock : 99;
            if (targetQty > max) {
              showToast(`Only ${max} units available in stock`, 'warning');
              return { ...i, quantity: max };
            }
            return { ...i, quantity: targetQty };
          }
          return i;
        })
      );
      return { success: true };
    }
  };

  /**
   * Remove item from cart
   */
  const removeFromCart = async (productId) => {
    const existing = items.find((i) => (i.product?._id || i.product?.id) === productId);
    const prodName = existing?.product?.name || 'Item';

    if (userId) {
      setActionLoading(true);
      try {
        const res = await api.delete(`/cart/items/${productId}`);
        if (res.data?.success) {
          setItems(res.data.data.items || []);
          showToast(`Removed "${prodName}" from cart`, 'info');
          return { success: true };
        }
      } catch (err) {
        const errMsg = err.response?.data?.message || 'Failed to remove item';
        showToast(errMsg, 'error');
        return { success: false, message: errMsg };
      } finally {
        setActionLoading(false);
      }
    } else {
      setItems((prev) => prev.filter((i) => (i.product?._id || i.product?.id) !== productId));
      showToast(`Removed "${prodName}" from cart`, 'info');
      return { success: true };
    }
  };

  /**
   * Clear all items in cart
   */
  const clearCart = async () => {
    if (userId) {
      setActionLoading(true);
      try {
        const res = await api.delete('/cart');
        if (res.data?.success) {
          setItems([]);
          showToast('Cart cleared successfully', 'info');
          return { success: true };
        }
      } catch (err) {
        const errMsg = err.response?.data?.message || 'Failed to clear cart';
        showToast(errMsg, 'error');
        return { success: false, message: errMsg };
      } finally {
        setActionLoading(false);
      }
    } else {
      setItems([]);
      localStorage.removeItem('ecommerce_cart_guest');
      showToast('Cart cleared', 'info');
      return { success: true };
    }
  };

  // Calculations
  const cartCount = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  }, [items]);

  const cartSubtotal = useMemo(() => {
    const total = items.reduce((sum, item) => {
      const price = Number(item.product?.price) || 0;
      const qty = Number(item.quantity) || 0;
      return sum + price * qty;
    }, 0);
    return Math.round(total * 100) / 100;
  }, [items]);

  const shipping = useMemo(() => {
    return cartCount > 0 ? (cartSubtotal >= 50 ? 0 : 9.99) : 0;
  }, [cartCount, cartSubtotal]);

  const tax = useMemo(() => {
    return cartCount > 0 ? Math.round(cartSubtotal * 0.08 * 100) / 100 : 0;
  }, [cartCount, cartSubtotal]);

  const grandTotal = useMemo(() => {
    return Math.round((cartSubtotal + shipping + tax) * 100) / 100;
  }, [cartSubtotal, shipping, tax]);

  const value = useMemo(
    () => ({
      items,
      loading,
      actionLoading,
      cartError,
      cartCount,
      cartSubtotal,
      shipping,
      tax,
      grandTotal,
      cartTotal: cartSubtotal, // backward compatibility
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      fetchCart,
      toast,
      showToast,
    }),
    [
      items,
      loading,
      actionLoading,
      cartError,
      cartCount,
      cartSubtotal,
      shipping,
      tax,
      grandTotal,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      fetchCart,
      toast,
      showToast,
    ]
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
