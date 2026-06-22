// Mock Cloudinary so media-delete cleanup never hits the real API.
jest.mock('../src/config/cloudinary', () => ({
  cloudinary: {
    uploader: { destroy: jest.fn().mockResolvedValue({ result: 'ok' }) },
  },
  isConfigured: () => true,
}));

const request = require('supertest');
const app = require('../src/app');
const { createUser, createAdmin } = require('./helpers');
const { cloudinary } = require('../src/config/cloudinary');

describe('Content API', () => {
  // ── Events ─────────────────────────────────────────────────────────────

  describe('Events', () => {
    it('GET /api/events returns an empty array initially', async () => {
      const res = await request(app).get('/api/events');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('admin can create an event', async () => {
      const { token } = await createAdmin();
      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Kebele Festival', date: '2025-08-01T10:00:00Z', location: 'Addis Ababa' });
      expect(res.status).toBe(201);
      expect(res.body.title).toBe('Kebele Festival');
    });

    it('non-admin cannot create an event', async () => {
      const { token } = await createUser({ username: 'ev1', email: 'ev1@e.com' });
      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Sneaky Event', date: '2025-08-01T10:00:00Z' });
      expect(res.status).toBe(403);
    });

    it('accepts an event without explicit date (startDate also accepted)', async () => {
      const { token } = await createAdmin();
      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Missing Date Event' });
      expect(res.status).toBe(201);
    });

    it('GET /api/events/:id returns a single event', async () => {
      const { token } = await createAdmin();
      const created = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Find Me Event', date: '2025-09-01T10:00:00Z' });

      const res = await request(app).get(`/api/events/${created.body._id}`);
      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Find Me Event');
    });

    it('admin can update an event', async () => {
      const { token } = await createAdmin();
      const created = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Old Title Event', date: '2025-09-01T10:00:00Z' });

      const res = await request(app)
        .put(`/api/events/${created.body._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'New Title Event' });
      expect(res.status).toBe(200);
      expect(res.body.title).toBe('New Title Event');
    });

    it('admin can delete an event', async () => {
      const { token } = await createAdmin();
      const created = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Delete Me Event', date: '2025-09-01T10:00:00Z' });

      const res = await request(app)
        .delete(`/api/events/${created.body._id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);

      const check = await request(app).get(`/api/events/${created.body._id}`);
      expect(check.status).toBe(404);
    });

    it('filters events by active status', async () => {
      const { token } = await createAdmin();
      await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Active Event', date: '2025-10-01T10:00:00Z', isActive: true });
      await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Inactive Event', date: '2025-10-01T10:00:00Z', isActive: false });

      const res = await request(app).get('/api/events?active=true');
      expect(res.body.every((e) => e.isActive)).toBe(true);
    });
  });

  // ── Products ────────────────────────────────────────────────────────────

  describe('Products', () => {
    it('GET /api/products returns empty array initially', async () => {
      const res = await request(app).get('/api/products');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('admin can create a product', async () => {
      const { token } = await createAdmin();
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Injera Basket', price: 15.99, category: 'crafts' });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Injera Basket');
      expect(res.body.price).toBe(15.99);
    });

    it('returns 422 for negative price', async () => {
      const { token } = await createAdmin();
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Free Item', price: -5 });
      expect(res.status).toBe(422);
    });

    it('non-admin cannot create a product', async () => {
      const { token } = await createUser({ username: 'pr1', email: 'pr1@e.com' });
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Sneaky Product', price: 9.99 });
      expect(res.status).toBe(403);
    });

    it('filters products by category', async () => {
      const { token } = await createAdmin();
      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Craft Item', price: 10, category: 'crafts' });
      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Food Item', price: 5, category: 'food' });

      const res = await request(app).get('/api/products?category=crafts');
      expect(res.body.every((p) => p.category === 'crafts')).toBe(true);
    });

    it('admin can delete a product', async () => {
      const { token } = await createAdmin();
      const created = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'To Delete', price: 1 });

      const res = await request(app)
        .delete(`/api/products/${created.body._id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });
  });

  // ── Media ───────────────────────────────────────────────────────────────

  describe('Media', () => {
    it('GET /api/media returns public media items', async () => {
      const res = await request(app).get('/api/media');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('authenticated user can upload media', async () => {
      const { token } = await createUser({ username: 'med1', email: 'med1@e.com' });
      const res = await request(app)
        .post('/api/media')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'My Photo',
          type: 'image',
          url: 'https://example.com/photo.jpg',
          category: 'personal',
        });
      expect(res.status).toBe(201);
      expect(res.body.title).toBe('My Photo');
      expect(res.body.type).toBe('image');
    });

    it('returns 422 for invalid media type', async () => {
      const { token } = await createUser({ username: 'med2', email: 'med2@e.com' });
      const res = await request(app)
        .post('/api/media')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Bad Type', type: 'document', url: 'https://example.com/doc' });
      expect(res.status).toBe(422);
    });

    it('owner can delete their media', async () => {
      const { token } = await createUser({ username: 'med3', email: 'med3@e.com' });
      const created = await request(app)
        .post('/api/media')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Delete Me', type: 'image', url: 'https://example.com/img.jpg' });

      const res = await request(app)
        .delete(`/api/media/${created.body._id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });

    it('stores publicId on upload and destroys it from Cloudinary on delete', async () => {
      cloudinary.uploader.destroy.mockClear();
      const { token } = await createUser({ username: 'medpub', email: 'medpub@e.com' });
      const created = await request(app)
        .post('/api/media')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Cloud Image', type: 'image',
          url: 'https://res.cloudinary.com/x/kebele/abc.jpg',
          publicId: 'kebele/abc',
        });
      expect(created.body.publicId).toBe('kebele/abc');

      await request(app)
        .delete(`/api/media/${created.body._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('kebele/abc');
    });

    it('does not call Cloudinary when media has no publicId', async () => {
      cloudinary.uploader.destroy.mockClear();
      const { token } = await createUser({ username: 'mednopub', email: 'mednopub@e.com' });
      const created = await request(app)
        .post('/api/media')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'No Cloud', type: 'image', url: 'https://example.com/x.jpg' });

      await request(app)
        .delete(`/api/media/${created.body._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(cloudinary.uploader.destroy).not.toHaveBeenCalled();
    });

    it('non-owner cannot delete media', async () => {
      const { token: owner } = await createUser({ username: 'med4', email: 'med4@e.com' });
      const { token: other } = await createUser({ username: 'med5', email: 'med5@e.com' });
      const created = await request(app)
        .post('/api/media')
        .set('Authorization', `Bearer ${owner}`)
        .send({ title: 'Protected Media', type: 'video', url: 'https://example.com/v.mp4' });

      const res = await request(app)
        .delete(`/api/media/${created.body._id}`)
        .set('Authorization', `Bearer ${other}`);
      expect(res.status).toBe(403);
    });

    it('filters media by type', async () => {
      const { token } = await createUser({ username: 'med6', email: 'med6@e.com' });
      await request(app)
        .post('/api/media')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'An Image', type: 'image', url: 'https://example.com/i.jpg' });
      await request(app)
        .post('/api/media')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'A Video', type: 'video', url: 'https://example.com/v.mp4' });

      const res = await request(app).get('/api/media?type=image');
      expect(res.body.every((m) => m.type === 'image')).toBe(true);
    });
  });

  // ── Radio ───────────────────────────────────────────────────────────────

  describe('Radio', () => {
    it('GET /api/radio returns active stations', async () => {
      const res = await request(app).get('/api/radio');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('admin can create a radio station', async () => {
      const { token } = await createAdmin();
      const res = await request(app)
        .post('/api/radio')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Kebele FM', streamUrl: 'https://stream.example.com/kebele', genre: 'afrobeats' });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Kebele FM');
    });

    it('non-admin cannot create a radio station', async () => {
      const { token } = await createUser({ username: 'rd1', email: 'rd1@e.com' });
      const res = await request(app)
        .post('/api/radio')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Pirate FM', streamUrl: 'https://pirate.example.com' });
      expect(res.status).toBe(403);
    });

    it('admin can update a station', async () => {
      const { token } = await createAdmin();
      const created = await request(app)
        .post('/api/radio')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Old Name FM', streamUrl: 'https://stream.example.com/old' });

      const res = await request(app)
        .put(`/api/radio/${created.body._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Name FM' });
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('New Name FM');
    });

    it('admin can delete a station', async () => {
      const { token } = await createAdmin();
      const created = await request(app)
        .post('/api/radio')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Bye FM', streamUrl: 'https://stream.example.com/bye' });

      const res = await request(app)
        .delete(`/api/radio/${created.body._id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });
  });

  // ── About ───────────────────────────────────────────────────────────────

  describe('About', () => {
    it('GET /api/about returns all sections', async () => {
      const res = await request(app).get('/api/about');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('admin can upsert an about section', async () => {
      const { token } = await createAdmin();
      const res = await request(app)
        .put('/api/about/mission')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Our Mission', content: 'To build community connections.' });
      expect(res.status).toBe(200);
      expect(res.body.section).toBe('mission');
      expect(res.body.content).toBe('To build community connections.');
    });

    it('upsert is idempotent — second call updates the same record', async () => {
      const { token } = await createAdmin();
      await request(app)
        .put('/api/about/vision')
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'First version.' });
      const res = await request(app)
        .put('/api/about/vision')
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Updated version.' });
      expect(res.status).toBe(200);
      expect(res.body.content).toBe('Updated version.');

      const About = require('../src/models/About');
      const count = await About.countDocuments({ section: 'vision' });
      expect(count).toBe(1);
    });

    it('non-admin cannot update about sections', async () => {
      const { token } = await createUser({ username: 'ab1', email: 'ab1@e.com' });
      const res = await request(app)
        .put('/api/about/history')
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Sneaky update.' });
      expect(res.status).toBe(403);
    });

    it('returns 422 when content is missing', async () => {
      const { token } = await createAdmin();
      const res = await request(app)
        .put('/api/about/contact')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Contact' });
      expect(res.status).toBe(422);
    });
  });

  // ── Health check ────────────────────────────────────────────────────────

  describe('GET /health', () => {
    it('returns { status: "ok" }', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  describe('404 handler', () => {
    it('returns 404 for unknown routes', async () => {
      const res = await request(app).get('/api/does-not-exist');
      expect(res.status).toBe(404);
    });
  });
});
