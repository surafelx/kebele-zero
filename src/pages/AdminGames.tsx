import React, { useState, useEffect } from 'react';
import { Trophy, Plus, Search, Filter, Gamepad2, Users, Target, Award, BarChart3, History, Settings, Edit, Trash2, Save, ChevronLeft, ChevronRight, X } from 'lucide-react';
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

  const [searchTerm, setSearchTerm] = useState('');
  const [filterGameType, setFilterGameType] = useState('');
  const [filterResult, setFilterResult] = useState('');

  useEffect(() => {
    fetchGameData();
  }, []);

  const fetchGameData = async () => {
    setLoading(true);
    try {
      const { data: scoresData, error: scoresError } = await supabase
        .from('game_scores')
        .select('*')
        .order('played_at', { ascending: false });
      if (!scoresError) setGameScores(scoresData || []);

      const { data: pointsData, error: pointsError } = await supabase
        .from('user_points')
        .select('*')
        .order('total_points', { ascending: false });
      if (!pointsError) setUserPoints(pointsData || []);

      const { data: levelsData, error: levelsError } = await supabase
        .from('user_levels')
        .select('*')
        .order('min_points', { ascending: true });
      if (!levelsError) setUserLevels(levelsData || []);

      const { data: usersData, error: usersError } = await supabase.from('users').select('*');
      if (!usersError) setUsers(usersData || []);
    } catch (error) {
      console.error('Error fetching game data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGameScore = async () => {
    try {
      const { data, error } = await supabase
        .from('game_scores')
        .insert([gameScoreFormData])
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
      const { data, error } = await supabase.from('user_levels').insert([newLevel]).select();
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
      const { error } = await supabase.from('user_levels').delete().eq('id', levelId);
      if (error) throw error;
      setUserLevels(userLevels.filter(level => level.id !== levelId));
      fetchGameData();
    } catch (error) {
      console.error('Error deleting level:', error);
      alert('Error deleting level');
    }
  };

  const totalGames = gameScores.length;
  const activePlayers = [...new Set(gameScores.map(score => score.user_id))].length;
  const totalPoints = userPoints.reduce((sum, p) => sum + (p.total_points || 0), 0);
  const recentGames = gameScores.filter(score =>
    new Date(score.played_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;

  const topPlayers = userPoints.slice(0, 5);
  const recentHistory = gameScores.slice(0, 5);

  const filteredGameScores = gameScores.filter(score => {
    const matchesSearch = searchTerm === '' ||
      users.find(u => u.id === score.user_id)?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterGameType, filterResult]);

  return (
    <div className="space-y-6">
      {/* Header - Retro Style */}
      <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center">
              <Trophy className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-wide">Games Management</h2>
              <p className="text-xs text-white/80 uppercase tracking-wide">Manage game scores, leaderboard, and player levels</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowGameScoreForm(true)}
              className="retro-btn px-3 py-1.5 text-sm"
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Add Score
            </button>
            <button
              onClick={() => setShowLevelManagement(true)}
              className="retro-btn px-3 py-1.5 text-sm"
            >
              <Settings className="w-4 h-4 inline mr-1" />
              Manage Levels
            </button>
          </div>
        </div>
      </div>

      {/* Game Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="retro-text text-xs uppercase tracking-wide">Total Games</p>
              <p className="text-2xl retro-title">{totalGames}</p>
            </div>
            <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-black" />
            </div>
          </div>
        </div>
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="retro-text text-xs uppercase tracking-wide">Active Players</p>
              <p className="text-2xl retro-title">{activePlayers}</p>
            </div>
            <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center">
              <Users className="w-5 h-5 text-black" />
            </div>
          </div>
        </div>
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="retro-text text-xs uppercase tracking-wide">Total Points</p>
              <p className="text-2xl retro-title">{totalPoints}</p>
            </div>
            <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center">
              <Target className="w-5 h-5 text-black" />
            </div>
          </div>
        </div>
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="retro-text text-xs uppercase tracking-wide">Games This Week</p>
              <p className="text-2xl retro-title">{recentGames}</p>
            </div>
            <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center">
              <Award className="w-5 h-5 text-black" />
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard & Recent History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leaderboard Card */}
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b-4 border-black bg-gradient-to-r from-amber-500 to-yellow-500">
            <h3 className="font-black text-white uppercase tracking-wide flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Leaderboard</span>
            </h3>
            <span className="text-xs text-white/80 uppercase tracking-wide">Top 5 Players</span>
          </div>
          <div className="p-4">
            {topPlayers.length === 0 ? (
              <p className="text-center retro-text py-8">No players found</p>
            ) : (
              <div className="space-y-3">
                {topPlayers.map((player, index) => {
                  const user = users.find(u => u.id === player.user_id);
                  const level = userLevels.find(l => l.id === player.current_level_id);
                  return (
                    <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 border-2 border-black">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold text-sm border-2 border-black">
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{user?.username || player.user_id}</p>
                          <p className="text-sm text-gray-600">{player.total_points} points</p>
                        </div>
                      </div>
                      {level && (
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{level.icon}</span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-bold border-2 border-black uppercase tracking-wide">{level.level_name}</span>
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
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b-4 border-black bg-gradient-to-r from-sky-500 to-blue-500">
            <h3 className="font-black text-white uppercase tracking-wide flex items-center space-x-2">
              <History className="w-5 h-5" />
              <span>Recent History</span>
            </h3>
            <span className="text-xs text-white/80 uppercase tracking-wide">Latest 5 Games</span>
          </div>
          <div className="p-4">
            {recentHistory.length === 0 ? (
              <p className="text-center retro-text py-8">No recent games</p>
            ) : (
              <div className="space-y-3">
                {recentHistory.map((score) => (
                  <div key={score.id} className="flex items-center justify-between p-3 bg-gray-50 border-2 border-black">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white border-2 border-black">
                        <span className="text-xl">
                          {score.game_type === 'checkers' ? '♟️' :
                           score.game_type === 'marbles' ? '⚪' :
                           score.game_type === 'pool' ? '🎱' :
                           score.game_type === 'foosball' ? '⚽' : '🎮'}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">
                          {users.find(u => u.id === score.user_id)?.username || score.user_id}
                        </p>
                        <p className="text-sm text-gray-600 capitalize">{score.game_type} • {score.score} pts</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 text-xs font-bold capitalize border-2 border-black ${
                        score.result === 'win' ? 'bg-green-100 text-green-700' :
                        score.result === 'loss' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {score.result}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
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
      <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by player, game type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 retro-input"
              />
            </div>
            <select
              value={filterGameType}
              onChange={(e) => setFilterGameType(e.target.value)}
              className="px-4 py-2 retro-input"
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
              className="px-4 py-2 retro-input"
            >
              <option value="">All Results</option>
              <option value="win">Win</option>
              <option value="loss">Loss</option>
              <option value="draw">Draw</option>
            </select>
          </div>
        </div>
      </div>

      {/* Game Scores Grid with Pagination */}
      <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b-4 border-black bg-gradient-to-r from-purple-600 to-pink-600">
          <h3 className="font-black text-white uppercase tracking-wide flex items-center space-x-2">
            <Trophy className="w-5 h-5" />
            <span>Game Scores</span>
          </h3>
          <span className="text-xs text-white/80 uppercase tracking-wide">
            Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredGameScores.length)} of {filteredGameScores.length}
          </span>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto mb-6"></div>
            <p className="retro-text">Loading game scores...</p>
          </div>
        ) : filteredGameScores.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="w-20 h-20 text-gray-200 mx-auto mb-6" />
            <p className="retro-text text-xl">No game scores found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
              {paginatedScores.map((score) => (
                <div key={score.id} className="bg-gray-50 border-4 border-black p-4 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white border-2 border-black">
                      <span className="text-2xl">
                        {score.game_type === 'checkers' ? '♟️' :
                         score.game_type === 'marbles' ? '⚪' :
                         score.game_type === 'pool' ? '🎱' :
                         score.game_type === 'foosball' ? '⚽' : '🎮'}
                      </span>
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold capitalize border-2 border-black ${
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
                      <span className="text-gray-500 font-bold">
                        Score: <span className="text-black">{score.score}</span>
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
              <div className="flex items-center justify-center gap-2 p-4 border-t-4 border-black">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="retro-btn-secondary px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i): JSX.Element => {
                  const totalPagesValue: number = totalPages;
                  const currentPageValue: number = currentPage;
                  let pageNum: number;
                  if (totalPagesValue <= 5) {
                    pageNum = i + 1;
                  } else if (currentPageValue <= 3) {
                    pageNum = i + 1;
                  } else if (currentPageValue >= totalPagesValue - 2) {
                    pageNum = totalPagesValue - 4 + i;
                  } else {
                    pageNum = currentPageValue - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 font-bold transition-colors border-4 border-black ${
                        currentPage === pageNum
                          ? 'bg-purple-500 text-white'
                          : 'bg-white hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="retro-btn-secondary px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Score Modal */}
      <Modal isOpen={showGameScoreForm} onClose={() => setShowGameScoreForm(false)} title="Add Game Score">
        <form onSubmit={(e) => { e.preventDefault(); handleCreateGameScore(); }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">User ID</label>
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
              <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Game Type</label>
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
              <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Score</label>
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
              <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Result</label>
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
              className="flex-1 retro-btn bg-purple-500 border-purple-600"
            >
              <Trophy className="w-4 h-4 inline mr-2" />
              Add Score
            </button>
            <button
              type="button"
              onClick={() => setShowGameScoreForm(false)}
              className="retro-btn-secondary px-6"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Manage Levels Modal */}
      <Modal isOpen={showLevelManagement} onClose={() => { setShowLevelManagement(false); setEditingLevel(null); }} title="Manage Player Levels" size="xl">
        <div className="space-y-6">
          <div className="bg-gray-50 border-4 border-black p-5">
            <h4 className="font-black text-gray-800 mb-4 flex items-center space-x-2 uppercase tracking-wide">
              <Plus className="w-5 h-5 text-black" />
              <span>Add New Level</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Level Name</label>
                <input
                  type="text"
                  value={newLevel.level_name}
                  onChange={(e) => setNewLevel({ ...newLevel, level_name: e.target.value })}
                  className="retro-input w-full"
                  placeholder="e.g., Beginner"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Min Points</label>
                <input
                  type="number"
                  value={newLevel.min_points}
                  onChange={(e) => setNewLevel({ ...newLevel, min_points: parseInt(e.target.value) })}
                  className="retro-input w-full"
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Max Points</label>
                <input
                  type="number"
                  value={newLevel.max_points ?? ''}
                  onChange={(e) => setNewLevel({ ...newLevel, max_points: e.target.value ? parseInt(e.target.value) : null })}
                  className="retro-input w-full"
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={newLevel.color}
                    onChange={(e) => setNewLevel({ ...newLevel, color: e.target.value })}
                    className="w-12 h-10 p-1 retro-input cursor-pointer"
                  />
                  <span className="text-sm text-gray-600 font-mono font-bold">{newLevel.color}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Icon</label>
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
                  className="retro-btn bg-purple-500 border-purple-600"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Add Level
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border-4 border-black p-5">
            <h4 className="font-black text-gray-800 mb-4 flex items-center space-x-2 uppercase tracking-wide">
              <Settings className="w-5 h-5 text-black" />
              <span>Existing Levels ({userLevels.length})</span>
            </h4>
            {userLevels.length === 0 ? (
              <p className="text-center retro-text py-8">No levels configured. Add levels using the form above.</p>
            ) : (
              <div className="space-y-3">
                {userLevels.map((level) => (
                  <div key={level.id} className="bg-white border-2 border-black p-4">
                    {editingLevel?.id === level.id ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                          <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Level Name</label>
                            <input
                              type="text"
                              value={editingLevel?.level_name ?? ''}
                              onChange={(e) => editingLevel && setEditingLevel({ ...editingLevel, level_name: e.target.value })}
                              className="retro-input w-full"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Min Points</label>
                            <input
                              type="number"
                              value={editingLevel?.min_points ?? 0}
                              onChange={(e) => editingLevel && setEditingLevel({ ...editingLevel, min_points: parseInt(e.target.value) })}
                              className="retro-input w-full"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Max Points</label>
                            <input
                              type="number"
                              value={editingLevel?.max_points ?? ''}
                              onChange={(e) => editingLevel && setEditingLevel({ ...editingLevel, max_points: e.target.value ? parseInt(e.target.value) : null })}
                              className="retro-input w-full"
                              placeholder="Optional"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Color</label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="color"
                                value={editingLevel?.color ?? '#007bff'}
                                onChange={(e) => editingLevel && setEditingLevel({ ...editingLevel, color: e.target.value })}
                                className="w-12 h-10 p-1 retro-input cursor-pointer"
                              />
                              <span className="text-sm text-gray-600 font-mono font-bold">{editingLevel?.color ?? '#007bff'}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Icon</label>
                            <input
                              type="text"
                              value={editingLevel?.icon ?? ''}
                              onChange={(e) => editingLevel && setEditingLevel({ ...editingLevel, icon: e.target.value })}
                              className="retro-input w-full"
                            />
                          </div>
                          <div className="lg:col-span-5 flex justify-end space-x-2">
                            <button
                              onClick={handleUpdateLevel}
                              className="retro-btn bg-green-500 border-green-600"
                            >
                              <Save className="w-4 h-4 inline mr-2" />
                              Save
                            </button>
                            <button
                              onClick={() => setEditingLevel(null)}
                              className="retro-btn-secondary px-4"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-14 h-14 flex items-center justify-center rounded-xl border-2 border-black" style={{ backgroundColor: level.color, color: getContrastColor(level.color) }}>
                            <span className="text-2xl">{level.icon}</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">{level.level_name}</h4>
                            <p className="text-sm text-gray-500">
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
                            className="retro-btn-secondary p-2"
                            title="Delete Level"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t-4 border-black">
            <button
              onClick={() => { setShowLevelManagement(false); setEditingLevel(null); }}
              className="retro-btn-secondary px-6"
            >
              <X className="w-4 h-4 inline mr-2" />
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function getContrastColor(hexColor: string): string {
  const r = parseInt(hexColor.substr(1, 2), 16);
  const g = parseInt(hexColor.substr(3, 2), 16);
  const b = parseInt(hexColor.substr(5, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

export default AdminGames;
