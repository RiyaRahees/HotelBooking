import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDB = async (): Promise<typeof mongoose | null> => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);

    // Connection lifecycle listeners
    mongoose.connection.on('error', (err) => {
      console.error('[MongoDB Event] Connection error occurred:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB Event] Disconnected from MongoDB server.');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('[MongoDB Event] Reconnected to MongoDB server.');
    });

    return conn;
  } catch (error: any) {
    console.warn(`[MongoDB Warning] Could not connect to primary MongoDB URI (${env.MONGODB_URI}): ${error.message}`);
    console.warn(`[MongoDB Notice] Ensure MongoDB is running on ${env.MONGODB_URI} or set MONGODB_URI in backend/.env`);
    return null;
  }
};

export const closeDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    console.log('[MongoDB] Connection closed gracefully through app termination.');
  } catch (err: any) {
    console.error('[MongoDB Error] Error while closing connection:', err.message);
  }
};
