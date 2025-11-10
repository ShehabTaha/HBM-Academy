import mongoose from "mongoose";

// Track connection status
let isConnected = false;

/**
 * Establishes connection to MongoDB database
 * Uses connection pooling and caching for optimal performance
 */
export async function connectDB(): Promise<void> {
  // If already connected, return early
  if (isConnected) {
    console.log("📦 Using existing MongoDB connection");
    return;
  }

  // Check if MONGODB_URI is defined
  if (!process.env.MONGODB_URI) {
    throw new Error(
      "❌ Please define MONGODB_URI environment variable in .env.local"
    );
  }

  try {
    // Set mongoose options for better performance and stability
    mongoose.set("strictQuery", true);

    // Connect to MongoDB
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || "hbm-academy",
      // Connection pool settings
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      // Retry settings
      retryWrites: true,
      retryReads: true,
    });

    isConnected = db.connections[0].readyState === 1;

    if (isConnected) {
      console.log("✅ MongoDB connected successfully");
      console.log(`📊 Database: ${db.connections[0].name}`);
    }

    // Handle connection events
    mongoose.connection.on("connected", () => {
      console.log("🔗 Mongoose connected to MongoDB");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ Mongoose connection error:", err);
      isConnected = false;
    });

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ Mongoose disconnected from MongoDB");
      isConnected = false;
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("👋 MongoDB connection closed due to app termination");
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    isConnected = false;
    throw error;
  }
}

/**
 * Disconnects from MongoDB database
 * Useful for testing and cleanup
 */
export async function disconnectDB(): Promise<void> {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log("👋 MongoDB disconnected successfully");
  } catch (error) {
    console.error("❌ Error disconnecting from MongoDB:", error);
    throw error;
  }
}

/**
 * Returns the current connection status
 */
export function getConnectionStatus(): boolean {
  return isConnected;
}

/**
 * Returns mongoose connection instance
 */
export function getConnection() {
  return mongoose.connection;
}

export default connectDB;
