import mongoose from "mongoose";

// Define the connection cache type
type MongooseCache = {
  connectionEstablished: typeof mongoose | null;
  promiseConnection: Promise<typeof mongoose> | null;
};

// Extend the global object to include our mongoose cache
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

// Initialize the cache on the global object to persist across hot reloads in development
const cachedConnection: MongooseCache = global.mongoose || {
  connectionEstablished: null,
  promiseConnection: null,
};

if (!global.mongoose) {
  global.mongoose = cachedConnection;
}

/**
 * Establishes a connection to MongoDB using Mongoose.
 * Caches the connection to prevent multiple connections during development hot reloads.
 * @returns Promise resolving to the Mongoose instance
 */
async function connectDB(): Promise<typeof mongoose> {
  // Return existing connection if available
  if (cachedConnection.connectionEstablished) {
    return cachedConnection.connectionEstablished;
  }

  // Return existing connection promise if one is in progress
  if (!cachedConnection.promiseConnection) {
    // Validate MongoDB URI exists
    if (!MONGODB_URI) {
      throw new Error(
        "Please define the MONGODB_URI environment variable inside .env.local",
      );
    }
    const connectionConfiguration = {
      bufferCommands: false, // Disable Mongoose buffering
    };

    // Create a new connection promise
    cachedConnection.promiseConnection = mongoose
      .connect(MONGODB_URI!, connectionConfiguration)
      .then((connectedMongooseInstance) => {
        return connectedMongooseInstance;
      });
  }

  try {
    // Wait for the connection to establish
    cachedConnection.connectionEstablished =
      await cachedConnection.promiseConnection;
  } catch (error) {
    // Reset promise on error to allow retry
    cachedConnection.promiseConnection = null;
    throw error;
  }

  return cachedConnection.connectionEstablished;
}

export default connectDB;
