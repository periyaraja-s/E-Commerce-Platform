import 'dotenv/config';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import express from 'express';
import app from './app.js';
import { connectDatabase } from './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');
const clientDir = path.resolve(rootDir, 'client');
const clientDist = path.resolve(clientDir, 'dist');

const port = 3000;

if (process.env.MONGODB_URI) {
  connectDatabase(process.env.MONGODB_URI)
    .then(async () => {
      try {
        const { seedInitialData } = await import('./utils/seedData.js');
        await seedInitialData();
      } catch (seedErr) {
        console.warn('[AI Studio] Database seed notice:', seedErr.message);
      }
    })
    .catch((error) => {
      console.warn('[AI Studio] Database initialization notice:', error.message);
    });
}

// Development: mount Vite middleware for seamless live SPA serving
if (process.env.NODE_ENV !== 'production') {
  try {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      root: clientDir,
      server: {
        middlewareMode: true,
        hmr: false,
        ws: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } catch (err) {
    console.warn('[AI Studio] Vite middleware startup note:', err.message);
    if (fs.existsSync(clientDist)) {
      app.use(express.static(clientDist));
      app.use((req, res, next) => {
        if (req.method === 'GET' && !req.path.startsWith('/api')) {
          return res.sendFile(path.join(clientDist, 'index.html'));
        }
        next();
      });
    }
  }
} else {
  // Production: serve built static files with SPA fallback
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.use((req, res, next) => {
      if (req.method === 'GET' && !req.path.startsWith('/api')) {
        return res.sendFile(path.join(clientDist, 'index.html'));
      }
      next();
    });
  }
}

app.listen(port, '0.0.0.0', () => {
  console.log(`E-Commerce server running on port ${port} (0.0.0.0)`);
});
