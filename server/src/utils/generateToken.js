import jwt from 'jsonwebtoken';

const DEFAULT_SECRET = 'ecommerce-platform-dev-secret-key-2026';

export function generateToken(userId) {
  const secret = process.env.JWT_SECRET || DEFAULT_SECRET;

  return jwt.sign({ userId }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}
