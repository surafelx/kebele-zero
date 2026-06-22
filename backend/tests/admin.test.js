const request = require('supertest');
const app = require('../src/app');
const { createUser, createAdmin } = require('./helpers');

describe('Admin API', () => {
  // ── GET /api/admin/stats ────────────────────────────────────────────────

  describe('GET /api/admin/stats', () => {
    it('returns the total* stat fields for an admin', async () => {
      const { token } = await createAdmin();
      const res = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      // total* fields consumed by the dashboard
      for (const key of ['totalUsers', 'totalEvents', 'totalProducts', 'totalMedia',
        'totalRadio', 'totalPosts', 'totalComments', 'totalTransactions',
        'totalGames', 'totalRevenue']) {
        expect(res.body).toHaveProperty(key);
      }
      expect(res.body.paymentRequests).toHaveProperty('pending');
    });

    it('counts at least the admin in totalUsers', async () => {
      const { token } = await createAdmin();
      const res = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${token}`);
      expect(res.body.totalUsers).toBeGreaterThanOrEqual(1);
    });

    it('returns 403 for a non-admin', async () => {
      const { token } = await createUser({ username: 'ad1', email: 'ad1@e.com' });
      const res = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
    });

    it('returns 401 without a token', async () => {
      const res = await request(app).get('/api/admin/stats');
      expect(res.status).toBe(401);
    });
  });

  // ── GET /api/admin/users ────────────────────────────────────────────────

  describe('GET /api/admin/users', () => {
    it('lists all users for an admin', async () => {
      await createUser({ username: 'ad2', email: 'ad2@e.com' });
      const { token } = await createAdmin();
      const res = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });

    it('returns 403 for a non-admin', async () => {
      const { token } = await createUser({ username: 'ad3', email: 'ad3@e.com' });
      const res = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
    });
  });

  // ── PUT /api/admin/users/:id/role ───────────────────────────────────────

  describe('PUT /api/admin/users/:id/role', () => {
    it('lets an admin promote a user to moderator', async () => {
      const { user } = await createUser({ username: 'ad4', email: 'ad4@e.com' });
      const { token } = await createAdmin();
      const res = await request(app)
        .put(`/api/admin/users/${user._id}/role`)
        .set('Authorization', `Bearer ${token}`)
        .send({ role: 'moderator' });
      expect(res.status).toBe(200);
      expect(res.body.role).toBe('moderator');
    });

    it('returns 404 for a non-existent user', async () => {
      const { token } = await createAdmin();
      const res = await request(app)
        .put('/api/admin/users/64f1234567890abcdef12345/role')
        .set('Authorization', `Bearer ${token}`)
        .send({ role: 'admin' });
      expect(res.status).toBe(404);
    });

    it('returns 403 for a non-admin', async () => {
      const { user, token } = await createUser({ username: 'ad5', email: 'ad5@e.com' });
      const res = await request(app)
        .put(`/api/admin/users/${user._id}/role`)
        .set('Authorization', `Bearer ${token}`)
        .send({ role: 'admin' });
      expect(res.status).toBe(403);
    });
  });

  // ── DELETE /api/admin/users/:id ─────────────────────────────────────────

  describe('DELETE /api/admin/users/:id', () => {
    it('lets an admin delete a user', async () => {
      const { user } = await createUser({ username: 'ad6', email: 'ad6@e.com' });
      const { token } = await createAdmin();
      const res = await request(app)
        .delete(`/api/admin/users/${user._id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });

    it('returns 404 for a non-existent user', async () => {
      const { token } = await createAdmin();
      const res = await request(app)
        .delete('/api/admin/users/64f1234567890abcdef12345')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });
  });
});
