import mongoose from 'mongoose';

export async function connectDatabase(uri) {
  // CRITICAL: fail fast, don't hang when database is offline
  mongoose.set('bufferCommands', false);

  if (!uri) {
    console.warn('[AI Studio] MONGODB_URI is not configured — running with fallback mock data');
    return;
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.warn('[AI Studio] MongoDB connection failed — running with fallback mock data:', err.message);
  }
}

