import React, { useState, useEffect } from 'react';
import { X, User, Trophy, Calendar, Gamepad2, MessageSquare, Settings, Edit3, LogOut, Crown, Target, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { pointsAPI } from '../services/points';
import { forumAPI } from '../services/forum';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserStats {
  totalPoints: number;
  gamesPlayed: number;
  checkersWins: number;
  marblesWins: number;
  forumPosts: number;
  joinDate: string;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [recentGames, setRecentGames] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'games' | 'forum' | 'settings'>('overview');

  useEffect(() => {
    if (isOpen && user) {
      loadUserData();
    }
  }, [isOpen, user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      // Load user points and stats
      const [pointsData, gameHistory, forumPosts] = await Promise.all([
        pointsAPI.getUserPoints(user.id),
        pointsAPI.getUserGameScores(user.id, undefined, 5),
        forumAPI.getPosts().then(posts => posts.filter(p => p.created_by === user.id))
      ]);

      setUserStats({
        totalPoints: pointsData?.total_points || 0,
        gamesPlayed: pointsData?.games_played || 0,
        checkersWins: pointsData?.checkers_wins || 0,
        marblesWins: pointsData?.marbles_wins || 0,
        forumPosts: forumPosts.length,
        joinDate: user.created_at || new Date().toISOString()
      });

      setRecentGames(gameHistory);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getRank = (points: number) => {
    if (points >= 1000) return { name: 'Grandmaster', color: 'text-purple-600', icon: Crown };
    if (points >= 500) return { name: 'Master', color: 'text-blue-600', icon: Trophy };
    if (points >= 200) return { name: 'Expert', color: 'text-green-600', icon: Target };
    if (points >= 50) return { name: 'Player', color: 'text-yellow-600', icon: Zap };
    return { name: 'Beginner', color: 'text-gray-600', icon: User };
  };

  if (!isOpen || !user) return null;

  const rank = userStats ? getRank(userStats.totalPoints) : { name: 'Loading...', color: 'text-gray-600', icon: User };
  const RankIcon = rank.icon;

  return (
    <div className="fixed inset-0 z-[10002] bg-black bg-opacity-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[70vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">
                {user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold">{user.username || user.email?.split('@')[0]}</h2>
              <p className="text-blue-100">{user.email}</p>
              <div className={`flex items-center space-x-1 mt-1 ${rank.color}`}>
                <RankIcon className="w-4 h-4" />
                <span className="text-sm font-medium">{rank.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'games', label: 'Games', icon: Gamepad2 },
              { id: 'forum', label: 'Forum', icon: MessageSquare },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <>
            {activeTab === 'overview' && userStats && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-lg text-center">
                    <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-yellow-800">{userStats.totalPoints}</div>
                    <div className="text-sm text-yellow-600">Total Points</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg text-center">
                    <Gamepad2 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-800">{userStats.gamesPlayed}</div>
                    <div className="text-sm text-blue-600">Games Played</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg text-center">
                    <MessageSquare className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-800">{userStats.forumPosts}</div>
                    <div className="text-sm text-green-600">Forum Posts</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg text-center">
                    <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-sm font-bold text-purple-800">
                      {new Date(userStats.joinDate).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-purple-600">Member Since</div>
                  </div>
                </div>

                {/* Game Wins */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Game Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-red-600">{userStats.checkersWins}</div>
                      <div className="text-sm text-gray-600">Checkers Wins</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{userStats.marblesWins}</div>
                      <div className="text-sm text-gray-600">Marbles Wins</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'games' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Recent Games</h3>
                {recentGames.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No games played yet</p>
                ) : (
                  <div className="space-y-3">
                    {recentGames.map((game, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            game.result === 'win' ? 'bg-green-500' :
                            game.result === 'loss' ? 'bg-red-500' : 'bg-yellow-500'
                          }`}></div>
                          <div>
                            <div className="font-medium text-gray-900 capitalize">{game.game_type}</div>
                            <div className="text-sm text-gray-600">
                              {new Date(game.played_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          game.result === 'win' ? 'bg-green-100 text-green-800' :
                          game.result === 'loss' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {game.result.toUpperCase()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'forum' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Forum Activity</h3>
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">Forum activity will be displayed here</p>
                  <p className="text-sm text-gray-500 mt-1">Coming soon!</p>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Account Settings</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Edit3 className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-900">Edit Profile</span>
                    </div>
                  </button>
                  <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Settings className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-900">Preferences</span>
                    </div>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-red-700"
                  >
                    <div className="flex items-center space-x-3">
                      <LogOut className="w-5 h-5" />
                      <span>Sign Out</span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;