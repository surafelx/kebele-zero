import React, { useState, useEffect } from 'react';
import { Trophy, Plus, Search, Filter, Gamepad2, Users, Target, Award, BarChart3, History, Settings, Edit, Trash2, Save } from 'lucide-react';
import { supabase } from '../services/supabase';
import Modal from '../components/Modal';

interface Level {
  id?: string;
  level_name: string;
  min_points: number;
  max_points: number | null;
  color: string;
  icon: string;
}

const AdminGames = () => {
  const [gameScores, setGameScores] = useState<any[]>([]);
  const [userPoints, setUserPoints] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [userLevels, setUserLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showGameScoreForm, setShowGameScoreForm] = useState(false);
  const [showLevelManagement, setShowLevelManagement] = useState(false);
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);
  const [newLevel, setNewLevel] = useState<Level>({
    level_name: '',
    min_points: 0,
    max_points: null,
    color: '#007bff',
    icon: '⭐'
  });
  const [gameScoreFormData, setGameScoreFormData] = useState({
    user_id: '',
    game_type: 'checkers',
    score: 0,
    result: 'win'
  });

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGameType, setFilterGameType] = useState('');
  const [filterResult, setFilterResult] = useState('');

  useEffect(() => {
    fetchGameData();
  }, []);

  const fetchGameData = async () => {
    setLoading(true);
    try {
      // Fetch game scores
      const { data: scoresData, error: scoresError } = await supabase
        .from('game_scores')
        .select('*')
        .order('played_at', { ascending: false });

      if (scoresError) {
        console.error('Error fetching game scores:', scoresError);
      } else {
        setGameScores(scoresData || []);
      }

      // Fetch user points
      const { data: pointsData, error: pointsError } = await supabase
        .from('user_points')
        .select('*')
        .order('total_points', { ascending: false });

      if (pointsError) {
        console.error('Error fetching user points:', pointsError);
      } else {
        setUserPoints(pointsData || []);
      }

      // Fetch user levels
      const { data: levelsData, error: levelsError } = await supabase
        .from('user_levels')
        .select('*')
        .order('min_points', { ascending: true });

      if (levelsError) {
        console.error('Error fetching user levels:', levelsError);
      } else {
        setUserLevels(levelsData || []);
      }

      // Fetch users for display
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*');

      if (usersError) {
        console.error('Error fetching users:', usersError);
      } else {
        setUsers(usersData || []);
      }
    } catch (error) {
      console.error('Error fetching game data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGameScore = async (scoreData: any) => {
    try {
      const { data, error } = await supabase
        .from('game_scores')
        .insert([scoreData])
        .select();

      if (error) throw error;

      setGameScores([...gameScores, data[0]]);
      setShowGameScoreForm(false);
      fetchGameData();
    } catch (error) {
      console.error('Error creating game score:', error);
      alert('Error creating game score');
    }
  };

  const handleCreateLevel = async () => {
    try {
      const { data, error } = await supabase
        .from('user_levels')
        .insert([newLevel])
        .select();

      if (error) throw error;

      setUserLevels([...userLevels, data[0]]);
      setNewLevel({ level_name: '', min_points: 0, max_points: null, color: '#007bff', icon: '⭐' });
      fetchGameData();
    } catch (error) {
      console.error('Error creating level:', error);
      alert('Error creating level');
    }
  };

  const handleUpdateLevel = async () => {
    try {
      if (!editingLevel || !editingLevel.id) return;
      const { data, error } = await supabase
        .from('user_levels')
        .update(editingLevel)
        .eq('id', editingLevel.id)
        .select();

      if (error) throw error;

      setUserLevels(userLevels.map(level => level.id === editingLevel.id ? data[0] : level));
      setEditingLevel(null);
      fetchGameData();
    } catch (error) {
      console.error('Error updating level:', error);
      alert('Error updating level');
    }
  };

  const handleDeleteLevel = async (levelId: string) => {
    try {
      const { error } = await supabase
        .from('user_levels')
        .delete()
        .eq('id', levelId);

      if (error) throw error;

      setUserLevels(userLevels.filter(level => level.id !== levelId));
      fetchGameData();
    } catch (error) {
      console.error('Error deleting level:', error);
      alert('Error deleting level');
    }
  };

  // Calculate stats
  const totalGames = gameScores.length;
  const activePlayers = [...new Set(gameScores.map(score => score.user_id))].length;
  const totalPoints = userPoints.reduce((sum, p) => sum + (p.total_points || 0), 0);
  const recentGames = gameScores.filter(score =>
    new Date(score.played_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;

  // Get top 5 players for leaderboard
  const topPlayers = userPoints.slice(0, 5);

  // Get recent game history
  const recentHistory = gameScores.slice(0, 5);

  // Filter game scores
  const filteredGameScores = gameScores.filter(score => {
    const matchesSearch = searchTerm === '' ||
      users.find(u => u.id === score.user_id)?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      users.find(u => u.id === score.user_id)?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      score.game_type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGameType = filterGameType === '' || score.game_type === filterGameType;
    const matchesResult = filterResult === '' || score.result === filterResult;

    return matchesSearch && matchesGameType && matchesResult;
  });

  return (
    <div className="space-y-8">
      <div className="bg-white border-b-4 border-charcoal px-4 py-3 flex justify-between items-center shadow-sm">
        <div>
          <h2 className="retro-title text-xl">Games Management</h2>
          <p className="retro-text text-base opacity-80 mt-2">Manage game scores, leaderboard, and player levels</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowGameScoreForm(true)}
            className="retro-btn px-6 py-3 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5 retro-icon" />
            <span>Add Score</span>
          </button>
          <button
            onClick={() => setShowLevelManagement(true)}
            className="retro-btn-secondary px-6 py-3 flex items-center space-x-2"
          >
            <Settings className="w-5 h-5 retro-icon" />
            <span>Manage Levels</span>
          </button>
        </div>
      </div>

      {/* Game Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="retro-card retro-hover">
          <div className="p-4 text-center">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md border-2 border-purple-400 retro-icon mx-auto mb-2">
              <Gamepad2 className="w-4 h-4 text-white" />
            </div>
            <p className="text-lg font-bold text-purple-900 retro-title">{totalGames}</p>
            <p className="text-xs text-purple-700 uppercase tracking-wide retro-text">Total Games</p>
          </div>
        </div>

        <div className="retro-card retro-hover">
          <div className="p-4 text-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md border-2 border-blue-400 retro-icon mx-auto mb-2">
              <Users className="w-4 h-4 text-white" />
            </div>
            <p className="text-lg font-bold text-blue-900 retro-title">{activePlayers}</p>
            <p className="text-xs text-blue-700 uppercase tracking-wide retro-text">Active Players</p>
          </div>
        </div>

        <div className="retro-card retro-hover">
          <div className="p-4 text-center">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md border-2 border-orange-400 retro-icon mx-auto mb-2">
              <Target className="w-4 h-4 text-white" />
            </div>
            <p className="text-lg font-bold text-orange-900 retro-title">{totalPoints}</p>
            <p className="text-xs text-orange-700 uppercase tracking-wide retro-text">Total Points</p>
          </div>
        </div>

        <div className="retro-card retro-hover">
          <div className="p-4 text-center">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md border-2 border-green-400 retro-icon mx-auto mb-2">
              <Award className="w-4 h-4 text-white" />
            </div>
            <p className="text-lg font-bold text-green-900 retro-title">{recentGames}</p>
            <p className="text-xs text-green-700 uppercase tracking-wide retro-text">Games This Week</p>
          </div>
        </div>
      </div>

      {/* Leaderboard Card */}
      <div className="retro-window">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="retro-title text-lg font-bold flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Leaderboard</span>
            </h3>
            <span className="text-sm text-gray-600 retro-text">Top 5 Players</span>
          </div>
          {topPlayers.length === 0 ? (
            <p className="text-center text-gray-500 retro-text">No players found</p>
          ) : (
            <div className="space-y-3">
              {topPlayers.map((player, index) => {
                const user = users.find(u => u.id === player.user_id);
                const level = userLevels.find(l => l.id === player.current_level_id);
                return (
                  <div key={player.id} className="flex items-center justify-between p-3 retro-card">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 retro-title">{user?.username || player.user_id}</p>
                        <p className="text-sm text-gray-600 retro-text">{player.total_points} points</p>
                      </div>
                    </div>
                    {level && (
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{level.icon}</span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded retro-text">{level.level_name}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent History Card */}
      <div className="retro-window">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="retro-title text-lg font-bold flex items-center space-x-2">
              <History className="w-5 h-5" />
              <span>Recent History</span>
            </h3>
            <span className="text-sm text-gray-600 retro-text">Latest 5 Games</span>
          </div>
          {recentHistory.length === 0 ? (
            <p className="text-center text-gray-500 retro-text">No recent games</p>
          ) : (
            <div className="space-y-3">
              {recentHistory.map((score) => (
                <div key={score.id} className="flex items-center justify-between p-3 retro-card">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                      <span className="text-2xl">
                        {score.game_type === 'checkers' ? '♟️' :
                         score.game_type === 'marbles' ? '⚪' :
                         score.game_type === 'pool' ? '🎱' :
                         score.game_type === 'foosball' ? '⚽' : '🎮'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 retro-title">
                        {users.find(u => u.id === score.user_id)?.username || score.user_id}
                      </p>
                      <p className="text-sm text-gray-600 retro-text capitalize">{score.game_type} • {score.score} pts</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`retro-badge px-3 py-1 text-sm font-medium ${
                      score.result === 'win' ? 'bg-green-100 text-green-800' :
                      score.result === 'loss' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {score.result.toUpperCase()}
                    </span>
                    <p className="text-xs text-gray-500 retro-text mt-1">
                      {new Date(score.played_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="retro-window">
        <div className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold retro-text mb-2">Search Games</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by player, game type, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 retro-input"
                />
              </div>
            </div>
            <div className="lg:w-48">
              <label className="block text-sm font-semibold retro-text mb-2">Game Type</label>
              <select
                value={filterGameType}
                onChange={(e) => setFilterGameType(e.target.value)}
                className="w-full px-4 py-2 bg-white retro-input"
              >
                <option value="">All Games</option>
                <option value="checkers">Checkers</option>
                <option value="marbles">Marbles</option>
                <option value="pool">Pool 9-Ball</option>
                <option value="foosball">Foosball</option>
              </select>
            </div>
            <div className="lg:w-48">
              <label className="block text-sm font-semibold retro-text mb-2">Result</label>
              <select
                value={filterResult}
                onChange={(e) => setFilterResult(e.target.value)}
                className="w-full px-4 py-2 bg-white retro-input"
              >
                <option value="">All Results</option>
                <option value="win">Win</option>
                <option value="loss">Loss</option>
                <option value="draw">Draw</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showGameScoreForm}
        onClose={() => setShowGameScoreForm(false)}
        title="Add Game Score"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleCreateGameScore(gameScoreFormData); setShowGameScoreForm(false); }} className="space-y-6">
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

      <Modal
        isOpen={showLevelManagement}
        onClose={() => { setShowLevelManagement(false); setEditingLevel(null); }}
        title="Manage Player Levels"
        size="xl"
      >
        <div className="space-y-6">
          <div className="retro-window">
            <div className="p-4">
              <h4 className="retro-title font-semibold mb-4 flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Add New Level</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold retro-text">Level Name</label>
                  <input
                    type="text"
                    value={newLevel.level_name}
                    onChange={(e) => setNewLevel({ ...newLevel, level_name: e.target.value })}
                    className="retro-input w-full"
                    placeholder="e.g., Beginner"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold retro-text">Min Points</label>
                  <input
                    type="number"
                    value={newLevel.min_points}
                    onChange={(e) => setNewLevel({ ...newLevel, min_points: parseInt(e.target.value) })}
                    className="retro-input w-full"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold retro-text">Max Points</label>
                  <input
                    type="number"
                    value={newLevel.max_points ?? ''}
                    onChange={(e) => setNewLevel({ ...newLevel, max_points: e.target.value ? parseInt(e.target.value) : null })}
                    className="retro-input w-full"
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold retro-text">Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={newLevel.color}
                      onChange={(e) => setNewLevel({ ...newLevel, color: e.target.value })}
                      className="w-10 h-10 p-1"
                    />
                    <span className="text-sm retro-text">{newLevel.color}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold retro-text">Icon</label>
                  <input
                    type="text"
                    value={newLevel.icon}
                    onChange={(e) => setNewLevel({ ...newLevel, icon: e.target.value })}
                    className="retro-input w-full"
                    placeholder="e.g., ⭐"
                  />
                </div>
                <div className="lg:col-span-5 flex justify-end">
                  <button
                    onClick={handleCreateLevel}
                    disabled={!newLevel.level_name || newLevel.min_points < 0}
                    className="retro-btn-success py-2 px-4 flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Level</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="retro-window">
            <div className="p-4">
              <h4 className="retro-title font-semibold mb-4 flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Existing Levels ({userLevels.length})</span>
              </h4>
              {userLevels.length === 0 ? (
                <p className="text-center text-gray-500 retro-text py-8">No levels configured. Add levels using the form above.</p>
              ) : (
                <div className="space-y-3">
                  {userLevels.map((level) => (
                    <div key={level.id} className="retro-card">
                      {editingLevel?.id === level.id ? (
                        <div className="p-4 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                            <div className="space-y-2">
                              <label className="block text-sm font-semibold retro-text">Level Name</label>
                              <input
                                type="text"
                                value={editingLevel?.level_name ?? ''}
                                onChange={(e) => editingLevel && setEditingLevel({ ...editingLevel, level_name: e.target.value })}
                                className="retro-input w-full"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="block text-sm font-semibold retro-text">Min Points</label>
                              <input
                                type="number"
                                value={editingLevel?.min_points ?? 0}
                                onChange={(e) => editingLevel && setEditingLevel({ ...editingLevel, min_points: parseInt(e.target.value) })}
                                className="retro-input w-full"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="block text-sm font-semibold retro-text">Max Points</label>
                              <input
                                type="number"
                                value={editingLevel?.max_points ?? ''}
                                onChange={(e) => editingLevel && setEditingLevel({ ...editingLevel, max_points: e.target.value ? parseInt(e.target.value) : null })}
                                className="retro-input w-full"
                                placeholder="Optional"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="block text-sm font-semibold retro-text">Color</label>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="color"
                                  value={editingLevel?.color ?? '#007bff'}
                                  onChange={(e) => editingLevel && setEditingLevel({ ...editingLevel, color: e.target.value })}
                                  className="w-10 h-10 p-1"
                                />
                                <span className="text-sm retro-text">{editingLevel?.color ?? '#007bff'}</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="block text-sm font-semibold retro-text">Icon</label>
                              <input
                                type="text"
                                value={editingLevel?.icon ?? ''}
                                onChange={(e) => editingLevel && setEditingLevel({ ...editingLevel, icon: e.target.value })}
                                className="retro-input w-full"
                                placeholder="Icon"
                              />
                            </div>
                            <div className="lg:col-span-5 flex justify-end space-x-2">
                              <button
                                onClick={handleUpdateLevel}
                                className="retro-btn-success py-2 px-4 flex items-center space-x-2"
                              >
                                <Save className="w-4 h-4" />
                                <span>Save</span>
                              </button>
                              <button
                                onClick={() => setEditingLevel(null)}
                                className="retro-btn-secondary py-2 px-4"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 flex items-center justify-center" style={{ backgroundColor: level.color, color: getContrastColor(level.color) }}>
                                <span className="text-2xl">{level.icon}</span>
                              </div>
                              <div>
                                <h4 className="font-semibold retro-title">{level.level_name}</h4>
                                <p className="text-sm text-gray-600 retro-text">
                                  {level.min_points} - {level.max_points ? level.max_points : '∞'} points
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setEditingLevel(level)}
                                className="retro-btn-secondary p-2"
                                title="Edit Level"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteLevel(level.id)}
                                className="retro-btn-danger p-2"
                                title="Delete Level"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t-4 border-mustard">
            <button
              onClick={() => { setShowLevelManagement(false); setEditingLevel(null); }}
              className="retro-btn-secondary py-2 px-4"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {(() => {
        if (loading) {
          return (
            <div className="retro-window text-center py-16">
              <div className="retro-spinner w-16 h-16 mx-auto mb-6"></div>
              <p className="retro-text text-lg">Loading game scores...</p>
            </div>
          );
        }

        if (filteredGameScores.length === 0) {
          return (
            <div className="retro-window text-center py-16">
              <Trophy className="w-20 h-20 text-gray-300 mx-auto mb-6 retro-icon" />
              <p className="retro-text text-xl">No game scores found</p>
              <p className="retro-text text-base opacity-70 mt-3">
                {gameScores.length === 0 ? 'Game scores will appear here' : 'No scores match your search criteria'}
              </p>
            </div>
          );
        }

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredGameScores.map((score) => (
              <div key={score.id} className="retro-window retro-hover">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md retro-icon">
                      <span className="text-2xl">
                        {score.game_type === 'checkers' ? '♟️' :
                         score.game_type === 'marbles' ? '⚪' :
                         score.game_type === 'pool' ? '🎱' :
                         score.game_type === 'foosball' ? '⚽' : '🎮'}
                      </span>
                    </div>
                    <span className={`retro-badge px-3 py-1 text-sm font-medium ${
                      score.result === 'win' ? 'bg-green-100 text-green-800' :
                      score.result === 'loss' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {score.result.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-xl retro-title mb-2">
                      {users.find(u => u.id === score.user_id)?.username || score.user_id}
                    </h3>
                    <p className="text-gray-600 text-base retro-text mb-3 capitalize">
                      {score.game_type.replace('_', ' ')}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm retro-text opacity-80">
                        <span className="font-medium">Score: <span className="font-bold text-purple-600">{score.score}</span></span>
                      </div>
                      <div className="flex items-center text-sm retro-text opacity-80">
                        <span className="font-medium">Played: {new Date(score.played_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      })()}
    </div>
  );

  // Helper function to determine text color based on background color
  function getContrastColor(hexColor: string): string {
    // Convert hex to RGB
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return black or white depending on luminance
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }
};

export default AdminGames;