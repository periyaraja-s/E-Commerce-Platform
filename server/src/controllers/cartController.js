import mongoose from 'mongoose';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { getMemoryProductById } from './productController.js';

// In-memory fallback if MongoDB is not connected
const memoryCarts = new Map();

function calculateCartTotals(items = []) {
  let subtotal = 0;
  let totalQuantity = 0;

  const validItems = items.filter((item) => item && item.product);

  const formattedItems = validItems.map((item) => {
    const product = item.product;
    const price = Number(product.price) || 0;
    const quantity = Number(item.quantity) || 1;
    const itemSubtotal = Math.round(price * quantity * 100) / 100;

    subtotal += itemSubtotal;
    totalQuantity += quantity;

    return {
      product: {
        _id: product._id || product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: Number(product.price),
        stock: Number(product.stock),
        images: product.images || [],
        category: product.category,
        isActive: product.isActive !== false,
      },
      quantity,
      itemSubtotal,
    };
  });

  subtotal = Math.round(subtotal * 100) / 100;
  const shipping = totalQuantity > 0 ? (subtotal >= 50 ? 0 : 9.99) : 0;
  const tax = totalQuantity > 0 ? Math.round(subtotal * 0.08 * 100) / 100 : 0;
  const total = Math.round((subtotal + shipping + tax) * 100) / 100;

  return {
    items: formattedItems,
    subtotal,
    totalQuantity,
    shipping,
    tax,
    total,
  };
}

async function findProduct(productId) {
  if (mongoose.connection.readyState === 1) {
    const query = mongoose.isValidObjectId(productId) ? { _id: productId } : { slug: productId };
    return await Product.findOne({ ...query, isActive: true }).populate('category', 'name slug');
  }

  const memProduct = getMemoryProductById(productId);
  if (memProduct && memProduct.isActive !== false) {
    return memProduct;
  }
  return null;
}

function formatMongoCart(cartDoc) {
  if (!cartDoc) {
    return {
      items: [],
      subtotal: 0,
      totalQuantity: 0,
      shipping: 0,
      tax: 0,
      total: 0,
    };
  }

  const items = (cartDoc.items || [])
    .filter((item) => item && item.product && item.product.isActive !== false)
    .map((item) => ({
      product: item.product,
      quantity: Number(item.quantity) || 1,
    }));

  const totals = calculateCartTotals(items);

  return {
    _id: cartDoc._id,
    user: cartDoc.user,
    ...totals,
    updatedAt: cartDoc.updatedAt,
  };
}

function getOrCreateMemoryCart(userId) {
  const uId = userId.toString();
  if (!memoryCarts.has(uId)) {
    memoryCarts.set(uId, {
      user: uId,
      items: [],
      updatedAt: new Date(),
    });
  }
  return memoryCarts.get(uId);
}

/**
 * GET /api/cart
 * Retrieve the authenticated customer's cart
 */
