import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  createOrder,
  listOrders,
  getOrderById,
  updateOrderStatus,
  getRazorpayConfigHandler,
  getAdminPaymentSettingsHandler,
  createRazorpayOrderHandler,
  verifyRazorpayPaymentHandler,
  recordRazorpayPaymentFailureHandler,
  simulateRazorpayTestSignatureHandler,
  handleRazorpayWebhook,
} from '../controllers/orderController.js';

const router = Router();

// --- Public / Gateway Webhook Routes (Must precede protect middleware) ---
// Public-safe Razorpay gateway configuration
router.get('/razorpay/config', getRazorpayConfigHandler);

// Razorpay asynchronous payment webhook (Secured via cryptographic x-razorpay-signature header)
router.post('/razorpay/webhook', handleRazorpayWebhook);

// All subsequent customer & administrative order operations require authentication
router.use(protect);

// Admin-only Payment Settings
router.get('/razorpay/admin-settings', authorize('admin'), getAdminPaymentSettingsHandler);

// Customer: Initiate Razorpay payment order
router.post('/razorpay/create-order', authorize('customer'), createRazorpayOrderHandler);

// Customer: Verify Razorpay payment signature and confirm paid order
router.post('/razorpay/verify-payment', authorize('customer'), verifyRazorpayPaymentHandler);

// Customer: Record payment failure / dismissal
router.post('/razorpay/payment-failed', authorize('customer'), recordRazorpayPaymentFailureHandler);

// Test Mode: Simulate payment signature for test suite / sandbox testing
router.post('/razorpay/simulate-signature', authorize('customer'), simulateRazorpayTestSignatureHandler);

// --- Standard Order Operations ---
// Customer checkout & standard order creation (Cash on Delivery)
router.post('/', authorize('customer'), createOrder);

// List orders (customer gets their own; admin gets all)
router.get('/', listOrders);

// Single order details by ID or orderNumber
router.get('/:id', getOrderById);

// Admin-only order status updates
router.patch('/:id/status', authorize('admin'), updateOrderStatus);

export default router;
