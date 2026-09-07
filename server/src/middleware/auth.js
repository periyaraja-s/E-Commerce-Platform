import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { getMemoryUserById } from '../controllers/authController.js';

const DEFAULT_SECRET = 'ecommerce-platform-dev-secret-key-2026';

export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const token = header.split(' ')[1];
    const secret = process.env.JWT_SECRET || DEFAULT_SECRET;
    const decoded = jwt.verify(token, secret);

    let user = null;
    if (mongoose.connection.readyState === 1) {
      user = await User.findById(decoded.userId).select('-password');
    } else {
      user = getMemoryUserById(decoded.userId);
    }

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User is not available' });
    }

    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'You do not have permission to perform this action' });
    }

    return next();
  };
}