export async function getCart(req, res) {
  try {
    const userId = req.user._id || req.user.id;

    if (mongoose.connection.readyState === 1) {
      let cart = await Cart.findOne({ user: userId }).populate({
        path: 'items.product',
        populate: { path: 'category', select: 'name slug' },
      });

      if (!cart) {
        cart = await Cart.create({ user: userId, items: [] });
      }

      return res.json({
        success: true,
        data: formatMongoCart(cart),
      });
    }

    // In-memory mode
    const memCart = getOrCreateMemoryCart(userId);
    const totals = calculateCartTotals(memCart.items);

    return res.json({
      success: true,
      data: {
        _id: 'cart_' + userId,
        user: userId,
        ...totals,
        updatedAt: memCart.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error in getCart:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve shopping cart',
      error: error.message,
    });
  }
}

/**
 * POST /api/cart/items
 * Add a product to the cart with server-side stock and quantity validation
 */
export async function addToCart(req, res) {
  try {
    const userId = req.user._id || req.user.id;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(422).json({
        success: false,
        message: 'Product ID is required',
      });
    }

    const parsedQty = parseInt(quantity, 10);
    if (isNaN(parsedQty) || parsedQty < 1) {
      return res.status(422).json({
        success: false,
        message: 'Quantity must be at least 1',
      });
    }

    const product = await findProduct(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or is currently unavailable',
      });
    }

    const availableStock = Number(product.stock) || 0;
    if (availableStock <= 0) {
      return res.status(400).json({
        success: false,
        message: `"${product.name}" is out of stock`,
      });
    }

    if (mongoose.connection.readyState === 1) {
      let cart = await Cart.findOne({ user: userId });
      if (!cart) {
        cart = new Cart({ user: userId, items: [] });
      }

      const existingItemIndex = cart.items.findIndex(
        (item) => item.product.toString() === product._id.toString()
      );

      const currentQtyInCart = existingItemIndex > -1 ? cart.items[existingItemIndex].quantity : 0;
      const targetQty = currentQtyInCart + parsedQty;

      if (targetQty > availableStock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add ${parsedQty} more. Only ${availableStock} available in stock (you have ${currentQtyInCart} in cart).`,
          availableStock,
          currentQuantity: currentQtyInCart,
        });
      }

      if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity = targetQty;
      } else {
        cart.items.push({
          product: product._id,
          quantity: parsedQty,
        });
      }

      await cart.save();

      const updatedCart = await Cart.findById(cart._id).populate({
        path: 'items.product',
        populate: { path: 'category', select: 'name slug' },
      });

      return res.status(200).json({
        success: true,
        message: `Added ${parsedQty} x "${product.name}" to your cart`,
        data: formatMongoCart(updatedCart),
      });
    }

    // In-memory handling
    const memCart = getOrCreateMemoryCart(userId);
    const prodIdStr = (product._id || product.id).toString();

    const existingIndex = memCart.items.findIndex(
      (item) => (item.product._id || item.product.id || item.product).toString() === prodIdStr
    );

    const currentQtyInCart = existingIndex > -1 ? memCart.items[existingIndex].quantity : 0;
    const targetQty = currentQtyInCart + parsedQty;

    if (targetQty > availableStock) {
      return res.status(400).json({
        success: false,
        message: `Cannot add ${parsedQty} more. Only ${availableStock} available in stock (you have ${currentQtyInCart} in cart).`,
        availableStock,
        currentQuantity: currentQtyInCart,
      });
    }

    if (existingIndex > -1) {
      memCart.items[existingIndex].quantity = targetQty;
    } else {
      memCart.items.push({
        product,
        quantity: parsedQty,
      });
    }
    memCart.updatedAt = new Date();

    const totals = calculateCartTotals(memCart.items);
    return res.status(200).json({
      success: true,
      message: `Added ${parsedQty} x "${product.name}" to your cart`,
      data: {
        _id: 'cart_' + userId,
        user: userId,
        ...totals,
        updatedAt: memCart.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error in addToCart:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
      error: error.message,
    });
  }
}

/**
 * PUT /api/cart/items/:productId
 * Update quantity for an item in the cart with stock validation
 */
export async function updateCartItem(req, res) {
  try {
    const userId = req.user._id || req.user.id;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!productId) {
      return res.status(422).json({
        success: false,
        message: 'Product ID is required',
      });
    }

    const parsedQty = parseInt(quantity, 10);
    if (isNaN(parsedQty)) {
      return res.status(422).json({
        success: false,
        message: 'Valid quantity number is required',
      });
    }

    const product = await findProduct(productId);
    const availableStock = product ? Number(product.stock) || 0 : 999;

    if (parsedQty > availableStock) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity (${parsedQty}) exceeds available stock (${availableStock} available).`,
        availableStock,
      });
    }

    if (mongoose.connection.readyState === 1) {
      let cart = await Cart.findOne({ user: userId });
      if (!cart) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found',
        });
      }

      // If quantity <= 0, remove item
      if (parsedQty <= 0) {
        cart.items = cart.items.filter(
          (item) => item.product.toString() !== productId && item.product._id?.toString() !== productId
        );
      } else {
        const itemIndex = cart.items.findIndex(
          (item) => item.product.toString() === productId || item.product._id?.toString() === productId
        );

        if (itemIndex === -1) {
          return res.status(404).json({
            success: false,
            message: 'Item not found in cart',
          });
        }

        cart.items[itemIndex].quantity = parsedQty;
      }

      await cart.save();

      const updatedCart = await Cart.findById(cart._id).populate({
        path: 'items.product',
        populate: { path: 'category', select: 'name slug' },
      });

      return res.json({
        success: true,
        message: parsedQty <= 0 ? 'Item removed from cart' : 'Cart quantity updated',
        data: formatMongoCart(updatedCart),
      });
    }

    // In-memory handling
    const memCart = getOrCreateMemoryCart(userId);
    const prodIdStr = (product?._id || product?.id || productId).toString();

    if (parsedQty <= 0) {
      memCart.items = memCart.items.filter(
        (item) => (item.product._id || item.product.id || item.product).toString() !== prodIdStr
      );
    } else {
      const itemIndex = memCart.items.findIndex(
        (item) => (item.product._id || item.product.id || item.product).toString() === prodIdStr
      );

      if (itemIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Item not found in cart',
        });
      }

      memCart.items[itemIndex].quantity = parsedQty;
    }

    memCart.updatedAt = new Date();
    const totals = calculateCartTotals(memCart.items);

    return res.json({
      success: true,
      message: parsedQty <= 0 ? 'Item removed from cart' : 'Cart quantity updated',
      data: {
        _id: 'cart_' + userId,
        user: userId,
        ...totals,
        updatedAt: memCart.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error in updateCartItem:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update cart item',
      error: error.message,
    });
  }
}

