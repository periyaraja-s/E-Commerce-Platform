import { Router } from 'express';
import { getCustomerDashboard, getAdminDashboard } from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

// Customer dashboard: any authenticated user (customer or admin)
router.get('/customer', protect, getCustomerDashboard);

// Admin dashboard: strictly admin role authorization
router.get('/admin', protect, authorize('admin'), getAdminDashboard);

export default router;
