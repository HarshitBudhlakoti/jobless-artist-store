const mongoose = require('mongoose');

let cached = global.__mongooseConnection;
if (!cached) {
  cached = global.__mongooseConnection = { conn: null, promise: null };
}

const connectDB = async () => {
  // Reuse existing connection on warm Vercel invocations
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      })
      .then((conn) => {
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
      })
      .catch((error) => {
        cached.promise = null;
        console.error(`MongoDB connection error: ${error.message}`);
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

module.exports = connectDB;
