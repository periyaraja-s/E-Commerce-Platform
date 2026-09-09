import mongoose from 'mongoose';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import { memoryProducts, getMemoryProductById } from './productController.js';

// In-memory fallback storage for orders when MongoDB is not connected
export const memoryOrders = [
  {
    _id: 'ord_demo_101',
    orderNumber: 'ORD-20260901-101',
    user: {
      _id: 'user_customer_001',
      name: 'Demo Customer',
      email: 'customer@gmail.com',
    },
    items: [
      {
        product: 'prod_1',
        name: 'Wireless Noise-Canceling Headphones',
        price: 199.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
        subtotal: 199.99,
      },
      {
        product: 'prod_3',
        name: 'Organic Cotton T-Shirt',
        price: 29.5,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80',
        subtotal: 59.0,
      },
    ],
    shippingAddress: {
      name: 'Demo Customer',
      phone: '+1 (555) 234-5678',
      line1: '742 Evergreen Terrace',
      line2: 'Apt 4B',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62704',
      country: 'United States',
    },
    subtotal: 258.99,
    shippingFee: 0,
    tax: 20.72,
    total: 279.71,
    status: 'confirmed',
    paymentStatus: 'pending',
    paymentMethod: 'cash_on_delivery',
    notes: 'Please leave package at the front porch.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'ord_demo_102',
    orderNumber: 'ORD-20260905-102',
    user: {
      _id: 'user_customer_001',
      name: 'Demo Customer',
      email: 'customer@gmail.com',
    },
    items: [
      {
        product: 'prod_2',
        name: 'Ergonomic Mechanical Keyboard',
        price: 89.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
        subtotal: 89.99,
      },
    ],
    shippingAddress: {
      name: 'Demo Customer',
      phone: '+1 (555) 234-5678',
      line1: '742 Evergreen Terrace',
      line2: 'Apt 4B',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62704',
      country: 'United States',
    },
    subtotal: 89.99,
    shippingFee: 0,
    tax: 7.2,
    total: 97.19,
    status: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'cash_on_delivery',
    notes: '',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const memoryOrderItems = [];

/**
 * Generate a human-readable unique order number
 * Format: ORD-YYYYMMDD-XXXXX
 */
export function generateOrderNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  const randomChars = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ORD-${dateStr}-${randomChars}`;
}

/**
 * Helper to safely execute a unit of work inside a MongoDB transaction
 * with automatic fallback if the MongoDB cluster is a standalone node
 * without replica set transaction capabilities.
 */
async function executeWithTransaction(workFn) {
  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    const result = await workFn(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    if (session) {
      try {
        await session.abortTransaction();
      } catch (_) {}
    }

    // Check if error is due to MongoDB running in standalone mode (no replica set)
    const isStandaloneError =
      error?.message?.includes('replica set') ||
      error?.message?.includes('Transaction numbers are only allowed') ||
      error?.codeName === 'IllegalOperation';

    if (isStandaloneError) {
      console.warn('[Orders] Standalone MongoDB detected; executing order with atomic safety fallback');
      return await workFn(null);
    }

    // Otherwise re-throw error to abort order
    throw error;
  } finally {
    if (session) {
      try {
        session.endSession();
      } catch (_) {}
    }
  }
}

/**
 * POST /api/orders
 * Create an order from cart items or supplied checkout items
 * Enforces server-side stock validation, stock decrement, order + orderItem creation,
 * cart clearing, and database transaction protection.
 */
export async function createOrder(req, res) {
  try {
    const userId = req.user._id || req.user.id;
    const { shippingAddress, paymentMethod = 'cash_on_delivery', notes = '', items: directItems } = req.body;

    // Validate customer shipping details
    if (!shippingAddress) {
      return res.status(422).json({
        success: false,
        message: 'Shipping address is required to place an order',
      });
    }

    const { name, phone, line1, line2, city, state, postalCode, country } = shippingAddress;

    const missingFields = [];
    if (!name?.trim()) missingFields.push('Full Name');
    if (!phone?.trim()) missingFields.push('Phone Number');
    if (!line1?.trim()) missingFields.push('Street Address (Line 1)');
    if (!city?.trim()) missingFields.push('City');
    if (!state?.trim()) missingFields.push('State / Province');
    if (!postalCode?.trim()) missingFields.push('Postal / ZIP Code');

    if (missingFields.length > 0) {
      return res.status(422).json({
        success: false,
        message: `Please complete all required shipping fields: ${missingFields.join(', ')}`,
        missingFields,
      });
    }

    // Cleaned shipping address
    const cleanedAddress = {
      name: name.trim(),
      phone: phone.trim(),
      line1: line1.trim(),
      line2: (line2 || '').trim(),
      city: city.trim(),
      state: state.trim(),
      postalCode: postalCode.trim(),
      country: (country || 'United States').trim(),
    };

    // ==========================================
    // 1. MONGODB CONNECTED EXECUTION PATH
    // ==========================================
    if (mongoose.connection.readyState === 1) {
      // Execute within database transaction with rollback safety
      const order = await executeWithTransaction(async (session) => {
        // Step A: Retrieve Cart items
        let cartDoc = session
          ? await Cart.findOne({ user: userId }).populate('items.product').session(session)
          : await Cart.findOne({ user: userId }).populate('items.product');

        let rawItems = [];
        if (cartDoc && Array.isArray(cartDoc.items) && cartDoc.items.length > 0) {
          rawItems = cartDoc.items;
        } else if (Array.isArray(directItems) && directItems.length > 0) {
          // Fallback if direct items were passed from client
          rawItems = directItems;
        }

        if (rawItems.length === 0) {
          const emptyErr = new Error('Your cart is empty. Please add items to your cart before proceeding to checkout.');
          emptyErr.statusCode = 400;
          throw emptyErr;
        }

        // Step B: Server-side validation of stock and product availability
        const verifiedOrderItems = [];
        let computedSubtotal = 0;

        for (const item of rawItems) {
          const productId = item.product?._id || item.product?.id || item.product;
          const requestedQty = Number(item.quantity) || 1;

          if (requestedQty < 1) {
            const qtyErr = new Error('Item quantity must be at least 1');
            qtyErr.statusCode = 400;
            throw qtyErr;
          }

          // Fetch fresh product document directly with lock/session
          const product = session
            ? await Product.findById(productId).session(session)
            : await Product.findById(productId);

          if (!product || product.isActive === false) {
            const unavailErr = new Error(
              `"${item.product?.name || item.name || 'A selected product'}" is no longer active or available in the store.`
            );
            unavailErr.statusCode = 400;
            throw unavailErr;
          }

          // Strict server-side stock availability verification
          if (product.stock < requestedQty) {
            const stockErr = new Error(
              `Insufficient stock for "${product.name}". Only ${product.stock} left in stock (you requested ${requestedQty}).`
            );
            stockErr.statusCode = 400;
            stockErr.availableStock = product.stock;
            stockErr.productId = product._id;
            throw stockErr;
          }

          const unitPrice = Number(product.price);
          const itemSubtotal = Math.round(unitPrice * requestedQty * 100) / 100;
          computedSubtotal += itemSubtotal;

          verifiedOrderItems.push({
            product: product._id,
            name: product.name,
            price: unitPrice,
            quantity: requestedQty,
            image: (Array.isArray(product.images) && product.images[0]) || '',
            subtotal: itemSubtotal,
          });
        }

        // Step C: Calculate financial totals
        computedSubtotal = Math.round(computedSubtotal * 100) / 100;
        const shippingFee = computedSubtotal >= 50 ? 0 : 9.99;
        const tax = Math.round(computedSubtotal * 0.08 * 100) / 100;
        const grandTotal = Math.round((computedSubtotal + shippingFee + tax) * 100) / 100;

        // Step D: Reduce product inventory stock atomically
        for (const item of verifiedOrderItems) {
          const updateQuery = { $inc: { stock: -item.quantity } };
          if (session) {
            await Product.findByIdAndUpdate(item.product, updateQuery, { session });
          } else {
            await Product.findByIdAndUpdate(item.product, updateQuery);
          }
        }

        // Step E: Generate unique human-readable order number
        let orderNumber = generateOrderNumber();
        const existingOrder = await Order.findOne({ orderNumber });
        if (existingOrder) {
          orderNumber = generateOrderNumber() + '-' + Math.floor(10 + Math.random() * 90);
        }

        // Step F: Create and persist Order record
        const orderData = {
          orderNumber,
          user: userId,
          items: verifiedOrderItems,
          shippingAddress: cleanedAddress,
          subtotal: computedSubtotal,
          shippingFee,
          tax,
          total: grandTotal,
          status: 'confirmed',
          paymentStatus: 'pending',
          paymentMethod: paymentMethod || 'cash_on_delivery',
          notes: (notes || '').trim(),
        };

        const newOrder = new Order(orderData);
        if (session) {
          await newOrder.save({ session });
        } else {
          await newOrder.save();
        }

        // Step G: Create OrderItem records linking to this order
        const orderItemDocs = verifiedOrderItems.map((item) => ({
          order: newOrder._id,
          product: item.product,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          subtotal: item.subtotal,
        }));

        if (session) {
          await OrderItem.insertMany(orderItemDocs, { session });
        } else {
          await OrderItem.insertMany(orderItemDocs);
        }

        // Step H: Clear customer's cart after successful order creation
        if (session) {
          await Cart.findOneAndUpdate({ user: userId }, { items: [] }, { session });
        } else {
          await Cart.findOneAndUpdate({ user: userId }, { items: [] });
        }

        return newOrder;
      });

      // Populate user info for full receipt payload
      await order.populate('user', 'name email');

      return res.status(201).json({
        success: true,
        message: 'Order created successfully! Order reference: ' + order.orderNumber,
        data: order,
      });
    }

    // ==========================================
    // 2. IN-MEMORY FALLBACK EXECUTION PATH
    // ==========================================
    // If running in memory mode without active MongoDB
    const userCart = directItems || [];
    if (!userCart || userCart.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty. Please add products before checking out.',
      });
    }

    const verifiedOrderItems = [];
    let computedSubtotal = 0;

    // Check stock for each item in memory
    for (const item of userCart) {
      const prodId = item.product?._id || item.product?.id || item.product;
      const product = getMemoryProductById(prodId);
      const requestedQty = Number(item.quantity) || 1;

      if (!product || product.isActive === false) {
        return res.status(400).json({
          success: false,
          message: `Product "${item.name || 'item'}" is currently unavailable.`,
        });
      }

      if (product.stock < requestedQty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Only ${product.stock} available in inventory (requested: ${requestedQty}).`,
          availableStock: product.stock,
          productId: product._id,
        });
      }

      const unitPrice = Number(product.price);
      const itemSubtotal = Math.round(unitPrice * requestedQty * 100) / 100;
      computedSubtotal += itemSubtotal;

      verifiedOrderItems.push({
        product: product._id,
        name: product.name,
        price: unitPrice,
        quantity: requestedQty,
        image: (Array.isArray(product.images) && product.images[0]) || '',
        subtotal: itemSubtotal,
      });
    }

    // Decrement stock for all items
    for (const item of verifiedOrderItems) {
      const p = getMemoryProductById(item.product);
      if (p) {
        p.stock = Math.max(0, p.stock - item.quantity);
      }
    }

    computedSubtotal = Math.round(computedSubtotal * 100) / 100;
    const shippingFee = computedSubtotal >= 50 ? 0 : 9.99;
    const tax = Math.round(computedSubtotal * 0.08 * 100) / 100;
    const grandTotal = Math.round((computedSubtotal + shippingFee + tax) * 100) / 100;

    const orderNumber = generateOrderNumber();
    const newMemoryOrder = {
      _id: 'ord_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      orderNumber,
      user: {
        _id: userId,
        name: req.user.name || 'Customer',
        email: req.user.email || 'customer@example.com',
      },
      items: verifiedOrderItems,
      shippingAddress: cleanedAddress,
      subtotal: computedSubtotal,
      shippingFee,
      tax,
      total: grandTotal,
      status: 'confirmed',
      paymentStatus: 'pending',
      paymentMethod: paymentMethod || 'cash_on_delivery',
      notes: (notes || '').trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    memoryOrders.unshift(newMemoryOrder);

    for (const item of verifiedOrderItems) {
      memoryOrderItems.push({
        _id: 'oi_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
        order: newMemoryOrder._id,
        ...item,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Order created successfully! Order reference: ' + newMemoryOrder.orderNumber,
      data: newMemoryOrder,
    });
  } catch (error) {
    console.error('[Orders] Error in createOrder:', error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to process order. Please check your details and try again.',
      availableStock: error.availableStock,
      productId: error.productId,
    });
  }
}

