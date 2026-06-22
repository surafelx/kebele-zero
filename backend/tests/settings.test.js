const request = require('supertest');
const app = require('../src/app');
const { createUser, createAdmin } = require('./helpers');

describe('Settings API', () => {
  // ── GET /api/settings ───────────────────────────────────────────────────

  describe('GET /api/settings', () => {
    it('returns defaults when no settings exist (public)', async () => {
      const res = await request(app).get('/api/settings');
      expect(res.status).toBe(200);
      expect(res.body.siteName).toBe('Kebele Zero');
      expect(res.body.maintenanceMode).toBe(false);
    });

    it('returns saved settings once they exist', async () => {
      const { token } = await createAdmin();
      await request(app)
        .put('/api/settings')
        .set('Authorization', `Bearer ${token}`)
        .send({ siteName: 'My Kebele', maintenanceMode: true });

      const res = await request(app).get('/api/settings');
      expect(res.body.siteName).toBe('My Kebele');
      expect(res.body.maintenanceMode).toBe(true);
    });
  });

  // ── PUT /api/settings ───────────────────────────────────────────────────

  describe('PUT /api/settings', () => {
    it('lets an admin save settings (upsert)', async () => {
      const { token } = await createAdmin();
      const res = await request(app)
        .put('/api/settings')
        .set('Authorization', `Bearer ${token}`)
        .send({ siteName: 'Updated Site', contactEmail: 'hi@kebele.com' });
      expect(res.status).toBe(200);
      expect(res.body.siteName).toBe('Updated Site');
      expect(res.body.contactEmail).toBe('hi@kebele.com');
    });

    it('keeps a single settings document on repeated saves', async () => {
      const { token } = await createAdmin();
      await request(app).put('/api/settings').set('Authorization', `Bearer ${token}`).send({ siteName: 'A' });
      await request(app).put('/api/settings').set('Authorization', `Bearer ${token}`).send({ siteName: 'B' });

      const SiteSettings = require('../src/models/SiteSettings');
      const count = await SiteSettings.countDocuments();
      expect(count).toBe(1);
    });

    it('returns 403 for a non-admin user', async () => {
      const { token } = await createUser({ username: 'su1', email: 'su1@e.com' });
      const res = await request(app)
        .put('/api/settings')
        .set('Authorization', `Bearer ${token}`)
        .send({ siteName: 'Hacked' });
      expect(res.status).toBe(403);
    });

    it('returns 401 without a token', async () => {
      const res = await request(app).put('/api/settings').send({ siteName: 'Nope' });
      expect(res.status).toBe(401);
    });
  });
});
