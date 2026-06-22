const request = require('supertest');
const app = require('../src/app');
const { createUser, createAdmin } = require('./helpers');

const validBody = (overrides = {}) => ({
  userEmail: 'buyer@example.com',
  userName: 'Buyer',
  itemType: 'product',
  itemId: 'prod-1',
  itemName: 'Injera Basket',
  itemPrice: 15.99,
  quantity: 2,
  totalAmount: 31.98,
  paymentMethod: 'cash',
  ...overrides,
});

describe('Payment Requests API', () => {
  // ── POST /api/payment-requests ──────────────────────────────────────────

  describe('POST /api/payment-requests', () => {
    it('creates a request for an authenticated user (status pending)', async () => {
      const { token } = await createUser({ username: 'pr1', email: 'pr1@e.com' });
      const res = await request(app)
        .post('/api/payment-requests')
        .set('Authorization', `Bearer ${token}`)
        .send(validBody());
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('pending');
      expect(res.body.itemName).toBe('Injera Basket');
    });

    it('attaches the userId of the requester', async () => {
      const { user, token } = await createUser({ username: 'pr2', email: 'pr2@e.com' });
      const res = await request(app)
        .post('/api/payment-requests')
        .set('Authorization', `Bearer ${token}`)
        .send(validBody());
      expect(String(res.body.userId)).toBe(String(user._id));
    });

    it('returns 401 without a token', async () => {
      const res = await request(app).post('/api/payment-requests').send(validBody());
      expect(res.status).toBe(401);
    });

    it('returns 400 for an invalid itemType', async () => {
      const { token } = await createUser({ username: 'pr3', email: 'pr3@e.com' });
      const res = await request(app)
        .post('/api/payment-requests')
        .set('Authorization', `Bearer ${token}`)
        .send(validBody({ itemType: 'banana' }));
      expect(res.status).toBe(400);
    });
  });

  // ── GET /api/payment-requests ───────────────────────────────────────────

  describe('GET /api/payment-requests', () => {
    it('returns only the requesting user\'s own requests for a normal user', async () => {
      const { token: t1 } = await createUser({ username: 'pr4', email: 'pr4@e.com' });
      const { token: t2 } = await createUser({ username: 'pr5', email: 'pr5@e.com' });
      await request(app).post('/api/payment-requests').set('Authorization', `Bearer ${t1}`).send(validBody());
      await request(app).post('/api/payment-requests').set('Authorization', `Bearer ${t2}`).send(validBody());

      const res = await request(app).get('/api/payment-requests').set('Authorization', `Bearer ${t1}`);
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
    });

    it('returns all requests for an admin', async () => {
      const { token: userToken } = await createUser({ username: 'pr6', email: 'pr6@e.com' });
      const { token: adminToken } = await createAdmin();
      await request(app).post('/api/payment-requests').set('Authorization', `Bearer ${userToken}`).send(validBody());

      const res = await request(app).get('/api/payment-requests').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('returns 401 without a token', async () => {
      const res = await request(app).get('/api/payment-requests');
      expect(res.status).toBe(401);
    });
  });

  // ── PUT /api/payment-requests/:id/status ────────────────────────────────

  describe('PUT /api/payment-requests/:id/status', () => {
    it('lets an admin approve a request', async () => {
      const { token: userToken } = await createUser({ username: 'pr7', email: 'pr7@e.com' });
      const { token: adminToken } = await createAdmin();
      const created = await request(app)
        .post('/api/payment-requests').set('Authorization', `Bearer ${userToken}`).send(validBody());

      const res = await request(app)
        .put(`/api/payment-requests/${created.body._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'approved', adminNotes: 'Looks good' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('approved');
      expect(res.body.adminNotes).toBe('Looks good');
      expect(res.body.reviewedBy).toBeDefined();
    });

    it('returns 403 when a normal user tries to change status', async () => {
      const { token: userToken } = await createUser({ username: 'pr8', email: 'pr8@e.com' });
      const created = await request(app)
        .post('/api/payment-requests').set('Authorization', `Bearer ${userToken}`).send(validBody());

      const res = await request(app)
        .put(`/api/payment-requests/${created.body._id}/status`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'approved' });
      expect(res.status).toBe(403);
    });

    it('returns 404 for a non-existent request', async () => {
      const { token } = await createAdmin();
      const res = await request(app)
        .put('/api/payment-requests/64f1234567890abcdef12345/status')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'approved' });
      expect(res.status).toBe(404);
    });
  });
});
