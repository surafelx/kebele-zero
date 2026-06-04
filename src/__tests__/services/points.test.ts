// ── API mock ────────────────────────────────────────────────────────────────

const mockApi = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

jest.mock('../../services/api', () => ({ __esModule: true, default: mockApi }));

import { pointsAPI } from '../../services/points';

// ── Helpers ────────────────────────────────────────────────────────────────

const makePoints = (overrides = {}) => ({
  userId: 'u1',
  totalPoints: 100,
  gamesPlayed: 10,
  checkersWins: 5,
  marblesWins: 3,
  ...overrides,
});

// ── Tests ──────────────────────────────────────────────────────────────────

describe('pointsAPI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // getUserPoints ────────────────────────────────────────────────────────────

  describe('getUserPoints', () => {
    it('fetches points for a given userId', async () => {
      mockApi.get.mockResolvedValueOnce({ data: makePoints() });
      const result = await pointsAPI.getUserPoints('u1');
      expect(mockApi.get).toHaveBeenCalledWith('/points/u1');
      expect(result).toMatchObject({ totalPoints: 100 });
    });

    it('uses default path when no userId provided', async () => {
      mockApi.get.mockResolvedValueOnce({ data: makePoints({ userId: 'current-user' }) });
      await pointsAPI.getUserPoints();
      expect(mockApi.get).toHaveBeenCalledWith('/points/');
    });

    it('returns data from the response', async () => {
      mockApi.get.mockResolvedValueOnce({ data: null });
      const result = await pointsAPI.getUserPoints('u-new');
      expect(result).toBeNull();
    });

    it('throws for unexpected errors', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('network error'));
      await expect(pointsAPI.getUserPoints('u1')).rejects.toThrow('network error');
    });
  });

  // recordGame ───────────────────────────────────────────────────────────────

  describe('recordGame', () => {
    it('calls PUT /points/game with game and result', async () => {
      mockApi.put.mockResolvedValueOnce({ data: { totalPoints: 110 } });
      await pointsAPI.recordGame('checkers', 'win');
      expect(mockApi.put).toHaveBeenCalledWith('/points/game', { game: 'checkers', result: 'win' });
    });

    it('records a marbles win', async () => {
      mockApi.put.mockResolvedValueOnce({ data: { totalPoints: 140 } });
      await pointsAPI.recordGame('marbles', 'win');
      expect(mockApi.put).toHaveBeenCalledWith('/points/game', { game: 'marbles', result: 'win' });
    });

    it('records a draw', async () => {
      mockApi.put.mockResolvedValueOnce({ data: {} });
      await pointsAPI.recordGame('checkers', 'draw');
      expect(mockApi.put).toHaveBeenCalledWith('/points/game', { game: 'checkers', result: 'draw' });
    });

    it('records a loss', async () => {
      mockApi.put.mockResolvedValueOnce({ data: {} });
      await pointsAPI.recordGame('checkers', 'loss');
      expect(mockApi.put).toHaveBeenCalledWith('/points/game', { game: 'checkers', result: 'loss' });
    });
  });

  // addGameScore ─────────────────────────────────────────────────────────────

  describe('addGameScore', () => {
    it('maps score object to PUT /points/game', async () => {
      mockApi.put.mockResolvedValueOnce({ data: {} });
      await pointsAPI.addGameScore({ user_id: 'u1', game_type: 'checkers', score: 100, result: 'win' });
      expect(mockApi.put).toHaveBeenCalledWith('/points/game', { game: 'checkers', result: 'win' });
    });
  });

  // getLeaderboard ───────────────────────────────────────────────────────────

  describe('getLeaderboard', () => {
    it('queries GET /points/leaderboard', async () => {
      mockApi.get.mockResolvedValueOnce({ data: [makePoints()] });
      await pointsAPI.getLeaderboard();
      expect(mockApi.get).toHaveBeenCalledWith('/points/leaderboard', { params: { limit: 10 } });
    });

    it('accepts a custom limit', async () => {
      mockApi.get.mockResolvedValueOnce({ data: [] });
      await pointsAPI.getLeaderboard(undefined, 5);
      expect(mockApi.get).toHaveBeenCalledWith('/points/leaderboard', { params: { limit: 5 } });
    });

    it('throws on network error', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('network error'));
      await expect(pointsAPI.getLeaderboard()).rejects.toBeDefined();
    });
  });
});
