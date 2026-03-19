import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Use the provided connection string in production / CI.
// For local development (or when no MONGODB_URI is provided),
// spin up an in-memory MongoDB instance so the app can run without network.
const MONGODB_URI = process.env.MONGODB_URI;

let mongoMemoryServer: MongoMemoryServer | null = null;

async function getConnectionString() {
  if (MONGODB_URI) return MONGODB_URI;

  if (!mongoMemoryServer) {
    mongoMemoryServer = await MongoMemoryServer.create();
  }

  const uri = mongoMemoryServer.getUri();

  // Ensure other modules can access this without calling getConnectionString again.
  process.env.MONGODB_URI = uri;

  return uri;
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = getConnectionString().then((uri) =>
      mongoose.connect(uri, opts)
    );
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;