const { MongoMemoryServer } = require('mongodb-memory-server');
const { connectDB, disconnectDB } = require('../src/config/db');

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await connectDB(mongod.getUri());
});

afterAll(async () => {
  await disconnectDB();
  await mongod.stop();
});

afterEach(async () => {
  // Clear all collections between tests for isolation
  const mongoose = require('mongoose');
  const collections = mongoose.connection.collections;
  await Promise.all(
    Object.values(collections).map((col) => col.deleteMany({}))
  );
});
