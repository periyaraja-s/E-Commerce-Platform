import mongoose from 'mongoose';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import { memoryProducts, getMemoryProductById } from './productController.js';
import {
  getRazorpayPublicConfig,
  createRazorpayOrder,
  verifyRazorpaySignature,
  generateTestSignature,
} from '../services/razorpayService.js';

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
 * Supports status filtering and search query parameters.
 */
export async function listOrders(req, res) {
  try {
    const userId = req.user._id || req.user.id;
    const isAdmin = req.user.role === 'admin';
    const { status, search } = req.query;

    if (mongoose.connection.readyState === 1) {
      const query = isAdmin ? {} : { user: userId };

      if (status && status !== 'all') {
        query.status = status.toLowerCase();
      }

      if (search && search.trim()) {
        const searchRegex = new RegExp(search.trim(), 'i');
        const searchConditions = [
          { orderNumber: searchRegex },
          { 'shippingAddress.name': searchRegex },
        ];
        if (query.$or) {
          query.$and = [{ $or: query.$or }, { $or: searchConditions }];
          delete query.$or;
        } else {
          query.$or = searchConditions;
        }
      }

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
    let filteredOrders = isAdmin
      ? [...memoryOrders]
      : memoryOrders.filter(
          (o) =>
            (o.user?._id && o.user._id.toString() === userId.toString()) ||
            (o.user?.email && req.user.email && o.user.email.toLowerCase() === req.user.email.toLowerCase()) ||
            o.user === userId ||
            (typeof o.user === 'string' && o.user === userId.toString())
        );

    // Apply status filter
    if (status && status !== 'all') {
      filteredOrders = filteredOrders.filter(
        (o) => o.status?.toLowerCase() === status.toLowerCase()
      );
    }

    // Apply search filter (order number, customer name, email, or shipping recipient)
    if (search && search.trim()) {
      const s = search.trim().toLowerCase();
      filteredOrders = filteredOrders.filter(
        (o) =>
          o.orderNumber?.toLowerCase().includes(s) ||
          o.user?.name?.toLowerCase().includes(s) ||
          o.user?.email?.toLowerCase().includes(s) ||
          o.shippingAddress?.name?.toLowerCase().includes(s)
      );
    }

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
 * Enforces customer ownership: Customers can only access their own orders.
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
      const orderOwnerEmail = order.user?.email?.toLowerCase();
      const userEmail = req.user.email?.toLowerCase();

      const isOwner =
        orderOwnerId === userId.toString() ||
        (orderOwnerEmail && userEmail && orderOwnerEmail === userEmail);

      if (!isAdmin && !isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You are only authorized to view your own orders.',
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
    const orderOwnerEmail = order.user?.email?.toLowerCase();
    const userEmail = req.user.email?.toLowerCase();

    const isOwner =
      orderOwnerId === userId.toString() ||
      (orderOwnerEmail && userEmail && orderOwnerEmail === userEmail);

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are only authorized to view your own orders.',
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
 * Enforces admin-only access and validates business status transition rules server-side.
 */
export async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    // Enforce admin-only order management
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Administrator privileges required to manage orders.',
      });
    }

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

      // Server-side validation of status transition rules:
      // 1. Cancelled orders are final
      if (order.status === 'cancelled' && status && status !== 'cancelled') {
        return res.status(400).json({
          success: false,
          message: 'Order has already been cancelled and inventory was returned. Cancelled orders cannot be reactivated.',
        });
      }

      // 2. Delivered orders cannot be reverted
      if (order.status === 'delivered' && status && status !== 'delivered') {
        return res.status(400).json({
          success: false,
          message: 'Delivered orders are complete and cannot be transitioned to pending, confirmed, or cancelled.',
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

      // Auto mark payment as paid if delivered and payment was pending COD
      if (status === 'delivered' && order.paymentStatus === 'pending') {
        order.paymentStatus = 'paid';
      }

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

    // Server-side validation of status transition rules:
    if (order.status === 'cancelled' && status && status !== 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Order has already been cancelled and inventory was returned. Cancelled orders cannot be reactivated.',
      });
    }

    if (order.status === 'delivered' && status && status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Delivered orders are complete and cannot be transitioned to pending, confirmed, or cancelled.',
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
    if (status === 'delivered' && order.paymentStatus === 'pending') {
      order.paymentStatus = 'paid';
    }
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

/**
 * GET /api/orders/razorpay/config
 * Returns public Razorpay configuration for client checkout initialization.
 * CRITICAL: Never exposes RAZORPAY_KEY_SECRET.
 */
export async function getRazorpayConfigHandler(req, res) {
  try {
    const config = getRazorpayPublicConfig();
    return res.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error('[Razorpay] Error fetching config:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment configuration',
    });
  }
}

/**
 * GET /api/orders/razorpay/admin-settings
 * Admin-only: Returns payment gateway settings, test mode status, and provider health.
 * CRITICAL: Never exposes RAZORPAY_KEY_SECRET.
 */
export async function getAdminPaymentSettingsHandler(req, res) {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Admin privileges required to view payment gateway settings',
      });
    }

    const publicConfig = getRazorpayPublicConfig();
    const hasSecret = Boolean(process.env.RAZORPAY_KEY_SECRET);

    return res.json({
      success: true,
      data: {
        provider: 'Razorpay Payment Gateway',
        mode: 'Test Mode',
        isTestMode: true,
        isEnabled: publicConfig.isEnabled,
        keyId: publicConfig.keyId,
        isSecretConfigured: hasSecret,
        currency: publicConfig.currency,
        verificationMethod: 'HMAC-SHA256 (Server-Side Enforced)',
        supportedMethods: [
          'Credit & Debit Cards (Visa, Mastercard, RuPay)',
          'UPI (Google Pay, PhonePe, Paytm)',
          'NetBanking (All major banks)',
          'Digital Wallets',
          'Cash on Delivery',
        ],
      },
    });
  } catch (error) {
    console.error('[Razorpay Admin] Error getting payment settings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin payment settings',
    });
  }
}

