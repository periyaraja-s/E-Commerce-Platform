import { Router } from 'express';
import { authorize, protect } from '../middleware/auth.js';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  syncCart,
} from '../controllers/cartController.js';

const router = Router();

// All cart operations require authentication and customer role
router.use(protect, authorize('customer'));

router.get('/', getCart);
router.post('/items', addToCart);
router.put('/items/:productId', updateCartItem);
router.delete('/items/:productId', removeCartItem);
router.delete('/', clearCart);
router.post('/sync', syncCart);

export default router;
