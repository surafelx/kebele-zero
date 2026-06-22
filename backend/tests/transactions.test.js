const request = require('supertest');
const app = require('../src/app');
const { createUser, createAdmin } = require('./helpers');

describe('Transactions API', () => {
  // ── POST /api/transactions ──────────────────────────────────────────────

  describe('POST /api/transactions', () => {
    it('lets any authenticated user create a transaction', async () => {
      const { user, token } = await createUser({ username: 'tx1', email: 'tx1@e.com' });
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 50, description: 'Test', status: 'completed' });
      expect(res.status).toBe(201);
      expect(res.body.amount).toBe(50);
      expect(String(res.body.userId)).toBe(String(user._id));
    });

    it('returns 400 when amount is missing', async () => {
      const { token } = await createUser({ username: 'tx2', email: 'tx2@e.com' });
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'No amount' });
      expect(res.status).toBe(400);
    });

    it('returns 401 without a token', async () => {
      const res = await request(app).post('/api/transactions').send({ amount: 10 });
      expect(res.status).toBe(401);
    });
  });

  // ── GET /api/transactions ───────────────────────────────────────────────

  describe('GET /api/transactions', () => {
    it('lets an admin list all transactions', async () => {
      const { token: userToken } = await createUser({ username: 'tx3', email: 'tx3@e.com' });
      const { token: adminToken } = await createAdmin();
      await request(app).post('/api/transactions').set('Authorization', `Bearer ${userToken}`).send({ amount: 25 });

      const res = await request(app).get('/api/transactions').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('returns 403 for a non-admin', async () => {
      const { token } = await createUser({ username: 'tx4', email: 'tx4@e.com' });
      const res = await request(app).get('/api/transactions').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
    });

    it('returns 401 without a token', async () => {
      const res = await request(app).get('/api/transactions');
      expect(res.status).toBe(401);
    });
  });

  // ── DELETE /api/transactions/:id ────────────────────────────────────────

  describe('DELETE /api/transactions/:id', () => {
    it('lets an admin delete a transaction', async () => {
      const { token: userToken } = await createUser({ username: 'tx5', email: 'tx5@e.com' });
      const { token: adminToken } = await createAdmin();
      const created = await request(app)
        .post('/api/transactions').set('Authorization', `Bearer ${userToken}`).send({ amount: 99 });

      const res = await request(app)
        .delete(`/api/transactions/${created.body._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });

    it('returns 404 for a non-existent transaction', async () => {
      const { token } = await createAdmin();
      const res = await request(app)
        .delete('/api/transactions/64f1234567890abcdef12345')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });
  });
});