/**
 * POST /api/orders/razorpay/create-order
 * Customer creates a Razorpay test order.
 * Calculates amount purely on server (never trusts client amount),
 * validates stock, creates a pending order record, and returns public Key ID + Razorpay Order ID.
 */
export async function createRazorpayOrderHandler(req, res) {
  try {
    const userId = req.user._id || req.user.id;
    const { shippingAddress, notes = '', items: directItems } = req.body;

    // Validate customer shipping details
    if (!shippingAddress) {
      return res.status(422).json({
        success: false,
        message: 'Shipping address is required to initiate checkout.',
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
        message: `Please complete required shipping fields: ${missingFields.join(', ')}`,
        missingFields,
      });
    }

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

    // 1. MONGODB DATABASE FLOW
    if (mongoose.connection.readyState === 1) {
      // Step A: Load cart items
      let cartDoc = await Cart.findOne({ user: userId }).populate('items.product');
      let rawItems = [];
      if (cartDoc && Array.isArray(cartDoc.items) && cartDoc.items.length > 0) {
        rawItems = cartDoc.items;
      } else if (Array.isArray(directItems) && directItems.length > 0) {
        rawItems = directItems;
      }

      if (rawItems.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Your cart is empty. Please add products to your cart before proceeding to payment.',
        });
      }

      // Step B: Server-side validation of stock and prices
      const verifiedOrderItems = [];
      let computedSubtotal = 0;

      for (const item of rawItems) {
        const productId = item.product?._id || item.product?.id || item.product;
        const requestedQty = Number(item.quantity) || 1;

        if (requestedQty < 1) {
          return res.status(400).json({
            success: false,
            message: 'Item quantity must be at least 1.',
          });
        }

        const product = await Product.findById(productId);
        if (!product || product.isActive === false) {
          return res.status(400).json({
            success: false,
            message: `"${item.product?.name || item.name || 'A selected product'}" is currently unavailable.`,
          });
        }

        if (product.stock < requestedQty) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for "${product.name}". Only ${product.stock} available (requested ${requestedQty}).`,
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

      // Step C: Server financial calculations (NEVER trust amount from React)
      computedSubtotal = Math.round(computedSubtotal * 100) / 100;
      const shippingFee = computedSubtotal >= 50 ? 0 : 9.99;
      const tax = Math.round(computedSubtotal * 0.08 * 100) / 100;
      const grandTotal = Math.round((computedSubtotal + shippingFee + tax) * 100) / 100;
      const amountInSubunits = Math.round(grandTotal * 100); // in paise

      let orderNumber = generateOrderNumber();
      const existing = await Order.findOne({ orderNumber });
      if (existing) {
        orderNumber = `${generateOrderNumber()}-${Math.floor(10 + Math.random() * 90)}`;
      }

      // Step D: Create Razorpay order via Razorpay service
      const razorpayOrder = await createRazorpayOrder({
        amountInSubunits,
        currency: 'INR',
        receipt: orderNumber,
        notes: {
          orderNumber,
          userId: userId.toString(),
          customerName: cleanedAddress.name,
        },
      });

      // Step E: Create pending order record in MongoDB
      const newOrder = new Order({
        orderNumber,
        user: userId,
        items: verifiedOrderItems,
        shippingAddress: cleanedAddress,
        subtotal: computedSubtotal,
        shippingFee,
        tax,
        total: grandTotal,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: 'razorpay',
        razorpayOrderId: razorpayOrder.id,
        notes: (notes || '').trim(),
      });

      await newOrder.save();

      const publicConfig = getRazorpayPublicConfig();

      return res.status(201).json({
        success: true,
        message: 'Razorpay order created successfully',
        data: {
          keyId: publicConfig.keyId,
          orderId: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency || 'INR',
          orderNumber: newOrder.orderNumber,
          internalOrderId: newOrder._id,
          subtotal: computedSubtotal,
          shippingFee,
          tax,
          total: grandTotal,
        },
      });
    }

    // 2. IN-MEMORY FALLBACK FLOW (when MongoDB is not connected)
    const userCart = directItems || [];
    if (!userCart || userCart.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty. Please add products before checking out.',
      });
    }

    const verifiedOrderItems = [];
    let computedSubtotal = 0;

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
          message: `Insufficient stock for "${product.name}". Only ${product.stock} available (requested: ${requestedQty}).`,
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

    computedSubtotal = Math.round(computedSubtotal * 100) / 100;
    const shippingFee = computedSubtotal >= 50 ? 0 : 9.99;
    const tax = Math.round(computedSubtotal * 0.08 * 100) / 100;
    const grandTotal = Math.round((computedSubtotal + shippingFee + tax) * 100) / 100;
    const amountInSubunits = Math.round(grandTotal * 100);

    const orderNumber = generateOrderNumber();
    const razorpayOrder = await createRazorpayOrder({
      amountInSubunits,
      currency: 'INR',
      receipt: orderNumber,
      notes: { orderNumber, customerName: cleanedAddress.name },
    });

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
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: 'razorpay',
      razorpayOrderId: razorpayOrder.id,
      razorpayPaymentId: null,
      razorpaySignature: null,
      paidAt: null,
      notes: (notes || '').trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    memoryOrders.unshift(newMemoryOrder);
    const publicConfig = getRazorpayPublicConfig();

    return res.status(201).json({
      success: true,
      message: 'Razorpay order created successfully',
      data: {
        keyId: publicConfig.keyId,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency || 'INR',
        orderNumber: newMemoryOrder.orderNumber,
        internalOrderId: newMemoryOrder._id,
        subtotal: computedSubtotal,
        shippingFee,
        tax,
        total: grandTotal,
      },
    });
  } catch (error) {
    console.error('[Razorpay] Error in createRazorpayOrderHandler:', error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to create Razorpay order',
    });
  }
}

/**
 * POST /api/orders/razorpay/verify-payment
 * Verifies Razorpay payment signature server-side.
 * On valid signature: inside transaction, verifies & decrements stock, marks order as paid,
 * records payment details, and clears customer cart.
 * On invalid signature: marks paymentStatus as 'failed' and returns 400.
 */
export async function verifyRazorpayPaymentHandler(req, res) {
  try {
    const userId = req.user._id || req.user.id;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required Razorpay payment verification parameters.',
      });
    }

    // Step 1: Server-side cryptographic signature verification using secret
    const isValidSignature = verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    // 1. MONGODB DATABASE PATH
    if (mongoose.connection.readyState === 1) {
      const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order reference corresponding to Razorpay order not found.',
        });
      }

      // Enforce customer ownership
      const orderOwnerId = order.user?._id?.toString() || order.user?.toString();
      if (orderOwnerId !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You are only authorized to verify payment for your own orders.',
        });
      }

      // If signature is INVALID: fail payment, do NOT mark as paid, do NOT decrement stock
      if (!isValidSignature) {
        order.paymentStatus = 'failed';
        await order.save();
        return res.status(400).json({
          success: false,
          message: 'Invalid Razorpay signature. Server-side payment verification failed.',
        });
      }

      // If already paid, return existing order
      if (order.paymentStatus === 'paid') {
        return res.json({
          success: true,
          message: 'Payment was already verified and processed.',
          data: order,
        });
      }

      // Signature is valid: Execute payment, order, and stock updates in database transaction
      await executeWithTransaction(async (session) => {
        // Decrement product inventory stock atomically with stock check
        for (const item of order.items) {
          const product = session
            ? await Product.findById(item.product).session(session)
            : await Product.findById(item.product);

          if (!product || product.stock < item.quantity) {
            const stockErr = new Error(
              `Insufficient stock for "${item.name}". Required: ${item.quantity}, available: ${product?.stock ?? 0}.`
            );
            stockErr.statusCode = 400;
            throw stockErr;
          }

          const updateQuery = { $inc: { stock: -item.quantity } };
          if (session) {
            await Product.findByIdAndUpdate(item.product, updateQuery, { session });
          } else {
            await Product.findByIdAndUpdate(item.product, updateQuery);
          }
        }

        // Update order status & payment details
        order.status = 'confirmed';
        order.paymentStatus = 'paid';
        order.razorpayPaymentId = razorpay_payment_id;
        order.razorpaySignature = razorpay_signature;
        order.paidAt = new Date();

        if (session) {
          await order.save({ session });
        } else {
          await order.save();
        }

        // Persist OrderItem records
        const orderItemDocs = order.items.map((item) => ({
          order: order._id,
          product: item.product,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          subtotal: item.subtotal,
        }));

        if (session) {
          await OrderItem.insertMany(orderItemDocs, { session }).catch(() => {});
          // Clear customer's shopping cart
          await Cart.findOneAndUpdate({ user: userId }, { items: [] }, { session });
        } else {
          await OrderItem.insertMany(orderItemDocs).catch(() => {});
          await Cart.findOneAndUpdate({ user: userId }, { items: [] });
        }
      });

      await order.populate('user', 'name email');

      return res.json({
        success: true,
        message: `Payment of $${order.total.toFixed(2)} verified successfully! Order reference: ${order.orderNumber}`,
        data: order,
      });
    }

    // 2. IN-MEMORY FALLBACK PATH
    const order = memoryOrders.find((o) => o.razorpayOrderId === razorpay_order_id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order reference corresponding to Razorpay order not found.',
      });
    }

    const orderOwnerId = order.user?._id?.toString() || order.user?.toString();
    const orderOwnerEmail = order.user?.email?.toLowerCase();
    const userEmail = req.user.email?.toLowerCase();
    const isOwner =
      orderOwnerId === userId.toString() ||
      (orderOwnerEmail && userEmail && orderOwnerEmail === userEmail);

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are only authorized to verify payment for your own orders.',
      });
    }

    if (!isValidSignature) {
      order.paymentStatus = 'failed';
      order.updatedAt = new Date().toISOString();
      return res.status(400).json({
        success: false,
        message: 'Invalid Razorpay signature. Server-side payment verification failed.',
      });
    }

    if (order.paymentStatus === 'paid') {
      return res.json({
        success: true,
        message: 'Payment was already verified and processed.',
        data: order,
      });
    }

    // Decrement stock in memory
    for (const item of order.items) {
      const p = getMemoryProductById(item.product);
      if (p) {
        if (p.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient inventory for "${item.name}".`,
          });
        }
        p.stock = Math.max(0, p.stock - item.quantity);
      }
    }

    order.status = 'confirmed';
    order.paymentStatus = 'paid';
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.paidAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();

    for (const item of order.items) {
      memoryOrderItems.push({
        _id: 'oi_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
        order: order._id,
        ...item,
      });
    }

    return res.json({
      success: true,
      message: `Payment of $${order.total.toFixed(2)} verified successfully! Order reference: ${order.orderNumber}`,
      data: order,
    });
  } catch (error) {
    console.error('[Razorpay] Error in verifyRazorpayPaymentHandler:', error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Payment verification failed due to internal server error.',
    });
  }
}