/**
 * GET /api/orders
 * List orders. Customers only see their own orders; Admins see all orders.
 */
export async function listOrders(req, res) {
  try {
    const userId = req.user._id || req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (mongoose.connection.readyState === 1) {
      const query = isAdmin ? {} : { user: userId };
      const orders = await Order.find(query)
        .populate('user', 'name email role')
        .populate('items.product', 'name slug images category price stock')
        .sort({ createdAt: -1 });

      return res.json({
        success: true,
        data: orders,
        count: orders.length,
      });
    }

    // In-memory fallback
    const filteredOrders = isAdmin
      ? [...memoryOrders]
      : memoryOrders.filter(
          (o) =>
            (o.user?._id && o.user._id.toString() === userId.toString()) ||
            (o.user?.email && o.user.email === req.user.email) ||
            o.user === userId
        );

    filteredOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({
      success: true,
      data: filteredOrders,
      count: filteredOrders.length,
    });
  } catch (error) {
    console.error('[Orders] Error in listOrders:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch order history',
      error: error.message,
    });
  }
}

/**
 * GET /api/orders/:id
 * Retrieve full order details by ID or Order Number
 */
export async function getOrderById(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (mongoose.connection.readyState === 1) {
      const isObjectId = mongoose.isValidObjectId(id);
      const query = isObjectId ? { _id: id } : { orderNumber: id };

      const order = await Order.findOne(query)
        .populate('user', 'name email role')
        .populate('items.product', 'name slug images category price stock');

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      // Authorization guard: customers can only view their own orders
      const orderOwnerId = order.user?._id?.toString() || order.user?.toString();
      if (!isAdmin && orderOwnerId !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to view this order',
        });
      }

      // Also find linked OrderItems if any
      const orderItems = await OrderItem.find({ order: order._id });

      const orderObj = order.toObject();
      orderObj.orderItems = orderItems;

      return res.json({
        success: true,
        data: orderObj,
      });
    }

    // In-memory fallback
    const order = memoryOrders.find(
      (o) => o._id === id || o.orderNumber === id || o.orderNumber?.toLowerCase() === id.toLowerCase()
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const orderOwnerId = order.user?._id?.toString() || order.user?.toString();
    if (!isAdmin && orderOwnerId !== userId.toString() && order.user?.email !== req.user.email) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this order',
      });
    }

    return res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('[Orders] Error in getOrderById:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve order details',
      error: error.message,
    });
  }
}

