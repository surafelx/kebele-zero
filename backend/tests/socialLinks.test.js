const request = require('supertest');
const app = require('../src/app');
const { createUser, createAdmin } = require('./helpers');

const validLink = (overrides = {}) => ({
  platform: 'twitter',
  label: 'Follow us',
  url: 'https://twitter.com/kebele',
  ...overrides,
});

describe('Social Links API', () => {
  // ── GET /api/social-links ───────────────────────────────────────────────

  describe('GET /api/social-links', () => {
    it('returns an empty array initially (public)', async () => {
      const res = await request(app).get('/api/social-links');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('returns links sorted by displayOrder', async () => {
      const { token } = await createAdmin();
      await request(app).post('/api/social-links').set('Authorization', `Bearer ${token}`)
        .send(validLink({ platform: 'github', displayOrder: 2 }));
      await request(app).post('/api/social-links').set('Authorization', `Bearer ${token}`)
        .send(validLink({ platform: 'twitter', displayOrder: 1 }));

      const res = await request(app).get('/api/social-links');
      expect(res.body.length).toBe(2);
      expect(res.body[0].platform).toBe('twitter'); // lower displayOrder first
    });
  });

  // ── POST /api/social-links ──────────────────────────────────────────────

  describe('POST /api/social-links', () => {
    it('lets an admin create a link', async () => {
      const { token } = await createAdmin();
      const res = await request(app)
        .post('/api/social-links')
        .set('Authorization', `Bearer ${token}`)
        .send(validLink());
      expect(res.status).toBe(201);
      expect(res.body.platform).toBe('twitter');
      expect(res.body.isActive).toBe(true);
    });

    it('returns 403 for a non-admin', async () => {
      const { token } = await createUser({ username: 'sl1', email: 'sl1@e.com' });
      const res = await request(app)
        .post('/api/social-links')
        .set('Authorization', `Bearer ${token}`)
        .send(validLink());
      expect(res.status).toBe(403);
    });

    it('returns 401 without a token', async () => {
      const res = await request(app).post('/api/social-links').send(validLink());
      expect(res.status).toBe(401);
    });
  });

  // ── PUT /api/social-links/:id ───────────────────────────────────────────

  describe('PUT /api/social-links/:id', () => {
    it('lets an admin update a link', async () => {
      const { token } = await createAdmin();
      const created = await request(app).post('/api/social-links')
        .set('Authorization', `Bearer ${token}`).send(validLink());

      const res = await request(app)
        .put(`/api/social-links/${created.body._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ label: 'Updated label', isActive: false });
      expect(res.status).toBe(200);
      expect(res.body.label).toBe('Updated label');
      expect(res.body.isActive).toBe(false);
    });

    it('returns 404 for a non-existent link', async () => {
      const { token } = await createAdmin();
      const res = await request(app)
        .put('/api/social-links/64f1234567890abcdef12345')
        .set('Authorization', `Bearer ${token}`)
        .send({ label: 'x' });
      expect(res.status).toBe(404);
    });
  });

  // ── DELETE /api/social-links/:id ────────────────────────────────────────

  describe('DELETE /api/social-links/:id', () => {
    it('lets an admin delete a link', async () => {
      const { token } = await createAdmin();
      const created = await request(app).post('/api/social-links')
        .set('Authorization', `Bearer ${token}`).send(validLink());

      const res = await request(app)
        .delete(`/api/social-links/${created.body._id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });

    it('returns 404 for a non-existent link', async () => {
      const { token } = await createAdmin();
      const res = await request(app)
        .delete('/api/social-links/64f1234567890abcdef12345')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });

    it('returns 403 for a non-admin', async () => {
      const { token: adminToken } = await createAdmin();
      const { token: userToken } = await createUser({ username: 'sl2', email: 'sl2@e.com' });
      const created = await request(app).post('/api/social-links')
        .set('Authorization', `Bearer ${adminToken}`).send(validLink());

      const res = await request(app)
        .delete(`/api/social-links/${created.body._id}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(403);
    });
  });
});
