import React, { useState, useEffect } from 'react';
import { X, Trophy, MessageSquare, Calendar, ShoppingBag, Image, Gamepad2, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { pointsAPI } from '../services/points';
import { forumAPI } from '../services/forum';

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
  likes: number;
  upvotes: number;
}

const UserDashboardModal: React.FC<UserDashboardModalProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [userPosts, setUserPosts] = useState<ForumPost[]>([]);
  const [notifications, setNotifications] = useState<any>({ likes: [], comments: [], replies: [] });

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
      fetchUserData();
    }
  }, [isOpen, user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      const pointsPromise = pointsAPI.getUserPoints(user.id);
      const pointsData = await Promise.race([
        pointsPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Points timeout')), 2000))
      ]);
      setUserPoints(pointsData);
    } catch (error) {
      console.warn('Points loading failed:', error);
      setUserPoints(null);
    }

    try {
      const postsPromise = forumAPI.getUserPosts(user.id, 3);
      const userPostsData = await Promise.race([
        postsPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Posts timeout')), 2000))
      ]);
      setUserPosts(userPostsData as ForumPost[]);
    } catch (error) {
      console.warn('Posts loading failed:', error);
      setUserPosts([]);
    }

    try {
      const notificationsPromise = forumAPI.getUserNotifications(user.id);
      const notificationsData = await Promise.race([
        notificationsPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Notifications timeout')), 1500))
      ]);
      setNotifications(notificationsData);
    } catch (error) {
      console.warn('Notifications loading failed:', error);
      setNotifications({ likes: [], comments: [], replies: [] });
    }
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

  return (
    <div 
      className="fixed inset-0 z-[100000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Retro Window Card */}
      <div 
        className="max-w-4xl w-full bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Retro Title Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b-4 border-black bg-gradient-to-r from-emerald-500 to-teal-500">
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
              className="flex items-center space-x-2 px-4 py-2 bg-white border-2 border-black rounded-lg font-bold hover:bg-gray-100 transition-colors"
              style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-white border-2 border-black rounded-lg shadow-lg hover:bg-red-500 hover:text-white hover:border-red-500 transition-all active:translate-y-0.5"
            >
              <X className="w-4 h-4 text-black" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="space-y-6">
            {/* User Header */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-white font-bold text-2xl" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{user?.email}</h2>
              <p className="text-gray-600 font-medium" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Community Member</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 text-center border-2 border-black">
                <Trophy className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
                <p className="text-2xl font-black text-gray-800" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{userPoints?.total_points || 0}</p>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Total Points</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center border-2 border-black">
                <Gamepad2 className="w-6 h-6 mx-auto mb-2 text-green-600" />
                <p className="text-2xl font-black text-gray-800" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{userPoints?.games_played || 0}</p>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Games Played</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border-2 border-black">
                <MessageSquare className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <p className="text-2xl font-black text-gray-800" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{userPosts.length}</p>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Forum Posts</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center border-2 border-black">
                <Bell className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                <p className="text-2xl font-black text-gray-800" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{notifications.comments.length + notifications.replies.length}</p>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Interactions</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 text-center border-2 border-black">
                <Trophy className="w-6 h-6 mx-auto mb-2 text-emerald-600" />
                <p className="text-2xl font-black text-gray-800" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{(userPoints?.checkers_wins || 0) + (userPoints?.marbles_wins || 0) + (userPoints?.pool_wins || 0)}</p>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Total Wins</p>
              </div>
            </div>

            {/* Notifications */}
            {(notifications.comments.length > 0 || notifications.replies.length > 0) && (
              <div className="space-y-4">
                <h3 className="font-bold text-gray-800 flex items-center space-x-2 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                  <Bell className="w-5 h-5 text-purple-500" />
                  <span>Recent Notifications</span>
                </h3>

                {notifications.comments.slice(0, 3).map((comment: any) => (
                  <div key={comment.id} className="bg-gray-50 rounded-xl p-4 border-2 border-black">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center border-2 border-black">
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-800 text-sm" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>New comment on your post</p>
                        <p className="text-gray-600 text-sm line-clamp-1 font-medium" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>"{comment.forum_posts?.title}"</p>
                        <p className="text-gray-400 text-xs font-medium" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{new Date(comment.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {notifications.replies.slice(0, 3).map((reply: any) => (
                  <div key={reply.id} className="bg-gray-50 rounded-xl p-4 border-2 border-black">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center border-2 border-black">
                        <MessageSquare className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-800 text-sm" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Someone replied to your comment</p>
                        <p className="text-gray-600 text-sm line-clamp-1 font-medium" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>On: "{reply.forum_posts?.title}"</p>
                        <p className="text-gray-400 text-xs font-medium" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{new Date(reply.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Recent Activity */}
            <div className="space-y-4">
              <h3 className="font-bold text-gray-800 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Recent Activity</h3>

              {(userPoints?.checkers_wins || 0) > 0 && (
                <div className="bg-gray-50 rounded-xl p-4 border-2 border-black">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center border-2 border-black">
                      <span className="text-green-600 font-bold">♟️</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-800" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Checkers Champion</p>
                      <p className="text-sm text-gray-500 font-medium" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{userPoints?.checkers_wins} wins</p>
                    </div>
                  </div>
                </div>
              )}

              {(userPoints?.marbles_wins || 0) > 0 && (
                <div className="bg-gray-50 rounded-xl p-4 border-2 border-black">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center border-2 border-black">
                      <span className="text-blue-600 font-bold">⚪</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-800" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Marbles Master</p>
                      <p className="text-sm text-gray-500 font-medium" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{userPoints?.marbles_wins} wins</p>
                    </div>
                  </div>
                </div>
              )}

              {(userPoints?.pool_wins || 0) > 0 && (
                <div className="bg-gray-50 rounded-xl p-4 border-2 border-black">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center border-2 border-black">
                      <span className="text-green-600 font-bold">🎱</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-800" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Pool Champion</p>
                      <p className="text-sm text-gray-500 font-medium" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{userPoints?.pool_wins} wins</p>
                    </div>
                  </div>
                </div>
              )}

              {userPosts.slice(0, 3).map((post) => (
                <div key={post.id} className="bg-gray-50 rounded-xl p-4 border-2 border-black">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center border-2 border-black">
                      <MessageSquare className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-800 line-clamp-1" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{post.title}</p>
                      <p className="text-sm text-gray-500 font-medium" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{post.category} • {new Date(post.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="bg-gray-50 rounded-xl p-4 border-2 border-black">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-black">
                    <Calendar className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Events Attended</p>
                    <p className="text-sm text-gray-500 font-medium" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Coming soon...</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border-2 border-black">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-black">
                    <Image className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Videos Watched</p>
                    <p className="text-sm text-gray-500 font-medium" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Coming soon...</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border-2 border-black">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-black">
                    <ShoppingBag className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Recent Purchases</p>
                    <p className="text-sm text-gray-500 font-medium" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Coming soon...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboardModal;
