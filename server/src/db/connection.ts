import mongoose from 'mongoose';

// Connection state mapping for better readability
const CONNECTION_STATES = {
  0: 'disconnected',
  1: 'connected', 
  2: 'connecting',
  3: 'disconnecting'
} as const;

/**
 * Connect to MongoDB database
 * Handles reconnection and prevents duplicate connections
 */
export async function connectToDatabase(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  const currentState = mongoose.connection.readyState;
  
  // Skip if already connected or connecting
  if (currentState === 1 || currentState === 2) {
    console.log(`📌 Database already ${CONNECTION_STATES[currentState as keyof typeof CONNECTION_STATES]}`);
    return;
  }

  try {
    await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    
    console.log(`✅ Connected to MongoDB: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
}

/**
 * Get current database connection status
 */
export function getDatabaseStatus() {
  const state = mongoose.connection.readyState;
  const label = CONNECTION_STATES[state as keyof typeof CONNECTION_STATES] || 'unknown';
  
  return {
    state,
    label,
    isConnected: state === 1,
    databaseName: mongoose.connection.name || null
  };
}
