const mongoose = require('mongoose');

mongoose.set('strictQuery', true);

async function connectDB(uri) {
  const mongoUri = uri || process.env.MONGODB_URI;
  await mongoose.connect(mongoUri);
  if (process.env.NODE_ENV !== 'test') {
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
  }
}

async function disconnectDB() {
  await mongoose.disconnect();
}

module.exports = { connectDB, disconnectDB };
