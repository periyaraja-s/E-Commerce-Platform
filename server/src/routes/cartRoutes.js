import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  syncCart,
} from '../controllers/cartController.js';

const router = Router();

// All cart operations require authentication and customer/admin access to their own cart
router.use(protect);

router.get('/', getCart);
router.post('/items', addToCart);
router.put('/items/:productId', updateCartItem);
router.delete('/items/:productId', removeCartItem);
router.delete('/', clearCart);
router.post('/sync', syncCart);

export default router;
