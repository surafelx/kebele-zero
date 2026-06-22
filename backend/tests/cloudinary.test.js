// Mock the Cloudinary config so tests never hit the real API.
jest.mock('../src/config/cloudinary', () => ({
  cloudinary: {
    uploader: { destroy: jest.fn().mockResolvedValue({ result: 'ok' }) },
    utils: { api_sign_request: jest.fn().mockReturnValue('fake-signature') },
  },
  isConfigured: () => true,
}));

const request = require('supertest');
const app = require('../src/app');
const { createUser, createAdmin } = require('./helpers');
const { cloudinary } = require('../src/config/cloudinary');

describe('Cloudinary API', () => {
  beforeEach(() => {
    cloudinary.uploader.destroy.mockClear();
  });

  // ── DELETE /api/cloudinary/:publicId ────────────────────────────────────

  describe('DELETE /api/cloudinary/:publicId', () => {
    it('lets an admin delete an image by public id', async () => {
      const { token } = await createAdmin();
      const res = await request(app)
        .delete('/api/cloudinary/kebele/sample')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.result).toBe('ok');
      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('kebele/sample');
    });

    it('handles folder paths in the public id', async () => {
      const { token } = await createAdmin();
      await request(app)
        .delete('/api/cloudinary/kebele/products/img-123')
        .set('Authorization', `Bearer ${token}`);
      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('kebele/products/img-123');
    });

    it('returns 403 for a non-admin', async () => {
      const { token } = await createUser({ username: 'cl1', email: 'cl1@e.com' });
      const res = await request(app)
        .delete('/api/cloudinary/kebele/sample')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
      expect(cloudinary.uploader.destroy).not.toHaveBeenCalled();
    });

    it('returns 401 without a token', async () => {
      const res = await request(app).delete('/api/cloudinary/kebele/sample');
      expect(res.status).toBe(401);
    });
  });

  // ── POST /api/cloudinary/sign ───────────────────────────────────────────

  describe('POST /api/cloudinary/sign', () => {
    it('returns a signature for an admin', async () => {
      const { token } = await createAdmin();
      const res = await request(app)
        .post('/api/cloudinary/sign')
        .set('Authorization', `Bearer ${token}`)
        .send({ folder: 'kebele' });
      expect(res.status).toBe(200);
      expect(res.body.signature).toBe('fake-signature');
      expect(res.body.timestamp).toBeDefined();
      expect(res.body.folder).toBe('kebele');
    });

    it('returns 403 for a non-admin', async () => {
      const { token } = await createUser({ username: 'cl2', email: 'cl2@e.com' });
      const res = await request(app)
        .post('/api/cloudinary/sign')
        .set('Authorization', `Bearer ${token}`)
        .send({ folder: 'kebele' });
      expect(res.status).toBe(403);
    });
  });
});
