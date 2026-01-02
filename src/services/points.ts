import { supabase } from './supabase';

export interface UserPoints {
  id: string;
  user_id: string;
  total_points: number;
  games_played: number;
  checkers_wins: number;
  marbles_wins: number;
  created_at: string;
  updated_at: string;
}

export interface GameScore {
  id: string;
  user_id: string;
  game_type: 'checkers' | 'marbles';
  score: number;
  result: 'win' | 'loss' | 'draw';
  opponent_id?: string;
  played_at: string;
}

export const pointsAPI = {
  // User Points
  getUserPoints: async (userId?: string) => {
    const targetUserId = userId || (await supabase.auth.getSession()).data.session?.user?.id;
    if (!targetUserId) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_id', targetUserId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
    return data;
  },

  createUserPoints: async (userId: string) => {
    const { data, error } = await supabase
      .from('user_points')
      .insert([{
        user_id: userId,
        total_points: 0,
        games_played: 0,
        checkers_wins: 0,
        marbles_wins: 0
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateUserPoints: async (userId: string, updates: Partial<UserPoints>) => {
    const { data, error } = await supabase
      .from('user_points')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Game Scores
  getUserGameScores: async (userId?: string, gameType?: 'checkers' | 'marbles', limit = 10) => {
    const targetUserId = userId || (await supabase.auth.getSession()).data.session?.user?.id;
    if (!targetUserId) throw new Error('Not authenticated');

    let query = supabase
      .from('game_scores')
      .select('*')
      .eq('user_id', targetUserId)
      .order('played_at', { ascending: false })
      .limit(limit);

    if (gameType) {
      query = query.eq('game_type', gameType);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  addGameScore: async (score: Omit<GameScore, 'id' | 'played_at'>) => {
    const { data, error } = await supabase
      .from('game_scores')
      .insert([score])
      .select()
      .single();

    if (error) throw error;

    // Update user points based on the game result
    await pointsAPI.updatePointsAfterGame(score.user_id, score.game_type, score.result);

    return data;
  },

  // Leaderboard
  getLeaderboard: async (gameType?: 'checkers' | 'marbles', limit = 10) => {
    let query = supabase
      .from('user_points')
      .select('*')
      .order('total_points', { ascending: false })
      .limit(limit);

    if (gameType) {
      query = query.order(`${gameType}_wins`, { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Helper function to update points after a game
  updatePointsAfterGame: async (userId: string, gameType: 'checkers' | 'marbles', result: 'win' | 'loss' | 'draw') => {
    // Get current points
    let userPoints = await pointsAPI.getUserPoints(userId);

    if (!userPoints) {
      userPoints = await pointsAPI.createUserPoints(userId);
    }

    const updates: Partial<UserPoints> = {
      games_played: userPoints.games_played + 1
    };

    if (result === 'win') {
      updates.total_points = userPoints.total_points + 10; // 10 points for a win
      if (gameType === 'checkers') {
        updates.checkers_wins = userPoints.checkers_wins + 1;
      } else if (gameType === 'marbles') {
        updates.marbles_wins = userPoints.marbles_wins + 1;
      }
    } else if (result === 'draw') {
      updates.total_points = userPoints.total_points + 5; // 5 points for a draw
    }
    // Loss gives 0 points

    await pointsAPI.updateUserPoints(userId, updates);
  }
};