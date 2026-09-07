import mongoose from 'mongoose';

export async function connectDatabase(uri) {
  // CRITICAL: fail fast, don't hang when database is offline
  mongoose.set('bufferCommands', false);

  if (!uri) {
    console.warn('[AI Studio] MONGODB_URI is not configured — running with fallback mock data');
    return;
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });
  console.log('MongoDB connected');
}