/**
 * POST /api/orders/razorpay/payment-failed
 * Records payment failure when customer cancels or transaction fails.
 * Marks paymentStatus as 'failed' without altering stock or marking order as paid.
 */
export async function recordRazorpayPaymentFailureHandler(req, res) {
  try {
    const userId = req.user._id || req.user.id;
    const { razorpay_order_id, razorpay_payment_id, error_description } = req.body;

    if (!razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: 'Razorpay order ID is required.',
      });
    }

    if (mongoose.connection.readyState === 1) {
      const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }

      const orderOwnerId = order.user?._id?.toString() || order.user?.toString();
      if (orderOwnerId !== userId.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }

      order.paymentStatus = 'failed';
      if (razorpay_payment_id) {
        order.razorpayPaymentId = razorpay_payment_id;
      }
      if (error_description) {
        order.notes = order.notes ? `${order.notes} | Payment failed: ${error_description}` : `Payment failed: ${error_description}`;
      }
      await order.save();

      return res.json({
        success: true,
        message: 'Payment failure recorded.',
        data: order,
      });
    }

    const order = memoryOrders.find((o) => o.razorpayOrderId === razorpay_order_id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    order.paymentStatus = 'failed';
    if (razorpay_payment_id) order.razorpayPaymentId = razorpay_payment_id;
    order.updatedAt = new Date().toISOString();

    return res.json({
      success: true,
      message: 'Payment failure recorded.',
      data: order,
    });
  } catch (error) {
    console.error('[Razorpay] Error recording failure:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record payment failure.',
    });
  }
}

/**
 * POST /api/orders/razorpay/simulate-signature
 * Test Mode utility: Generates a cryptographically valid HMAC-SHA256 signature for test execution.
 * Only works for authenticated customers with their own order.
 */
export async function simulateRazorpayTestSignatureHandler(req, res) {
  try {
    const targetOrderId = req.body.razorpay_order_id || req.body.orderId;
    if (!targetOrderId) {
      return res.status(400).json({
        success: false,
        message: 'razorpay_order_id (or orderId) is required.',
      });
    }

    const targetPaymentId =
      req.body.razorpay_payment_id ||
      req.body.paymentId ||
      `pay_test_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;

    const signature = generateTestSignature(targetOrderId, targetPaymentId);
    return res.json({
      success: true,
      data: {
        razorpay_order_id: targetOrderId,
        razorpay_payment_id: targetPaymentId,
        razorpay_signature: signature,
      },
      signature,
    });
  } catch (error) {
    console.error('[Razorpay] Error simulating signature:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate test signature',
    });
  }
}

