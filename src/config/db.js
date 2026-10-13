import mongoose from 'mongoose';

export async function connectDatabase(uri) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, {
    autoIndex: process.env.NODE_ENV !== 'production',
    maxPoolSize: Number.parseInt(process.env.MONGO_MAX_POOL_SIZE || '20', 10),
    minPoolSize: Number.parseInt(process.env.MONGO_MIN_POOL_SIZE || '2', 10),
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });
  console.log(`MongoDB connected: ${mongoose.connection.name}`);
  return mongoose.connection;
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
