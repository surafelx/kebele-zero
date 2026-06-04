import React, { useState, useEffect } from 'react';
import { X, Trophy, MessageSquare, Gamepad2, Bell, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { pointsAPI } from '../services/points';
import { forumAPI } from '../services/forum';
import UserProfileModal from './UserProfileModal';

interface UserDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserPoints {
  id: string;
  user_id: string;
  total_points: number;
  games_played: number;
  checkers_wins: number;
  marbles_wins: number;
  pool_wins?: number;
  created_at: string;
  updated_at: string;
}

interface ForumPost {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
}

const UserDashboardModal: React.FC<UserDashboardModalProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [userPosts, setUserPosts] = useState<ForumPost[]>([]);
  const [notifications, setNotifications] = useState<any>({ likes: [], comments: [], replies: [] });
  const [dataLoading, setDataLoading] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

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
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && user) {
      fetchUserData();
    }
  }, [isOpen, user]);

  const fetchUserData = async () => {
    if (!user) return;
    setDataLoading(true);

    // Fetch all data in parallel — failures are isolated so one timeout doesn't block others
    const [pointsResult, postsResult] = await Promise.allSettled([
      Promise.race([
        pointsAPI.getUserPoints(user.id),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
      ]),
      Promise.race([
        forumAPI.getUserPosts(user.id),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
      ]),
    ]);

    setUserPoints(pointsResult.status === 'fulfilled' ? (pointsResult.value as UserPoints) : null);
    setUserPosts(postsResult.status === 'fulfilled' ? (postsResult.value as ForumPost[]) : []);
    setNotifications({ likes: [], comments: [], replies: [] });
    setDataLoading(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!isOpen) return null;

  const displayName = user?.username || user?.email?.split('@')[0] || 'Member';
  const totalWins = (userPoints?.checkers_wins || 0) + (userPoints?.marbles_wins || 0) + (userPoints?.pool_wins || 0);
  const notifCount = notifications.comments.length + notifications.replies.length;

  return (
    <>
      <div
        className="fixed inset-0 z-[100000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
        onClick={onClose}
      >
        {/* Retro Window Card */}
        <div
          className="max-w-2xl w-full bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Retro Title Bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b-4 border-black bg-gradient-to-r from-emerald-500 to-teal-500 shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg">
                <Trophy className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-wide drop-shadow-lg" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                Your Dashboard
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-1.5 bg-white border-2 border-black rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors"
                style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
              <button
                onClick={onClose}
                className="group p-2 bg-white border-2 border-black rounded-lg shadow-lg hover:bg-red-500 hover:border-red-500 transition-all active:translate-y-0.5"
              >
                <X className="w-4 h-4 text-black group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">

            {/* User Header */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg border-2 border-black shrink-0">
                <span className="text-white font-bold text-2xl" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-gray-800 truncate" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                  {displayName}
                </h2>
                <p className="text-sm text-gray-500 truncate" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                  {user?.email}
                </p>
              </div>
              <button
                onClick={() => setShowProfileModal(true)}
                className="shrink-0 flex items-center space-x-2 px-3 py-2 bg-white border-2 border-black rounded-lg font-bold text-sm hover:bg-emerald-50 transition-colors"
                style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
              >
                <User className="w-4 h-4 text-emerald-600" />
                <span>Profile</span>
              </button>
            </div>

            {/* Stats Overview */}
            {dataLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-lg p-4 text-center border-2 border-black animate-pulse h-24" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 text-center border-2 border-black">
                  <Trophy className="w-5 h-5 mx-auto mb-1 text-yellow-600" />
                  <p className="text-2xl font-black text-gray-800" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{userPoints?.total_points ?? 0}</p>
                  <p className="text-xs font-bold text-gray-500 uppercase" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Points</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center border-2 border-black">
                  <Gamepad2 className="w-5 h-5 mx-auto mb-1 text-green-600" />
                  <p className="text-2xl font-black text-gray-800" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{userPoints?.games_played ?? 0}</p>
                  <p className="text-xs font-bold text-gray-500 uppercase" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Played</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center border-2 border-black">
                  <MessageSquare className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                  <p className="text-2xl font-black text-gray-800" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{userPosts.length}</p>
                  <p className="text-xs font-bold text-gray-500 uppercase" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Posts</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 text-center border-2 border-black">
                  <Trophy className="w-5 h-5 mx-auto mb-1 text-orange-600" />
                  <p className="text-2xl font-black text-gray-800" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{totalWins}</p>
                  <p className="text-xs font-bold text-gray-500 uppercase" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Wins</p>
                </div>
              </div>
            )}

            {/* Notifications */}
            {!dataLoading && notifCount > 0 && (
              <div className="space-y-3">
                <h3 className="font-bold text-gray-800 flex items-center space-x-2 uppercase tracking-wide text-sm" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                  <Bell className="w-4 h-4 text-purple-500" />
                  <span>Notifications ({notifCount})</span>
                </h3>
                {notifications.comments.slice(0, 2).map((comment: any) => (
                  <div key={comment.id} className="bg-blue-50 rounded-lg p-3 border-2 border-black flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center border-2 border-black shrink-0">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-800 text-sm" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>New comment on your post</p>
                      <p className="text-gray-500 text-xs truncate" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>"{comment.forum_posts?.title}"</p>
                    </div>
                  </div>
                ))}
                {notifications.replies.slice(0, 2).map((reply: any) => (
                  <div key={reply.id} className="bg-green-50 rounded-lg p-3 border-2 border-black flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center border-2 border-black shrink-0">
                      <MessageSquare className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-800 text-sm" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Reply to your comment</p>
                      <p className="text-gray-500 text-xs truncate" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>On: "{reply.forum_posts?.title}"</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Recent Forum Posts */}
            {!dataLoading && userPosts.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-bold text-gray-800 uppercase tracking-wide text-sm" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                  Recent Posts
                </h3>
                {userPosts.map((post) => (
                  <div key={post.id} className="bg-gray-50 rounded-lg p-3 border-2 border-black flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center border-2 border-black shrink-0">
                      <MessageSquare className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-sm truncate" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{post.title}</p>
                      <p className="text-xs text-gray-500" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                        {post.category} · {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Game Wins breakdown */}
            {!dataLoading && totalWins > 0 && (
              <div className="space-y-2">
                <h3 className="font-bold text-gray-800 uppercase tracking-wide text-sm" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                  Game Wins
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {(userPoints?.checkers_wins || 0) > 0 && (
                    <div className="bg-gray-50 rounded-lg p-3 text-center border-2 border-black">
                      <div className="text-lg">♟️</div>
                      <div className="font-black text-gray-800 text-sm" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{userPoints?.checkers_wins}</div>
                      <div className="text-xs text-gray-500 uppercase" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Checkers</div>
                    </div>
                  )}
                  {(userPoints?.marbles_wins || 0) > 0 && (
                    <div className="bg-gray-50 rounded-lg p-3 text-center border-2 border-black">
                      <div className="text-lg">⚪</div>
                      <div className="font-black text-gray-800 text-sm" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{userPoints?.marbles_wins}</div>
                      <div className="text-xs text-gray-500 uppercase" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Marbles</div>
                    </div>
                  )}
                  {(userPoints?.pool_wins || 0) > 0 && (
                    <div className="bg-gray-50 rounded-lg p-3 text-center border-2 border-black">
                      <div className="text-lg">🎱</div>
                      <div className="font-black text-gray-800 text-sm" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{userPoints?.pool_wins}</div>
                      <div className="text-xs text-gray-500 uppercase" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Pool</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Empty state */}
            {!dataLoading && !userPoints && userPosts.length === 0 && notifCount === 0 && (
              <div className="text-center py-6 text-gray-500">
                <Gamepad2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-bold uppercase text-sm" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                  No activity yet — start playing or posting!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Profile Modal — opened from this dashboard */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </>
  );
};

export default UserDashboardModal;
