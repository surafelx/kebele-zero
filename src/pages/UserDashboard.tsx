import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Trophy, Calendar, MessageSquare, ShoppingBag, Radio, Image, Settings, LogOut, Edit3, Star, Award, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { pointsAPI } from '../services/points';

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();
  const [userPoints, setUserPoints] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        fetchUserData();
      }
      // Allow access to dashboard for demo purposes even without authentication
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchUserData = async () => {
    if (!user) return;
    try {
      const pointsData = await pointsAPI.getUserPoints(user.id);
      setUserPoints(pointsData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen retro-bg flex items-center justify-center">
        <div className="text-center retro-floating">
          <div className="retro-spinner w-16 h-16 mx-auto mb-6"></div>
          <div className="retro-title text-gray-800 text-xl">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  // For demo purposes, create a mock user if not authenticated
  const displayUser = user || {
    username: 'Demo User',
    email: 'demo@kebele.com',
    role: 'user' as const,
    id: 'demo',
    created_at: new Date().toISOString()
  };

  const displayUserPoints = userPoints || { total_points: 150 };

  const quickActions = [
    {
      title: 'Forum',
      description: 'Join community discussions',
      icon: MessageSquare,
      action: () => navigate('/'),
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Games',
      description: 'Play and earn points',
      icon: Trophy,
      action: () => navigate('/'),
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Souq',
      description: 'Browse marketplace',
      icon: ShoppingBag,
      action: () => navigate('/'),
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Radio',
      description: 'Listen to music',
      icon: Radio,
      action: () => navigate('/'),
      color: 'from-orange-500 to-red-500'
    }
  ];

  const recentActivities = [
    { type: 'points', description: 'Earned 50 points from checkers game', time: '2 hours ago', icon: Trophy },
    { type: 'forum', description: 'Posted in community forum', time: '1 day ago', icon: MessageSquare },
    { type: 'purchase', description: 'Made a purchase in Souq', time: '3 days ago', icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen retro-bg retro-bg-enhanced">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section - Welcome */}
        <div className="retro-window retro-floating mb-6">
          <div className="retro-titlebar">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 retro-icon" />
              <span className="retro-title text-sm font-bold uppercase">Your Dashboard</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/')}
                className="retro-btn px-3 py-2 font-medium text-xs flex items-center space-x-2 retro-hover"
              >
                ← BACK TO SITE
              </button>
              <button
                onClick={handleLogout}
                className="retro-btn-secondary px-3 py-2 font-medium text-xs flex items-center space-x-2 retro-hover"
              >
                <LogOut className="w-4 h-4 retro-icon" />
                <span>LOGOUT</span>
              </button>
            </div>
          </div>
          <div className="p-4 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-teal-600 retro-icon">
              <span className="text-white font-bold text-2xl retro-title">
                {displayUser.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl retro-title mb-3 uppercase tracking-tight">
              Welcome back, {displayUser.username || displayUser.email?.split('@')[0]}!
            </h1>
            <p className="text-base retro-text max-w-2xl mx-auto leading-relaxed">
              Here's your activity overview and quick access to all Kebele features
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="retro-window retro-floating">
            <div className="retro-titlebar retro-titlebar-mustard">
              <div className="flex items-center space-x-3">
                <Trophy className="w-5 h-5 retro-icon" />
                <span className="retro-title text-sm">Points</span>
              </div>
            </div>
            <div className="p-4 text-center">
              <div className="text-3xl retro-title text-amber-900 mb-2">{displayUserPoints.total_points}</div>
              <div className="retro-text text-sm uppercase tracking-wide mb-3">Total Points</div>
              <div className="retro-progress mb-2">
                <div className="retro-progress-fill" style={{width: '75%'}}></div>
              </div>
              <p className="retro-text text-xs opacity-90">Keep playing to earn more!</p>
            </div>
          </div>

          <div className="retro-window retro-floating">
            <div className="retro-titlebar retro-titlebar-sky">
              <div className="flex items-center space-x-3">
                <Award className="w-5 h-5 retro-icon" />
                <span className="retro-title text-sm">Account</span>
              </div>
            </div>
            <div className="p-4 text-center">
              <div className="text-xl retro-title text-sky-900 mb-2 capitalize">{displayUser.role}</div>
              <div className="retro-text text-sm uppercase tracking-wide mb-3">Account Type</div>
              <div className="retro-progress mb-2">
                <div className="retro-progress-fill" style={{width: '100%', background: 'linear-gradient(90deg, #06b6d4 0%, #0891b2 100%)'}}></div>
              </div>
              <p className="retro-text text-xs opacity-90">
                Member since {new Date(displayUser.created_at || Date.now()).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="retro-window retro-floating">
            <div className="retro-titlebar retro-titlebar-teal">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-5 h-5 retro-icon" />
                <span className="retro-title text-sm">Level</span>
              </div>
            </div>
            <div className="p-4 text-center">
              <div className="text-xl retro-title text-teal-900 mb-2">Level 2</div>
              <div className="retro-text text-sm uppercase tracking-wide mb-3">Current Level</div>
              <div className="retro-progress mb-2">
                <div className="retro-progress-fill" style={{width: '60%', background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)'}}></div>
              </div>
              <p className="retro-text text-xs opacity-90">240 points to next level</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Quick Actions & Recent Activity */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div className="retro-window retro-floating">
              <div className="retro-titlebar retro-titlebar-coral">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-mustard rounded border-2 border-charcoal flex items-center justify-center text-charcoal font-bold">⚡</div>
                  <span className="retro-title text-sm">Quick Actions</span>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={action.action}
                      className="retro-window p-3 text-center hover:transform hover:scale-105 transition-transform"
                    >
                      <action.icon className="w-6 h-6 mx-auto mb-2 text-charcoal retro-icon" />
                      <h3 className="retro-title text-xs font-bold uppercase mb-1">{action.title}</h3>
                      <p className="retro-text text-xs opacity-90">{action.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="retro-window retro-floating">
              <div className="retro-titlebar retro-titlebar-mustard">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-sky-blue rounded border-2 border-charcoal flex items-center justify-center text-charcoal font-bold">📅</div>
                  <span className="retro-title text-sm">Recent Activity</span>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 bg-white/20 rounded-lg border border-black/10">
                      <activity.icon className="w-5 h-5 text-charcoal retro-icon flex-shrink-0" />
                      <div className="flex-1">
                        <p className="retro-text text-xs font-bold">{activity.description}</p>
                        <p className="retro-text text-xs opacity-70">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Profile & Achievements */}
          <div className="space-y-4">
            {/* Profile Card */}
            <div className="retro-window retro-floating">
              <div className="retro-titlebar retro-titlebar-teal">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 retro-icon" />
                  <span className="retro-title text-sm">Profile</span>
                </div>
              </div>
              <div className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3 border-4 border-teal-600 retro-icon">
                  <span className="text-white font-bold text-lg retro-title">
                    {displayUser.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3 className="retro-title text-base font-bold mb-1">{displayUser.username || displayUser.email?.split('@')[0]}</h3>
                <p className="retro-text text-xs opacity-90 mb-2">{displayUser.email}</p>
                <button className="retro-btn w-full text-xs py-1 font-bold uppercase">
                  EDIT PROFILE
                </button>
              </div>
            </div>

            {/* Achievements */}
            <div className="retro-window retro-floating">
              <div className="retro-titlebar retro-titlebar-sky">
                <div className="flex items-center space-x-3">
                  <Star className="w-5 h-5 retro-icon" />
                  <span className="retro-title text-sm">Achievements</span>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 p-2 bg-white/20 rounded-lg border border-black/10">
                    <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center border-2 border-yellow-600 retro-icon flex-shrink-0">
                      <Star className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <p className="retro-text text-xs font-bold">First Login</p>
                      <p className="retro-text text-xs opacity-80">Welcome to Kebele!</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 bg-white/20 rounded-lg border border-black/10">
                    <div className="w-6 h-6 bg-gradient-to-br from-sky-400 to-blue-500 rounded-lg flex items-center justify-center border-2 border-sky-600 retro-icon flex-shrink-0">
                      <Trophy className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <p className="retro-text text-xs font-bold">Game Master</p>
                      <p className="retro-text text-xs opacity-80">Played 10 games</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 bg-white/30 rounded-lg border border-black/10 opacity-60">
                    <div className="w-6 h-6 bg-gradient-to-br from-gray-300 to-gray-400 rounded-lg flex items-center justify-center border-2 border-gray-500 flex-shrink-0">
                      <Award className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <p className="retro-text text-xs font-bold opacity-70">Community Helper</p>
                      <p className="retro-text text-xs opacity-60">Help 5 community members</p>
                    </div>
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

export default UserDashboard;