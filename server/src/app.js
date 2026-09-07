import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'E-Commerce API is running',
  });
});

// CRITICAL route-level fallback: Add Express error middleware in app.js
// to handle database queries failing gracefully when MongoDB is offline
app.use((err, req, res, _next) => {
  if (err.name === 'MongooseError' || err.name === 'MongoNetworkError' || err.message?.includes('buffering timed out')) {
    console.warn('[AI Studio] Database offline — returning mock empty response');
    if (req.method === 'GET') {
      return res.json(req.path.endsWith('s') || req.path.endsWith('s/') ? [] : {});
    }
    return res.status(503).json({ error: 'Service temporarily unavailable (database offline)' });
  }

  console.error('[AI Studio] Unhandled route error:', err);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' });
});

export default app;
