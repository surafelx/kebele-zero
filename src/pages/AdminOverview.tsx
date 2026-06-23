import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, ShoppingBag, Radio, Image, BarChart3, MessageSquare, Trophy, CreditCard } from 'lucide-react';
import { adminAPI, transactionsAPI } from '../services/admin';
import { eventsAPI } from '../services/content';
import { useAuth } from '../contexts/AuthContext';

// Safe date format — avoids "Invalid Date" when a record has no/blank date.
const fmtDate = (d?: string) => {
  if (!d) return 'TBA';
  const date = new Date(d);
  return isNaN(date.getTime()) ? 'TBA' : date.toLocaleDateString();
};

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
      const stats = await adminAPI.getStats();
      // Counts come from stats; the lists below use real data fetched separately.
      if (stats) {
        setUsers(Array(stats.totalUsers || 0).fill({}));
        setVideos(Array(stats.totalMedia || 0).fill({}));
        setRadioTracks(Array(stats.totalRadio || 0).fill({}));
        setForumPosts(Array(stats.totalPosts || 0).fill({}));
        setGameScores(Array(stats.totalGames || 0).fill({}));
        setProducts(Array(stats.totalProducts || 0).fill({}));
      }
      // Real data for the "Recent Events" / "Recent Transactions" lists.
      const [evts, txns] = await Promise.all([
        eventsAPI.getEvents().catch(() => []),
        transactionsAPI.getAll().catch(() => []),
      ]);
      setEvents(Array.isArray(evts) ? evts : []);
      setTransactions(Array.isArray(txns) ? txns : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="h-full flex items-center justify-center retro-bg">
        <div className="text-center">
          <div className="retro-spinner w-16 h-16 mx-auto mb-6"></div>
          <p className="retro-title text-gray-800">Checking authentication...</p>
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
    <div className="h-full retro-bg">
      {/* Page Header */}
      <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6">
        <div className="flex items-center justify-between px-6 py-4 border-b-4 border-black bg-gradient-to-r from-emerald-600 to-teal-600">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-2 border-black shadow-lg">
              <BarChart3 className="w-7 h-7 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Dashboard Overview</h1>
              <p className="text-sm text-emerald-100 font-bold uppercase">Platform statistics and recent activity</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-white">{displayUser.email}</p>
              <p className="text-xs text-emerald-200 uppercase">{displayUser.role}</p>
            </div>
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border-2 border-black shadow-lg">
              <span className="text-lg font-bold" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                {displayUser.email?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 border-b-4 border-black">
          <p className="retro-text">
            Welcome back! Manage your platform content and settings from this dashboard. Use the sidebar navigation to access different sections.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="retro-spinner w-16 h-16 mx-auto mb-6"></div>
            <p className="retro-text text-lg">Loading overview data...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Cards - Bigger and More Spaced */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-transform">
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-4 border-black">
                    <Users className="w-6 h-6 text-black" />
                  </div>
                  <p className="text-3xl font-black text-gray-900 retro-title">{users.length}</p>
                </div>
                <p className="text-sm font-bold text-gray-700 uppercase tracking-wide retro-text">Users</p>
              </div>
            </div>

            <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-transform">
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-4 border-black">
                    <Calendar className="w-6 h-6 text-black" />
                  </div>
                  <p className="text-3xl font-black text-gray-900 retro-title">{events.length}</p>
                </div>
                <p className="text-sm font-bold text-gray-700 uppercase tracking-wide retro-text">Events</p>
              </div>
            </div>

            <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-transform">
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-4 border-black">
                    <Image className="w-6 h-6 text-black" />
                  </div>
                  <p className="text-3xl font-black text-gray-900 retro-title">{videos.length}</p>
                </div>
                <p className="text-sm font-bold text-gray-700 uppercase tracking-wide retro-text">Videos</p>
              </div>
            </div>

            <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-transform">
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-4 border-black">
                    <CreditCard className="w-6 h-6 text-black" />
                  </div>
                  <p className="text-3xl font-black text-gray-900 retro-title">
                    ${transactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0).toFixed(0)}
                  </p>
                </div>
                <p className="text-sm font-bold text-gray-700 uppercase tracking-wide retro-text">Revenue</p>
              </div>
            </div>

            <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-transform">
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-4 border-black">
                    <Radio className="w-6 h-6 text-black" />
                  </div>
                  <p className="text-3xl font-black text-gray-900 retro-title">{radioTracks.length}</p>
                </div>
                <p className="text-sm font-bold text-gray-700 uppercase tracking-wide retro-text">Radio</p>
              </div>
            </div>

            <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-transform">
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-4 border-black">
                    <ShoppingBag className="w-6 h-6 text-black" />
                  </div>
                  <p className="text-3xl font-black text-gray-900 retro-title">{products.length}</p>
                </div>
                <p className="text-sm font-bold text-gray-700 uppercase tracking-wide retro-text">Products</p>
              </div>
            </div>

            <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-transform">
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-4 border-black">
                    <MessageSquare className="w-6 h-6 text-black" />
                  </div>
                  <p className="text-3xl font-black text-gray-900 retro-title">{forumPosts.length}</p>
                </div>
                <p className="text-sm font-bold text-gray-700 uppercase tracking-wide retro-text">Posts</p>
              </div>
            </div>

            <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-transform">
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-4 border-black">
                    <Trophy className="w-6 h-6 text-black" />
                  </div>
                  <p className="text-3xl font-black text-gray-900 retro-title">{gameScores.length}</p>
                </div>
                <p className="text-sm font-bold text-gray-700 uppercase tracking-wide retro-text">Games</p>
              </div>
            </div>

            <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-transform">
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-4 border-black">
                    <CreditCard className="w-6 h-6 text-black" />
                  </div>
                  <p className="text-3xl font-black text-gray-900 retro-title">{transactions.length}</p>
                </div>
                <p className="text-sm font-bold text-gray-700 uppercase tracking-wide retro-text">Transactions</p>
              </div>
            </div>
          </div>

          {/* Recent Activity - Bigger Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between px-6 py-4 border-b-4 border-black bg-gradient-to-r from-green-500 to-emerald-500">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-6 h-6 text-white" />
                  <h3 className="text-lg font-black text-white uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Recent Events</h3>
                </div>
              </div>
              <div className="p-6">
                {events.slice(0, 4).length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                    <p className="retro-text text-lg">No events yet</p>
                    <p className="retro-text text-sm opacity-70">Create your first event to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {events.slice(0, 4).map((event) => (
                      <div key={event.id} className="flex items-center space-x-4 p-4 bg-gray-50 border-2 border-black rounded-lg">
                        <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-lg font-bold text-gray-900 truncate retro-title">{event.title}</p>
                          <p className="text-sm retro-text text-gray-500">
                            📅 {fmtDate(event.start_date || event.startDate || event.date)} • 📍 {event.location?.venue || 'TBD'}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 border-2 border-green-500 rounded-lg text-sm font-bold text-green-800 retro-text">Active</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between px-6 py-4 border-b-4 border-black bg-gradient-to-r from-blue-500 to-indigo-500">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-6 h-6 text-white" />
                  <h3 className="text-lg font-black text-white uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Recent Transactions</h3>
                </div>
              </div>
              <div className="p-6">
                {transactions.slice(0, 4).length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                    <p className="retro-text text-lg">No transactions yet</p>
                    <p className="retro-text text-sm opacity-70">Transactions will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.slice(0, 4).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 border-2 border-black rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full ${transaction.status === 'completed' ? 'bg-green-500' : transaction.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                          <div>
                            <p className="text-lg font-bold text-gray-900 retro-title">
                              ${transaction.amount} {transaction.currency}
                            </p>
                            <p className="text-sm retro-text text-gray-500">
                              {fmtDate(transaction.created_at || transaction.createdAt)}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 border-2 rounded-lg text-sm font-bold retro-text ${
                          transaction.status === 'completed' ? 'bg-green-100 border-green-500 text-green-800' :
                          transaction.status === 'pending' ? 'bg-yellow-100 border-yellow-500 text-yellow-800' :
                          'bg-red-100 border-red-500 text-red-800'
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
  );
};

export default AdminOverview;
