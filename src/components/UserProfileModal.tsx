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
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

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
    <div 
      className="fixed inset-0 z-[100002] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Retro Window Card */}
      <div 
        className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Retro Title Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b-4 border-black bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-wide drop-shadow-lg" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                Your Profile
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white border-2 border-black rounded-lg shadow-lg hover:bg-red-500 hover:text-white hover:border-red-500 transition-all active:translate-y-0.5"
          >
            <X className="w-4 h-4 text-black" />
          </button>
        </div>

        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
              <span className="text-white font-bold text-xl" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                {user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{user.username || user.email?.split('@')[0]}</h2>
              <p className="text-blue-100 text-sm font-medium" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{user.email}</p>
              <div className={`flex items-center space-x-1 mt-1 ${rank.color}`}>
                <RankIcon className="w-4 h-4" />
                <span className="text-sm font-bold uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{rank.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b-4 border-black bg-gray-100">
          <nav className="flex flex-wrap">
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
                  className={`flex items-center space-x-2 px-4 py-3 border-b-4 font-bold text-sm transition-all ${
                    activeTab === tab.id
                      ? 'border-black bg-white text-blue-600'
                      : 'border-transparent text-gray-600 hover:bg-white/50'
                  }`}
                  style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {activeTab === 'overview' && userStats && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl text-center border-2 border-black">
                  <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <div className="text-2xl font-black text-yellow-800" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{userStats.totalPoints}</div>
                  <div className="text-xs font-bold text-yellow-600 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Total Points</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl text-center border-2 border-black">
                  <Gamepad2 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-black text-blue-800" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{userStats.gamesPlayed}</div>
                  <div className="text-xs font-bold text-blue-600 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Games Played</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl text-center border-2 border-black">
                  <MessageSquare className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-black text-green-800" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{userStats.forumPosts}</div>
                  <div className="text-xs font-bold text-green-600 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Forum Posts</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl text-center border-2 border-black">
                  <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-sm font-black text-purple-800" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                    {new Date(userStats.joinDate).toLocaleDateString()}
                  </div>
                  <div className="text-xs font-bold text-purple-600 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Member Since</div>
                </div>
              </div>

              {/* Game Wins */}
              <div className="bg-gray-50 p-4 rounded-xl border-2 border-black">
                <h3 className="font-bold text-gray-900 mb-3 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Game Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg border-2 border-black">
                    <div className="text-lg font-black text-red-600" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{userStats.checkersWins}</div>
                    <div className="text-sm font-bold text-gray-600 uppercase" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Checkers Wins</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border-2 border-black">
                    <div className="text-lg font-black text-blue-600" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{userStats.marblesWins}</div>
                    <div className="text-sm font-bold text-gray-600 uppercase" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Marbles Wins</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'games' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="font-bold text-gray-900 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Recent Games</h3>
              {recentGames.length === 0 ? (
                <div className="text-center py-8">
                  <Gamepad2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>No games played yet</p>
                  <p className="text-sm text-gray-500 mt-1 font-medium" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Start playing to see your history!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentGames.map((game, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border-2 border-black hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full border-2 border-black ${
                          game.result === 'win' ? 'bg-green-500' :
                          game.result === 'loss' ? 'bg-red-500' : 'bg-yellow-500'
                        }`}></div>
                        <div>
                          <div className="font-bold text-gray-900 capitalize" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{game.game_type}</div>
                          <div className="text-sm text-gray-600 font-medium" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                            {new Date(game.played_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                        game.result === 'win' ? 'bg-green-100 text-green-800 border-2 border-black' :
                        game.result === 'loss' ? 'bg-red-100 text-red-800 border-2 border-black' :
                        'bg-yellow-100 text-yellow-800 border-2 border-black'
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
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="font-bold text-gray-900 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Forum Activity</h3>
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Forum activity will be displayed here</p>
                <p className="text-sm text-gray-500 mt-1 font-medium" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Coming soon!</p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="font-bold text-gray-900 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Account Settings</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border-2 border-black hover:bg-gray-100 transition-colors">
                  <Edit3 className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-900 font-bold" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Edit Profile</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border-2 border-black hover:bg-gray-100 transition-colors">
                  <Settings className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-900 font-bold" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Preferences</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 p-3 bg-red-50 rounded-xl border-2 border-black hover:bg-red-100 transition-colors text-red-700"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-bold" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
