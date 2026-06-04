import api from './api';

export const pointsAPI = {
  getUserPoints: async (userId?: string) => {
    const path = userId ? `/points/${userId}` : '/points/';
    const r = await api.get(path);
    return r.data;
  },
  getLeaderboard: async (gameType?: 'checkers' | 'marbles', limit = 10) => {
    const params: any = { limit };
    if (gameType) params.gameType = gameType;
    const r = await api.get('/points/leaderboard', { params });
    return r.data;
  },
  recordGame: async (game: 'checkers' | 'marbles', result: 'win' | 'draw' | 'loss') => {
    const r = await api.put('/points/game', { game, result });
    return r.data;
  },
  // Keep addGameScore as alias for recordGame for backward compatibility with games
  addGameScore: async (score: { user_id: string; game_type: 'checkers' | 'marbles'; score: number; result: 'win' | 'loss' | 'draw' }) => {
    const r = await api.put('/points/game', { game: score.game_type, result: score.result });
    return r.data;
  },
};
