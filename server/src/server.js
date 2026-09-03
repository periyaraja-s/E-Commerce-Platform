import 'dotenv/config';
import app from './app.js';
import { connectDatabase } from './config/database.js';

const port = Number(process.env.PORT) || 5000;

try {
  await connectDatabase(process.env.MONGODB_URI);
  app.listen(port, () => {
    console.log(`API running on http://localhost:${port}`);
  });
} catch (error) {
  console.error('Failed to start server:', error.message);
  process.exit(1);
}
