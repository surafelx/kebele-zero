const request = require('supertest');
const app = require('../src/app');
const { createUser } = require('./helpers');

describe('Auth API', () => {
  // ── POST /api/auth/register ─────────────────────────────────────────────

  describe('POST /api/auth/register', () => {
    it('registers a new user and returns a token', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: 'alice',
        email: 'alice@example.com',
        password: 'secret123',
      });
      expect(res.status).toBe(201);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('alice@example.com');
      expect(res.body.user.passwordHash).toBeUndefined();
    });

    it('defaults new user role to "user"', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: 'bob',
        email: 'bob@example.com',
        password: 'secret123',
      });
      expect(res.body.user.role).toBe('user');
    });

    it('returns 409 when email already exists', async () => {
      await createUser({ username: 'charlie', email: 'charlie@example.com' });
      const res = await request(app).post('/api/auth/register').send({
        username: 'charlie2',
        email: 'charlie@example.com',
        password: 'secret123',
      });
      expect(res.status).toBe(409);
    });

    it('returns 409 when username already exists', async () => {
      await createUser({ username: 'dave', email: 'dave@example.com' });
      const res = await request(app).post('/api/auth/register').send({
        username: 'dave',
        email: 'different@example.com',
        password: 'secret123',
      });
      expect(res.status).toBe(409);
    });

    it('returns 422 for invalid email', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: 'eve',
        email: 'not-an-email',
        password: 'secret123',
      });
      expect(res.status).toBe(422);
      expect(res.body.errors).toBeDefined();
    });

    it('returns 422 when password is too short', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: 'frank',
        email: 'frank@example.com',
        password: '123',
      });
      expect(res.status).toBe(422);
    });

    it('returns 422 when username is too short', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: 'ab',
        email: 'ab@example.com',
        password: 'secret123',
      });
      expect(res.status).toBe(422);
    });

    it('creates a UserPoints record on registration', async () => {
      const UserPoints = require('../src/models/UserPoints');
      const res = await request(app).post('/api/auth/register').send({
        username: 'grace',
        email: 'grace@example.com',
        password: 'secret123',
      });
      const points = await UserPoints.findOne({ userId: res.body.user._id });
      expect(points).not.toBeNull();
      expect(points.totalPoints).toBe(0);
    });
  });

  // ── POST /api/auth/login ────────────────────────────────────────────────

  describe('POST /api/auth/login', () => {
    it('logs in with correct credentials and returns a token', async () => {
      await createUser({ username: 'hank', email: 'hank@example.com', password: 'mypassword' });
      const res = await request(app).post('/api/auth/login').send({
        email: 'hank@example.com',
        password: 'mypassword',
      });
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('hank@example.com');
    });

    it('returns 401 for wrong password', async () => {
      await createUser({ username: 'iris', email: 'iris@example.com', password: 'correctpass' });
      const res = await request(app).post('/api/auth/login').send({
        email: 'iris@example.com',
        password: 'wrongpass',
      });
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid credentials');
    });

    it('returns 401 for non-existent email', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'nobody@example.com',
        password: 'anypassword',
      });
      expect(res.status).toBe(401);
    });

    it('never returns passwordHash in the response', async () => {
      await createUser({ username: 'jack', email: 'jack@example.com', password: 'pass123' });
      const res = await request(app).post('/api/auth/login').send({
        email: 'jack@example.com',
        password: 'pass123',
      });
      expect(res.body.user.passwordHash).toBeUndefined();
    });

    it('returns 422 for invalid email format', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'bad',
        password: 'pass123',
      });
      expect(res.status).toBe(422);
    });
  });

  // ── GET /api/auth/me ────────────────────────────────────────────────────

  describe('GET /api/auth/me', () => {
    it('returns the current user when authenticated', async () => {
      const { token } = await createUser({ username: 'karen', email: 'karen@example.com' });
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('karen@example.com');
    });

    it('returns 401 without a token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('returns 401 with a malformed token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer not.a.valid.token');
      expect(res.status).toBe(401);
    });
  });

  // ── POST /api/auth/logout ───────────────────────────────────────────────

  describe('POST /api/auth/logout', () => {
    it('returns success message when authenticated', async () => {
      const { token } = await createUser({ username: 'leo', email: 'leo@example.com' });
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/logged out/i);
    });

    it('returns 401 without a token', async () => {
      const res = await request(app).post('/api/auth/logout');
      expect(res.status).toBe(401);
    });
  });
});
