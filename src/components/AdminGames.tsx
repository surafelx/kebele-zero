import React, { useState } from 'react';
import { Plus, Trophy, Edit3, Trash2 } from 'lucide-react';
import Modal from './Modal';

interface AdminGamesProps {
  userPoints: any[];
  gameScores: any[];
  showGameScoreForm: boolean;
  setShowGameScoreForm: (show: boolean) => void;
  gameScoreFormData: {
    user_id: string;
    game_type: string;
    score: number;
    result: string;
  };
  setGameScoreFormData: (data: any) => void;
  handleCreateGameScore: (data: any) => void;
  handleUpdateGameScore: (id: string, data: any) => void;
  setGameScores: (scores: any[]) => void;
}

const AdminGames: React.FC<AdminGamesProps> = ({
  userPoints,
  gameScores,
  showGameScoreForm,
  setShowGameScoreForm,
  gameScoreFormData,
  setGameScoreFormData,
  handleCreateGameScore,
  handleUpdateGameScore,
  setGameScores
}) => {
  const [editingScore, setEditingScore] = useState<any>(null);

  const handleEditScore = (score: any) => {
    setEditingScore(score);
    setGameScoreFormData({
      user_id: score.user_id,
      game_type: score.game_type,
      score: score.score,
      result: score.result
    });
    setShowGameScoreForm(true);
  };

  const handleDeleteScore = async (id: string) => {
    if (!confirm('Are you sure you want to delete this score?')) return;
    
    try {
      // This would typically call an API to delete the score
      // For now, we'll just filter it out locally
      setGameScores(gameScores.filter(s => s.id !== id));
      alert('Score deleted successfully!');
    } catch (error) {
      console.error('Error deleting score:', error);
      alert('Error deleting score');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="retro-title text-3xl">Games Management</h2>
          <p className="retro-text text-base opacity-80 mt-2">Manage game scores and player statistics</p>
        </div>
        <button
          onClick={() => setShowGameScoreForm(true)}
          className="retro-btn px-6 py-3 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5 retro-icon" />
          <span>Add Score</span>
        </button>
      </div>

      <Modal
        isOpen={showGameScoreForm}
        onClose={() => { setShowGameScoreForm(false); setEditingScore(null); }}
        title={editingScore ? "Edit Game Score" : "Add Game Score"}
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          if (editingScore) {
            handleUpdateGameScore(editingScore.id, gameScoreFormData);
          } else {
            handleCreateGameScore(gameScoreFormData);
          }
          setShowGameScoreForm(false);
          setEditingScore(null);
        }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-sm font-semibold retro-text">User ID</label>
              <input
                type="text"
                required
                value={gameScoreFormData.user_id}
                onChange={(e) => setGameScoreFormData({ ...gameScoreFormData, user_id: e.target.value })}
                className="retro-input w-full"
                placeholder="User ID"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-semibold retro-text">Game Type</label>
              <select
                value={gameScoreFormData.game_type}
                onChange={(e) => setGameScoreFormData({ ...gameScoreFormData, game_type: e.target.value })}
                className="retro-input w-full bg-white"
              >
                <option value="checkers">Checkers</option>
                <option value="marbles">Marbles</option>
                <option value="pool">Pool 9-Ball</option>
                <option value="foosball">Foosball</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-sm font-semibold retro-text">Score</label>
              <input
                type="number"
                required
                value={gameScoreFormData.score}
                onChange={(e) => setGameScoreFormData({ ...gameScoreFormData, score: parseInt(e.target.value) })}
                className="retro-input w-full"
                placeholder="Score"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-semibold retro-text">Result</label>
              <select
                value={gameScoreFormData.result}
                onChange={(e) => setGameScoreFormData({ ...gameScoreFormData, result: e.target.value })}
                className="retro-input w-full bg-white"
              >
                <option value="win">Win</option>
                <option value="loss">Loss</option>
                <option value="draw">Draw</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t-4 border-mustard">
            <button
              type="submit"
              className="flex-1 retro-btn-success py-3 px-6"
            >
              🏆 Add Score
            </button>
            <button
              type="button"
              onClick={() => { setShowGameScoreForm(false); setGameScoreFormData({ user_id: '', game_type: 'checkers', score: 0, result: 'win' }); }}
              className="retro-btn-secondary py-3 px-6"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Leaderboard */}
      <div className="retro-window">
        <div className="retro-titlebar retro-titlebar-orange p-0.5">
          <div className="flex items-center space-x-0.5">
            <div className="w-3 h-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded flex items-center justify-center retro-icon">
              <Trophy className="w-1.5 h-1.5 text-white" />
            </div>
            <div>
              <h3 className="retro-title text-xs">Leaderboard</h3>
              <p className="retro-text text-xs opacity-80">Top players</p>
            </div>
          </div>
        </div>
        <div className="p-0.5">
          <div className="space-y-0.5">
            {userPoints.slice(0, 5).map((player, index) => (
              <div key={player.id} className="retro-window retro-hover p-0.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-0.5">
                    <div className="w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold retro-title text-xs">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 retro-title text-xs">{player.user_id}</p>
                      <p className="text-xs text-gray-600 retro-text">Games: {player.games_played}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-600 retro-title text-xs">{player.total_points} pts</p>
                    <p className="text-xs text-gray-500 retro-text">Wins: {(player.checkers_wins || 0) + (player.marbles_wins || 0) + (player.pool_wins || 0)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Game Scores */}
      <div className="retro-window">
        <div className="retro-titlebar retro-titlebar-red p-0.5">
          <div className="flex items-center space-x-0.5">
            <div className="w-3 h-3 bg-gradient-to-br from-orange-500 to-red-500 rounded flex items-center justify-center retro-icon">
              <Trophy className="w-1.5 h-1.5 text-white" />
            </div>
            <div>
              <h3 className="retro-title text-xs">Recent Scores</h3>
              <p className="retro-text text-xs opacity-80">Latest activity</p>
            </div>
          </div>
        </div>
        <div className="p-1">
          <div className="space-y-0.5">
            {gameScores.slice(0, 10).map((score) => (
              <div key={score.id} className="retro-window retro-hover p-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-6 h-6 rounded flex items-center justify-center text-white font-bold retro-title text-xs ${
                      score.result === 'win' ? 'bg-green-500' :
                      score.result === 'loss' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}>
                      {score.game_type === 'checkers' ? '♟️' :
                       score.game_type === 'marbles' ? '⚪' :
                       score.game_type === 'pool' ? '🎱' :
                       score.game_type === 'foosball' ? '⚽' : '🎮'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 retro-title text-xs">{score.user_id}</p>
                      <p className="text-xs text-gray-600 retro-text">
                        {score.game_type} • {score.score} pts • {new Date(score.played_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEditScore(score)}
                      className="retro-btn-secondary p-1"
                    >
                      <Edit3 className="w-3 h-3 retro-icon" />
                    </button>
                    <button
                      onClick={() => handleDeleteScore(score.id)}
                      className="retro-btn-secondary p-1"
                    >
                      <Trash2 className="w-3 h-3 retro-icon" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Game Point Levels Management */}
      <div className="retro-window">
        <div className="retro-titlebar retro-titlebar-gold p-2">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-yellow-100 rounded-lg flex items-center justify-center retro-icon">
              <Trophy className="w-3 h-3 text-yellow-600" />
            </div>
            <div>
              <h3 className="retro-title text-xs">Point Levels</h3>
              <p className="retro-text text-xs opacity-80">Achievement titles</p>
            </div>
          </div>
        </div>
        <div className="p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {[
              { level: 'Bronze', points: '0-99', title: 'Beginner', color: 'bronze' },
              { level: 'Silver', points: '100-499', title: 'Apprentice', color: 'silver' },
              { level: 'Gold', points: '500-999', title: 'Skilled Player', color: 'gold' },
              { level: 'Platinum', points: '1000-2499', title: 'Expert', color: 'platinum' },
              { level: 'Diamond', points: '2500-4999', title: 'Master', color: 'diamond' },
              { level: 'Legendary', points: '5000+', title: 'Grandmaster', color: 'legendary' }
            ].map((tier) => (
              <div key={tier.level} className="retro-window retro-hover p-2">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-6 h-6 rounded flex items-center justify-center text-white font-bold text-xs ${
                    tier.color === 'bronze' ? 'bg-amber-600' :
                    tier.color === 'silver' ? 'bg-gray-400' :
                    tier.color === 'gold' ? 'bg-yellow-500' :
                    tier.color === 'platinum' ? 'bg-blue-500' :
                    tier.color === 'diamond' ? 'bg-purple-500' :
                    'bg-red-500'
                  }`}>
                    {tier.level.charAt(0)}
                  </div>
                  <span className="retro-text text-xs opacity-70">{tier.points}</span>
                </div>
                <h4 className="retro-title font-bold text-sm mb-1">{tier.title}</h4>
                <input
                  type="text"
                  defaultValue={tier.title}
                  className="retro-input w-full text-xs py-1"
                  placeholder="Custom title"
                />
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t-4 border-mustard">
            <button className="retro-btn px-6 py-2 text-sm">
              Save Titles
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminGames;