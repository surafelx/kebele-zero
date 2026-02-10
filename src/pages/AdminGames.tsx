import React, { useState, useEffect } from 'react';
import { Trophy, Plus, Search, Filter, Gamepad2, Users, Target, Award, BarChart3, History, Settings, Edit, Trash2, Save, X, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingLevel, setDeletingLevel] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
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

  const totalPages = Math.ceil(filteredGameScores.length / itemsPerPage);
  const paginatedScores = filteredGameScores.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterGameType, filterResult]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Games Management</h2>
          <p className="text-gray-500 mt-1">Manage game scores, leaderboard, and player levels</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowGameScoreForm(true)}
            className="inline-flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Score</span>
          </button>
          <button
            onClick={() => setShowLevelManagement(true)}
            className="inline-flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span>Manage Levels</span>
          </button>
        </div>
      </div>

      {/* Game Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Games</p>
              <p className="text-2xl font-bold text-gray-800">{totalGames}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Players</p>
              <p className="text-2xl font-bold text-gray-800">{activePlayers}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Points</p>
              <p className="text-2xl font-bold text-gray-800">{totalPoints}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Games This Week</p>
              <p className="text-2xl font-bold text-gray-800">{recentGames}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard & Recent History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leaderboard Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              <span>Leaderboard</span>
            </h3>
            <span className="text-sm text-gray-500">Top 5 Players</span>
          </div>
          <div className="p-5">
            {topPlayers.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No players found</p>
            ) : (
              <div className="space-y-3">
                {topPlayers.map((player, index) => {
                  const user = users.find(u => u.id === player.user_id);
                  const level = userLevels.find(l => l.id === player.current_level_id);
                  return (
                    <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{user?.username || player.user_id}</p>
                          <p className="text-sm text-gray-500">{player.total_points} points</p>
                        </div>
                      </div>
                      {level && (
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{level.icon}</span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">{level.level_name}</span>
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 flex items-center space-x-2">
              <History className="w-5 h-5 text-blue-500" />
              <span>Recent History</span>
            </h3>
            <span className="text-sm text-gray-500">Latest 5 Games</span>
          </div>
          <div className="p-5">
            {recentHistory.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No recent games</p>
            ) : (
              <div className="space-y-3">
                {recentHistory.map((score) => (
                  <div key={score.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                        <span className="text-xl">
                          {score.game_type === 'checkers' ? '♟️' :
                           score.game_type === 'marbles' ? '⚪' :
                           score.game_type === 'pool' ? '🎱' :
                           score.game_type === 'foosball' ? '⚽' : '🎮'}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {users.find(u => u.id === score.user_id)?.username || score.user_id}
                        </p>
                        <p className="text-sm text-gray-500 capitalize">{score.game_type} • {score.score} pts</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${
                        score.result === 'win' ? 'bg-green-100 text-green-700' :
                        score.result === 'loss' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {score.result}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(score.played_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by player, game type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select
            value={filterGameType}
            onChange={(e) => setFilterGameType(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Games</option>
            <option value="checkers">Checkers</option>
            <option value="marbles">Marbles</option>
            <option value="pool">Pool 9-Ball</option>
            <option value="foosball">Foosball</option>
          </select>
          <select
            value={filterResult}
            onChange={(e) => setFilterResult(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Results</option>
            <option value="win">Win</option>
            <option value="loss">Loss</option>
            <option value="draw">Draw</option>
          </select>
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
              <label className="block text-sm font-semibold text-gray-700">User ID</label>
              <input
                type="text"
                required
                value={gameScoreFormData.user_id}
                onChange={(e) => setGameScoreFormData({ ...gameScoreFormData, user_id: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="User ID"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">Game Type</label>
              <select
                value={gameScoreFormData.game_type}
                onChange={(e) => setGameScoreFormData({ ...gameScoreFormData, game_type: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
              <label className="block text-sm font-semibold text-gray-700">Score</label>
              <input
                type="number"
                required
                value={gameScoreFormData.score}
                onChange={(e) => setGameScoreFormData({ ...gameScoreFormData, score: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Score"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">Result</label>
              <select
                value={gameScoreFormData.result}
                onChange={(e) => setGameScoreFormData({ ...gameScoreFormData, result: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="win">Win</option>
                <option value="loss">Loss</option>
                <option value="draw">Draw</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100">
            <button
              type="submit"
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-3 px-6 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <Trophy className="w-5 h-5" />
              <span>Add Score</span>
            </button>
            <button
              type="button"
              onClick={() => { setShowGameScoreForm(false); setGameScoreFormData({ user_id: '', game_type: 'checkers', score: 0, result: 'win' }); }}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
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
          <div className="bg-gray-50 rounded-2xl p-5">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <Plus className="w-5 h-5 text-purple-500" />
              <span>Add New Level</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Level Name</label>
                <input
                  type="text"
                  value={newLevel.level_name}
                  onChange={(e) => setNewLevel({ ...newLevel, level_name: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Beginner"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Min Points</label>
                <input
                  type="number"
                  value={newLevel.min_points}
                  onChange={(e) => setNewLevel({ ...newLevel, min_points: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Max Points</label>
                <input
                  type="number"
                  value={newLevel.max_points ?? ''}
                  onChange={(e) => setNewLevel({ ...newLevel, max_points: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={newLevel.color}
                    onChange={(e) => setNewLevel({ ...newLevel, color: e.target.value })}
                    className="w-12 h-12 p-1 bg-white border border-gray-200 rounded-xl cursor-pointer"
                  />
                  <span className="text-sm text-gray-600 font-mono">{newLevel.color}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Icon</label>
                <input
                  type="text"
                  value={newLevel.icon}
                  onChange={(e) => setNewLevel({ ...newLevel, icon: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., ⭐"
                />
              </div>
              <div className="lg:col-span-5 flex justify-end">
                <button
                  onClick={handleCreateLevel}
                  disabled={!newLevel.level_name || newLevel.min_points < 0}
                  className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-xl font-medium transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Level</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-5">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <Settings className="w-5 h-5 text-purple-500" />
              <span>Existing Levels ({userLevels.length})</span>
            </h4>
            {userLevels.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No levels configured. Add levels using the form above.</p>
            ) : (
              <div className="space-y-3">
                {userLevels.map((level) => (
                  <div key={level.id} className="bg-white rounded-xl p-4 border border-gray-100">
                    {editingLevel?.id === level.id ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">Level Name</label>
                            <input
                              type="text"
                              value={editingLevel?.level_name ?? ''}
                              onChange={(e) => editingLevel && setEditingLevel({ ...editingLevel, level_name: e.target.value })}
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">Min Points</label>
                            <input
                              type="number"
                              value={editingLevel?.min_points ?? 0}
                              onChange={(e) => editingLevel && setEditingLevel({ ...editingLevel, min_points: parseInt(e.target.value) })}
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">Max Points</label>
                            <input
                              type="number"
                              value={editingLevel?.max_points ?? ''}
                              onChange={(e) => editingLevel && setEditingLevel({ ...editingLevel, max_points: e.target.value ? parseInt(e.target.value) : null })}
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="Optional"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">Color</label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="color"
                                value={editingLevel?.color ?? '#007bff'}
                                onChange={(e) => editingLevel && setEditingLevel({ ...editingLevel, color: e.target.value })}
                                className="w-12 h-12 p-1 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer"
                              />
                              <span className="text-sm text-gray-600 font-mono">{editingLevel?.color ?? '#007bff'}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">Icon</label>
                            <input
                              type="text"
                              value={editingLevel?.icon ?? ''}
                              onChange={(e) => editingLevel && setEditingLevel({ ...editingLevel, icon: e.target.value })}
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="Icon"
                            />
                          </div>
                          <div className="lg:col-span-5 flex justify-end space-x-2">
                            <button
                              onClick={handleUpdateLevel}
                              className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-xl font-medium transition-colors flex items-center space-x-2"
                            >
                              <Save className="w-4 h-4" />
                              <span>Save</span>
                            </button>
                            <button
                              onClick={() => setEditingLevel(null)}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-xl font-medium transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-14 h-14 flex items-center justify-center rounded-xl shadow-md" style={{ backgroundColor: level.color, color: getContrastColor(level.color) }}>
                            <span className="text-2xl">{level.icon}</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{level.level_name}</h4>
                            <p className="text-sm text-gray-500">
                              {level.min_points} - {level.max_points ? level.max_points : '∞'} points
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setEditingLevel(level)}
                            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            title="Edit Level"
                          >
                            <Edit className="w-5 h-5 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteLevel(level.id)}
                            className="p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete Level"
                          >
                            <Trash2 className="w-5 h-5 text-red-600" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              onClick={() => { setShowLevelManagement(false); setEditingLevel(null); }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-xl font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Game Scores Grid with Pagination */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-purple-500" />
              <span>Game Scores</span>
            </h3>
            <span className="text-sm text-gray-500">
              Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredGameScores.length)} of {filteredGameScores.length}
            </span>
          </div>
        </div>

        {(() => {
          if (loading) {
            return (
              <div className="text-center py-16">
                <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto mb-6"></div>
                <p className="text-gray-500">Loading game scores...</p>
              </div>
            );
          }

          if (filteredGameScores.length === 0) {
            return (
              <div className="text-center py-16">
                <Trophy className="w-20 h-20 text-gray-200 mx-auto mb-6" />
                <p className="text-xl text-gray-500 font-medium">No game scores found</p>
                <p className="text-gray-400 mt-2">
                  {gameScores.length === 0 ? 'Game scores will appear here' : 'No scores match your search criteria'}
                </p>
              </div>
            );
          }

          return (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-5">
                {paginatedScores.map((score) => (
                  <div key={score.id} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                        <span className="text-2xl">
                          {score.game_type === 'checkers' ? '♟️' :
                           score.game_type === 'marbles' ? '⚪' :
                           score.game_type === 'pool' ? '🎱' :
                           score.game_type === 'foosball' ? '⚽' : '🎮'}
                        </span>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${
                        score.result === 'win' ? 'bg-green-100 text-green-700' :
                        score.result === 'loss' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {score.result}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg mb-1">
                        {users.find(u => u.id === score.user_id)?.username || score.user_id}
                      </h3>
                      <p className="text-gray-600 text-sm capitalize mb-3">
                        {score.game_type.replace('_', ' ')}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                          Score: <span className="font-bold text-purple-600">{score.score}</span>
                        </span>
                        <span className="text-gray-400">
                          {new Date(score.played_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 p-5 border-t border-gray-100">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-purple-500 text-white'
                            : 'border border-gray-200 hover:bg-gray-50 text-gray-600'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              )}
            </>
          );
        })()}
      </div>
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