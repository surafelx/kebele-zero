require('dotenv').config();

module.exports = {
  port: process.env.PORT || 4000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/kebele-zero',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  nodeEnv: process.env.NODE_ENV || 'development',
};