/**
 * PATCH /api/orders/:id/status
 * Admin update order status (pending, confirmed, processing, shipped, delivered, cancelled)
 */
export async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];

    if (status && !validStatuses.includes(status)) {
      return res.status(422).json({
        success: false,
        message: `Invalid order status. Allowed: ${validStatuses.join(', ')}`,
      });
    }

    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      return res.status(422).json({
        success: false,
        message: `Invalid payment status. Allowed: ${validPaymentStatuses.join(', ')}`,
      });
    }

    if (mongoose.connection.readyState === 1) {
      const isObjectId = mongoose.isValidObjectId(id);
      const query = isObjectId ? { _id: id } : { orderNumber: id };

      const order = await Order.findOne(query);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      // If updating to cancelled from a non-cancelled state, restore product stock
      if (status === 'cancelled' && order.status !== 'cancelled') {
        for (const item of order.items) {
          if (item.product) {
            await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
          }
        }
      }

      if (status) order.status = status;
      if (paymentStatus) order.paymentStatus = paymentStatus;

      await order.save();
      await order.populate('user', 'name email');

      return res.json({
        success: true,
        message: `Order status updated to "${order.status}"`,
        data: order,
      });
    }

    // In-memory fallback
    const order = memoryOrders.find((o) => o._id === id || o.orderNumber === id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (status === 'cancelled' && order.status !== 'cancelled') {
      for (const item of order.items) {
        const p = getMemoryProductById(item.product);
        if (p) p.stock += item.quantity;
      }
    }

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    order.updatedAt = new Date().toISOString();

    return res.json({
      success: true,
      message: `Order status updated to "${order.status}"`,
      data: order,
    });
  } catch (error) {
    console.error('[Orders] Error in updateOrderStatus:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message,
    });
  }
}
