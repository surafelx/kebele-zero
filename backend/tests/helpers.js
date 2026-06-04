const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const UserPoints = require('../src/models/UserPoints');

/**
 * Create a user in the DB and return { user, token } for use in tests.
 */
async function createUser(overrides = {}) {
  const data = {
    username: overrides.username || 'testuser',
    email: overrides.email || 'test@example.com',
    password: overrides.password || 'password123',
    role: overrides.role || 'user',
  };

  const res = await request(app).post('/api/auth/register').send(data);
  if (res.status !== 201) {
    throw new Error(`createUser failed: ${JSON.stringify(res.body)}`);
  }

  // If we need admin role, update it directly in the DB
  if (data.role === 'admin') {
    await User.findByIdAndUpdate(res.body.user._id, { role: 'admin' });
    // Re-login to get a token with the updated role
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: data.email, password: data.password });
    return { user: login.body.user, token: login.body.token };
  }

  return { user: res.body.user, token: res.body.token };
}

/**
 * Create an admin user.
 */
async function createAdmin(overrides = {}) {
  return createUser({ username: 'admin', email: 'admin@example.com', ...overrides, role: 'admin' });
}

module.exports = { createUser, createAdmin };