/**
 * DELETE /api/cart/items/:productId
 * Remove an item from the customer's cart
 */
export async function removeCartItem(req, res) {
  try {
    const userId = req.user._id || req.user.id;
    const { productId } = req.params;

    if (!productId) {
      return res.status(422).json({
        success: false,
        message: 'Product ID is required',
      });
    }

    if (mongoose.connection.readyState === 1) {
      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found',
        });
      }

      cart.items = cart.items.filter(
        (item) => item.product.toString() !== productId && item.product._id?.toString() !== productId
      );

      await cart.save();

      const updatedCart = await Cart.findById(cart._id).populate({
        path: 'items.product',
        populate: { path: 'category', select: 'name slug' },
      });

      return res.json({
        success: true,
        message: 'Item removed from cart',
        data: formatMongoCart(updatedCart),
      });
    }

    // In-memory handling
    const memCart = getOrCreateMemoryCart(userId);
    memCart.items = memCart.items.filter(
      (item) => (item.product._id || item.product.id || item.product).toString() !== productId.toString()
    );
    memCart.updatedAt = new Date();

    const totals = calculateCartTotals(memCart.items);
    return res.json({
      success: true,
      message: 'Item removed from cart',
      data: {
        _id: 'cart_' + userId,
        user: userId,
        ...totals,
        updatedAt: memCart.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error in removeCartItem:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove cart item',
      error: error.message,
    });
  }
}

/**
 * DELETE /api/cart
 * Clear the customer's entire cart
 */
export async function clearCart(req, res) {
  try {
    const userId = req.user._id || req.user.id;

    if (mongoose.connection.readyState === 1) {
      let cart = await Cart.findOne({ user: userId });
      if (cart) {
        cart.items = [];
        await cart.save();
      } else {
        cart = await Cart.create({ user: userId, items: [] });
      }

      return res.json({
        success: true,
        message: 'Cart cleared successfully',
        data: formatMongoCart(cart),
      });
    }

    // In-memory handling
    const memCart = getOrCreateMemoryCart(userId);
    memCart.items = [];
    memCart.updatedAt = new Date();

    return res.json({
      success: true,
      message: 'Cart cleared successfully',
      data: {
        _id: 'cart_' + userId,
        user: userId,
        items: [],
        subtotal: 0,
        totalQuantity: 0,
        shipping: 0,
        tax: 0,
        total: 0,
        updatedAt: memCart.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error in clearCart:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: error.message,
    });
  }
}

/**
 * POST /api/cart/sync
 * Merge local guest cart items into the customer's persisted cart upon login
 */
export async function syncCart(req, res) {
  try {
    const userId = req.user._id || req.user.id;
    const { items = [] } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return getCart(req, res);
    }

    for (const rawItem of items) {
      const rawProductId = rawItem.productId || rawItem.product?._id || rawItem.product?.id;
      const requestedQty = Math.max(1, parseInt(rawItem.quantity, 10) || 1);

      if (!rawProductId) continue;

      const product = await findProduct(rawProductId);
      if (!product || Number(product.stock) <= 0) continue;

      const availableStock = Number(product.stock);

      if (mongoose.connection.readyState === 1) {
        let cart = await Cart.findOne({ user: userId });
        if (!cart) cart = new Cart({ user: userId, items: [] });

        const existingIndex = cart.items.findIndex(
          (item) => item.product.toString() === product._id.toString()
        );

        if (existingIndex > -1) {
          const newQty = Math.min(availableStock, cart.items[existingIndex].quantity + requestedQty);
          cart.items[existingIndex].quantity = newQty;
        } else {
          const newQty = Math.min(availableStock, requestedQty);
          cart.items.push({
            product: product._id,
            quantity: newQty,
          });
        }
        await cart.save();
      } else {
        const memCart = getOrCreateMemoryCart(userId);
        const prodIdStr = (product._id || product.id).toString();

        const existingIndex = memCart.items.findIndex(
          (item) => (item.product._id || item.product.id || item.product).toString() === prodIdStr
        );

        if (existingIndex > -1) {
          const newQty = Math.min(availableStock, memCart.items[existingIndex].quantity + requestedQty);
          memCart.items[existingIndex].quantity = newQty;
        } else {
          const newQty = Math.min(availableStock, requestedQty);
          memCart.items.push({
            product,
            quantity: newQty,
          });
        }
        memCart.updatedAt = new Date();
      }
    }

    return getCart(req, res);
  } catch (error) {
    console.error('Error in syncCart:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to sync cart',
      error: error.message,
    });
  }
}
