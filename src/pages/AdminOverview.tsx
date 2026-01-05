import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, ShoppingBag, Radio, Image, BarChart3, MessageSquare, Trophy, CreditCard, ArrowLeft } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

const AdminOverview = () => {
  const navigate = useNavigate();
  const { user, logout, login, loading: authLoading } = useAuth();

  // Data states
  const [users, setUsers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [radioTracks, setRadioTracks] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [forumPosts, setForumPosts] = useState<any[]>([]);
  const [gameScores, setGameScores] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch data when user is authenticated
  useEffect(() => {
    if (!authLoading && user) {
      fetchAllData();
    }
  }, [user, authLoading]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (!usersError) {
        setUsers(usersData || []);
      }

      // Fetch events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (!eventsError) {
        setEvents(eventsData || []);
      }

      // Fetch videos
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (!videosError) {
        setVideos(videosData || []);
      }

      // Fetch radio tracks
      const { data: radioData, error: radioError } = await supabase
        .from('radio')
        .select('*')
        .order('created_at', { ascending: false });

      if (!radioError) {
        setRadioTracks(radioData || []);
      }

      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!transactionsError) {
        setTransactions(transactionsData || []);
      }

      // Fetch forum posts
      const { data: postsData, error: postsError } = await supabase
        .from('forum_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!postsError) {
        setForumPosts(postsData || []);
      }

      // Fetch game scores
      const { data: scoresData, error: scoresError } = await supabase
        .from('game_scores')
        .select('*')
        .order('played_at', { ascending: false });

      if (!scoresError) {
        setGameScores(scoresData || []);
      }

      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!productsError) {
        setProducts(productsData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen retro-bg flex items-center justify-center">
        <div className="text-center retro-floating">
          <div className="retro-spinner w-16 h-16 mx-auto mb-6"></div>
          <p className="retro-title text-gray-800">Checking authentication...</p>
          <p className="retro-text text-gray-700 text-sm mt-2">This may take a few seconds</p>
        </div>
      </div>
    );
  }

  // Allow demo access
  const displayUser = user || {
    email: 'admin@kebele.com',
    role: 'admin' as const,
    id: 'admin-demo'
  };

  return (
    <div className="min-h-screen retro-bg">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-charcoal">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin')}
                className="retro-btn px-4 py-2 flex items-center space-x-2"
              >
                <ArrowLeft className="w-5 h-5 retro-icon" />
                <span>Back to Dashboard</span>
              </button>
              <div>
                <h1 className="retro-title text-2xl font-bold">Admin Overview</h1>
                <p className="retro-text text-sm opacity-80">Platform statistics and recent activity</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="retro-title text-sm">Welcome back</p>
                <p className="retro-text text-xs opacity-80">{displayUser.email}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center border-4 border-amber-600 retro-icon">
                <span className="text-white font-bold text-lg retro-title">
                  {displayUser.email?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-16">
            <div className="retro-spinner w-16 h-16 mx-auto mb-6"></div>
            <p className="retro-text text-lg">Loading overview data...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="retro-window">
              <div className="retro-titlebar retro-titlebar-coral">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-5 h-5 retro-icon" />
                  <span className="retro-title text-sm uppercase">Dashboard Overview</span>
                </div>
              </div>
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-amber-600 retro-icon">
                  <span className="text-white font-bold text-2xl retro-title">
                    {displayUser.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h1 className="text-xl md:text-2xl retro-title mb-2 uppercase">
                  Welcome back, {displayUser.email?.split('@')[0]}!
                </h1>
                <p className="text-sm retro-text max-w-2xl mx-auto leading-relaxed">
                  Manage your platform content and settings
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              <div className="retro-card retro-hover">
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center shadow-md border-2 border-amber-400 retro-icon">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-amber-900 retro-title">{users.length}</p>
                      <p className="text-xs text-amber-700 uppercase tracking-wide retro-text">Users</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="retro-card retro-hover">
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-md border-2 border-green-400 retro-icon">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-green-900 retro-title">{events.length}</p>
                      <p className="text-xs text-green-700 uppercase tracking-wide retro-text">Events</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="retro-card retro-floating retro-hover">
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-md border-2 border-purple-400 retro-icon">
                      <Image className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-purple-900 retro-title">{videos.length}</p>
                      <p className="text-xs text-purple-700 uppercase tracking-wide retro-text">Videos</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="retro-card retro-floating retro-hover">
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-md border-2 border-orange-400 retro-icon">
                      <CreditCard className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-orange-900 retro-title">
                      ${transactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0).toFixed(0)}
                      </p>
                      <p className="text-xs text-orange-700 uppercase tracking-wide retro-text">Revenue</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="retro-card retro-floating retro-hover">
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-md border-2 border-blue-400 retro-icon">
                      <Radio className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-900 retro-title">{radioTracks.length}</p>
                      <p className="text-xs text-blue-700 uppercase tracking-wide retro-text">Radio</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="retro-card retro-floating retro-hover">
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center shadow-md border-2 border-pink-400 retro-icon">
                      <ShoppingBag className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-pink-900 retro-title">{products.length}</p>
                      <p className="text-xs text-pink-700 uppercase tracking-wide retro-text">Products</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="retro-card retro-floating retro-hover">
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-md border-2 border-teal-400 retro-icon">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-teal-900 retro-title">{forumPosts.length}</p>
                      <p className="text-xs text-teal-700 uppercase tracking-wide retro-text">Posts</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="retro-card retro-floating retro-hover">
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-lg flex items-center justify-center shadow-md border-2 border-yellow-400 retro-icon">
                      <Trophy className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-yellow-900 retro-title">{gameScores.length}</p>
                      <p className="text-xs text-yellow-700 uppercase tracking-wide retro-text">Games</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="retro-card retro-floating retro-hover">
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shadow-md border-2 border-indigo-400 retro-icon">
                      <CreditCard className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-indigo-900 retro-title">{transactions.length}</p>
                      <p className="text-xs text-indigo-700 uppercase tracking-wide retro-text">Transactions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="retro-window">
                <div className="retro-titlebar retro-titlebar-teal">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 retro-icon" />
                    <div>
                      <h3 className="retro-title text-sm">Recent Events</h3>
                      <p className="retro-text text-xs opacity-80">Latest event activity</p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  {events.slice(0, 4).length === 0 ? (
                    <div className="text-center py-6">
                      <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2 retro-icon" />
                      <p className="retro-text text-sm">No events yet</p>
                      <p className="retro-text text-xs opacity-70">Create your first event to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {events.slice(0, 4).map((event) => (
                        <div key={event.id} className="flex items-center space-x-3 p-2 retro-card retro-hover">
                          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-900 truncate retro-title">{event.title}</p>
                            <p className="text-xs text-gray-500 retro-text">
                              📅 {new Date(event.start_date).toLocaleDateString()} • 📍 {event.location?.venue || 'TBD'}
                            </p>
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium retro-badge">
                            Active
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="retro-window">
                <div className="retro-titlebar retro-titlebar-sky">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-4 h-4 retro-icon" />
                    <div>
                      <h3 className="retro-title text-sm">Recent Transactions</h3>
                      <p className="retro-text text-xs opacity-80">Payment activity overview</p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  {transactions.slice(0, 4).length === 0 ? (
                    <div className="text-center py-6">
                      <CreditCard className="w-10 h-10 text-gray-300 mx-auto mb-2 retro-icon" />
                      <p className="retro-text text-sm">No transactions yet</p>
                      <p className="retro-text text-xs opacity-70">Transactions will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {transactions.slice(0, 4).map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-2 retro-card retro-hover">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              transaction.status === 'completed' ? 'bg-green-500' :
                              transaction.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}></div>
                            <div>
                              <p className="text-xs font-semibold text-gray-900 retro-title">
                                ${transaction.amount} {transaction.currency}
                              </p>
                              <p className="text-xs text-gray-500 retro-text">
                                {new Date(transaction.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold retro-badge ${
                            transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                            transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {transaction.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOverview;