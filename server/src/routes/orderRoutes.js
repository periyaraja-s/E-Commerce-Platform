import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  createOrder,
  listOrders,
  getOrderById,
  updateOrderStatus,
} from '../controllers/orderController.js';

const router = Router();

// All order operations require authentication
router.use(protect);

// Customer checkout & order creation
router.post('/', authorize('customer'), createOrder);

// List orders (customer gets their own; admin gets all)
router.get('/', listOrders);

// Single order details by ID or orderNumber
router.get('/:id', getOrderById);

// Admin-only order status updates
router.patch('/:id/status', authorize('admin'), updateOrderStatus);

export default router;
