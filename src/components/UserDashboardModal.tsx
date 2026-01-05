import React, { useState, useEffect } from 'react';
import { X, Trophy, MessageSquare, Calendar, ShoppingBag, Image, Gamepad2, Heart, Eye, LogOut, Bell } from 'lucide-react';
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
    if (isOpen && user) {
      fetchUserData();
    }
  }, [isOpen, user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      // Load essential data first (points)
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
      // Load user posts
      const postsPromise = forumAPI.getUserPosts(user.id, 3); // Reduced to 3 posts
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
      // Load notifications (lowest priority)
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
    <div className="fixed inset-0 z-[100000] retro-modal flex items-center justify-center p-4" style={{ zIndex: 100000, position: 'fixed' }}>
      <div className={`retro-modal-content ${'max-w-4xl'} w-full max-h-[90vh] overflow-hidden retro-floating-enhanced`} style={{ zIndex: 100001, position: 'relative' }}>
        <div className="retro-titlebar retro-titlebar-mustard">
          <h3 className="retro-title text-base">Your Dashboard</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleLogout}
              className="retro-btn text-sm px-3 py-1 flex items-center space-x-1"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
            <button
              onClick={onClose}
              className="retro-btn text-xl px-3 py-1"
            >
              ×
            </button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          <div className="space-y-6">
            {/* User Header */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-blue-400">
                <span className="text-white font-bold text-2xl">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <h2 className="text-xl retro-title mb-2">{user?.email}</h2>
              <p className="retro-text text-sm opacity-80">Community Member</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="retro-card p-4 text-center">
                <Trophy className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                <p className="text-lg font-bold retro-title">{userPoints?.total_points || 0}</p>
                <p className="text-xs retro-text">Total Points</p>
              </div>
              <div className="retro-card p-4 text-center">
                <Gamepad2 className="w-6 h-6 mx-auto mb-2 text-green-500" />
                <p className="text-lg font-bold retro-title">{userPoints?.games_played || 0}</p>
                <p className="text-xs retro-text">Games Played</p>
              </div>
              <div className="retro-card p-4 text-center">
                <MessageSquare className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                <p className="text-lg font-bold retro-title">{userPosts.length}</p>
                <p className="text-xs retro-text">Forum Posts</p>
              </div>
              <div className="retro-card p-4 text-center">
                <MessageSquare className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                <p className="text-lg font-bold retro-title">{notifications.comments.length + notifications.replies.length}</p>
                <p className="text-xs retro-text">Interactions</p>
              </div>
              <div className="retro-card p-4 text-center">
                <Trophy className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                <p className="text-lg font-bold retro-title">{(userPoints?.checkers_wins || 0) + (userPoints?.marbles_wins || 0) + (userPoints?.pool_wins || 0)}</p>
                <p className="text-xs retro-text">Total Wins</p>
              </div>
            </div>

            {/* Notifications */}
            {(notifications.comments.length > 0 || notifications.replies.length > 0) && (
              <div className="space-y-4">
                <h3 className="retro-title text-lg flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Recent Notifications</span>
                </h3>

                {/* Recent Comments */}
                {notifications.comments.slice(0, 3).map((comment: any) => (
                  <div key={comment.id} className="retro-window p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="retro-title font-semibold text-sm">New comment on your post</p>
                        <p className="retro-text text-sm line-clamp-1">"{comment.forum_posts?.title}"</p>
                        <p className="retro-text text-xs opacity-70 line-clamp-1">{comment.content}</p>
                        <p className="retro-text text-xs opacity-70">{new Date(comment.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Recent Replies */}
                {notifications.replies.slice(0, 3).map((reply: any) => (
                  <div key={reply.id} className="retro-window p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="retro-title font-semibold text-sm">Someone replied to your comment</p>
                        <p className="retro-text text-sm line-clamp-1">On: "{reply.forum_posts?.title}"</p>
                        <p className="retro-text text-xs opacity-70 line-clamp-1">{reply.content}</p>
                        <p className="retro-text text-xs opacity-70">{new Date(reply.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Recent Activity */}
            <div className="space-y-4">
              <h3 className="retro-title text-lg">Recent Activity</h3>

              {/* Game Wins */}
              {(userPoints?.checkers_wins || 0) > 0 && (
                <div className="retro-window p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 font-bold">♟️</span>
                    </div>
                    <div>
                      <p className="retro-title font-semibold">Checkers Champion</p>
                      <p className="retro-text text-sm">{userPoints?.checkers_wins} wins</p>
                    </div>
                  </div>
                </div>
              )}

              {(userPoints?.marbles_wins || 0) > 0 && (
                <div className="retro-window p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-bold">⚪</span>
                    </div>
                    <div>
                      <p className="retro-title font-semibold">Marbles Master</p>
                      <p className="retro-text text-sm">{userPoints?.marbles_wins} wins</p>
                    </div>
                  </div>
                </div>
              )}

              {(userPoints?.pool_wins || 0) > 0 && (
                <div className="retro-window p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 font-bold">🎱</span>
                    </div>
                    <div>
                      <p className="retro-title font-semibold">Pool Champion</p>
                      <p className="retro-text text-sm">{userPoints?.pool_wins} wins</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Posts */}
              {userPosts.slice(0, 3).map((post) => (
                <div key={post.id} className="retro-window p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="retro-title font-semibold line-clamp-1">{post.title}</p>
                      <p className="retro-text text-sm">{post.category} • {new Date(post.created_at).toLocaleDateString()}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="flex items-center space-x-1 text-xs text-green-600">
                          <span>Posted {new Date(post.created_at).toLocaleDateString()}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Placeholder for other activities */}
              <div className="retro-window p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="retro-title font-semibold">Events Attended</p>
                    <p className="retro-text text-sm">Coming soon...</p>
                  </div>
                </div>
              </div>

              <div className="retro-window p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Image className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="retro-title font-semibold">Videos Watched</p>
                    <p className="retro-text text-sm">Coming soon...</p>
                  </div>
                </div>
              </div>

              <div className="retro-window p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="retro-title font-semibold">Recent Purchases</p>
                    <p className="retro-text text-sm">Coming soon...</p>
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