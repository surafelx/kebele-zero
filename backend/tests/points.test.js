const request = require('supertest');
const app = require('../src/app');
const UserPoints = require('../src/models/UserPoints');
const { createUser, createAdmin } = require('./helpers');

describe('Points API', () => {
  // ── GET /api/points/leaderboard ─────────────────────────────────────────

  describe('GET /api/points/leaderboard', () => {
    it('returns leaderboard sorted by totalPoints descending', async () => {
      const { user: u1 } = await createUser({ username: 'pts1', email: 'p1@e.com' });
      const { user: u2 } = await createUser({ username: 'pts2', email: 'p2@e.com' });

      await UserPoints.findOneAndUpdate({ userId: u1._id }, { totalPoints: 50 });
      await UserPoints.findOneAndUpdate({ userId: u2._id }, { totalPoints: 200 });

      const res = await request(app).get('/api/points/leaderboard');
      expect(res.status).toBe(200);
      expect(res.body[0].totalPoints).toBe(200);
      expect(res.body[1].totalPoints).toBe(50);
    });

    it('is accessible without authentication', async () => {
      const res = await request(app).get('/api/points/leaderboard');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('respects the limit query parameter', async () => {
      // Create multiple users
      for (let i = 0; i < 5; i++) {
        await createUser({ username: `lb${i}`, email: `lb${i}@e.com` });
      }
      const res = await request(app).get('/api/points/leaderboard?limit=3');
      expect(res.status).toBe(200);
      expect(res.body.length).toBeLessThanOrEqual(3);
    });
  });

  // ── GET /api/points/:userId ─────────────────────────────────────────────

  describe('GET /api/points/:userId', () => {
    it('returns points record for a given userId', async () => {
      const { user, token } = await createUser({ username: 'pts1', email: 'pts1@e.com' });
      const res = await request(app)
        .get(`/api/points/${user._id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.totalPoints).toBe(0);
      expect(res.body.gamesPlayed).toBe(0);
    });

    it('returns 404 when user has no points record', async () => {
      const { user, token } = await createUser({ username: 'nopt', email: 'nopt@e.com' });
      await UserPoints.deleteOne({ userId: user._id });
      const res = await request(app)
        .get(`/api/points/${user._id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });

    it('returns 401 without a token', async () => {
      const res = await request(app).get('/api/points/some-id');
      expect(res.status).toBe(401);
    });
  });

  // ── PUT /api/points/game ────────────────────────────────────────────────

  describe('PUT /api/points/game', () => {
    it('adds 10 points and increments checkersWins on a checkers win', async () => {
      const { user, token } = await createUser({ username: 'gamer1', email: 'g1@e.com' });
      const res = await request(app)
        .put('/api/points/game')
        .set('Authorization', `Bearer ${token}`)
        .send({ game: 'checkers', result: 'win' });

      expect(res.status).toBe(200);
      expect(res.body.totalPoints).toBe(10);
      expect(res.body.checkersWins).toBe(1);
      expect(res.body.gamesPlayed).toBe(1);
    });

    it('adds 10 points and increments marblesWins on a marbles win', async () => {
      const { token } = await createUser({ username: 'gamer2', email: 'g2@e.com' });
      const res = await request(app)
        .put('/api/points/game')
        .set('Authorization', `Bearer ${token}`)
        .send({ game: 'marbles', result: 'win' });

      expect(res.status).toBe(200);
      expect(res.body.totalPoints).toBe(10);
      expect(res.body.marblesWins).toBe(1);
    });

    it('adds 5 points on a draw', async () => {
      const { token } = await createUser({ username: 'gamer3', email: 'g3@e.com' });
      const res = await request(app)
        .put('/api/points/game')
        .set('Authorization', `Bearer ${token}`)
        .send({ game: 'checkers', result: 'draw' });

      expect(res.status).toBe(200);
      expect(res.body.totalPoints).toBe(5);
    });

    it('adds 0 points on a loss but still increments gamesPlayed', async () => {
      const { token } = await createUser({ username: 'gamer4', email: 'g4@e.com' });
      const res = await request(app)
        .put('/api/points/game')
        .set('Authorization', `Bearer ${token}`)
        .send({ game: 'checkers', result: 'loss' });

      expect(res.status).toBe(200);
      expect(res.body.totalPoints).toBe(0);
      expect(res.body.gamesPlayed).toBe(1);
    });

    it('accumulates points across multiple games', async () => {
      const { token } = await createUser({ username: 'gamer5', email: 'g5@e.com' });
      await request(app)
        .put('/api/points/game')
        .set('Authorization', `Bearer ${token}`)
        .send({ game: 'checkers', result: 'win' });
      await request(app)
        .put('/api/points/game')
        .set('Authorization', `Bearer ${token}`)
        .send({ game: 'marbles', result: 'draw' });
      const res = await request(app)
        .put('/api/points/game')
        .set('Authorization', `Bearer ${token}`)
        .send({ game: 'checkers', result: 'loss' });

      expect(res.body.totalPoints).toBe(15);
      expect(res.body.gamesPlayed).toBe(3);
    });

    it('returns 422 for invalid game type', async () => {
      const { token } = await createUser({ username: 'gamer6', email: 'g6@e.com' });
      const res = await request(app)
        .put('/api/points/game')
        .set('Authorization', `Bearer ${token}`)
        .send({ game: 'poker', result: 'win' });
      expect(res.status).toBe(422);
    });

    it('returns 422 for invalid result', async () => {
      const { token } = await createUser({ username: 'gamer7', email: 'g7@e.com' });
      const res = await request(app)
        .put('/api/points/game')
        .set('Authorization', `Bearer ${token}`)
        .send({ game: 'checkers', result: 'surrender' });
      expect(res.status).toBe(422);
    });

    it('returns 401 without auth', async () => {
      const res = await request(app)
        .put('/api/points/game')
        .send({ game: 'checkers', result: 'win' });
      expect(res.status).toBe(401);
    });

    it('logs a GameScore history entry', async () => {
      const { token } = await createUser({ username: 'gamer8', email: 'g8@e.com' });
      await request(app)
        .put('/api/points/game')
        .set('Authorization', `Bearer ${token}`)
        .send({ game: 'checkers', result: 'win' });

      const { token: adminToken } = await createAdmin({ email: 'gsadmin1@example.com' });
      const res = await request(app)
        .get('/api/points/admin/scores')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.some((s) => s.gameType === 'checkers' && s.result === 'win')).toBe(true);
    });
  });

  // ── GET /api/points/admin/scores ────────────────────────────────────────

  describe('GET /api/points/admin/scores', () => {
    it('requires admin', async () => {
      const { token } = await createUser({ username: 'noadmin1', email: 'na1@e.com' });
      const res = await request(app)
        .get('/api/points/admin/scores')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
    });

    it('filters by gameType', async () => {
      const { token: adminToken } = await createAdmin({ email: 'gsadmin2@example.com' });
      const { token } = await createUser({ username: 'gamer9', email: 'g9@e.com' });
      await request(app)
        .put('/api/points/game')
        .set('Authorization', `Bearer ${token}`)
        .send({ game: 'marbles', result: 'win' });

      const res = await request(app)
        .get('/api/points/admin/scores?gameType=marbles')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.every((s) => s.gameType === 'marbles')).toBe(true);
    });
  });

  // ── POST /api/points/admin/scores ───────────────────────────────────────

  describe('POST /api/points/admin/scores', () => {
    it('admin can manually log a score and it updates the aggregate', async () => {
      const { token: adminToken } = await createAdmin({ email: 'gsadmin3@example.com' });
      const { user } = await createUser({ username: 'gamer10', email: 'g10@e.com' });

      const res = await request(app)
        .post('/api/points/admin/scores')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userId: user._id, gameType: 'checkers', score: 10, result: 'win' });
      expect(res.status).toBe(201);

      const pointsRes = await request(app)
        .get(`/api/points/${user._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(pointsRes.body.totalPoints).toBe(10);
      expect(pointsRes.body.checkersWins).toBe(1);
    });

    it('rejects a non-admin', async () => {
      const { token } = await createUser({ username: 'noadmin2', email: 'na2@e.com' });
      const res = await request(app)
        .post('/api/points/admin/scores')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: 'x', gameType: 'checkers', score: 10, result: 'win' });
      expect(res.status).toBe(403);
    });
  });

  // ── PUT /api/points/admin/:userId ───────────────────────────────────────

  describe('PUT /api/points/admin/:userId', () => {
    it('admin can directly override a user\'s aggregate stats', async () => {
      const { token: adminToken } = await createAdmin({ email: 'gsadmin4@example.com' });
      const { user } = await createUser({ username: 'gamer11', email: 'g11@e.com' });

      const res = await request(app)
        .put(`/api/points/admin/${user._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ totalPoints: 500, gamesPlayed: 20, checkersWins: 5, marblesWins: 3 });

      expect(res.status).toBe(200);
      expect(res.body.totalPoints).toBe(500);
      expect(res.body.gamesPlayed).toBe(20);
      expect(res.body.checkersWins).toBe(5);
      expect(res.body.marblesWins).toBe(3);
    });

    it('rejects a non-admin', async () => {
      const { token, user } = await createUser({ username: 'noadmin3', email: 'na3@e.com' });
      const res = await request(app)
        .put(`/api/points/admin/${user._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ totalPoints: 500 });
      expect(res.status).toBe(403);
    });
  });
});
