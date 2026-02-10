import React, { useState, useEffect } from 'react';
import { Users, Calendar, ShoppingBag, Radio, Image, CreditCard, MessageSquare, Trophy, TrendingUp, ArrowRight } from 'lucide-react';
import { supabase } from '../services/supabase';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  trend?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, trend, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-white rounded-xl p-6 border-4 border-black hover:shadow-lg hover:border-gray-300 transition-all duration-200 cursor-pointer group"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 font-bold uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{title}</p>
        <p className="text-3xl font-black text-gray-800 mt-1" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{value}</p>
        {trend && (
          <div className="flex items-center mt-2">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-xs font-bold text-green-600 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{trend}</span>
          </div>
        )}
      </div>
      <div className={`w-14 h-14 rounded-xl ${color} flex items-center justify-center shadow-lg border-2 border-black group-hover:scale-105 transition-transform duration-200`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
    </div>
  </div>
);

interface ActivityItemProps {
  title: string;
  subtitle: string;
  time: string;
  status?: 'success' | 'warning' | 'error' | 'info';
  icon?: React.ElementType;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ title, subtitle, time, status = 'info', icon: Icon }) => {
  const statusColors = {
    success: 'bg-green-100 border-2 border-black',
    warning: 'bg-yellow-100 border-2 border-black',
    error: 'bg-red-100 border-2 border-black',
    info: 'bg-blue-100 border-2 border-black'
  };

  return (
    <div className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-xl transition-colors duration-150 border-2 border-transparent hover:border-black">
      <div className={`w-10 h-10 rounded-lg ${statusColors[status]} flex items-center justify-center flex-shrink-0`}>
        {Icon ? <Icon className="w-5 h-5" /> : <div className="w-2 h-2 bg-current rounded-full" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-800 truncate" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{title}</p>
        <p className="text-sm text-gray-600 truncate font-medium" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{subtitle}</p>
      </div>
      <span className="text-xs text-gray-500 whitespace-nowrap font-bold uppercase" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{time}</span>
    </div>
  );
};

const AdminOverview: React.FC<{ onNavigateToTab?: (tab: string) => void }> = ({ onNavigateToTab }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [forumPosts, setForumPosts] = useState<any[]>([]);
  const [gameScores, setGameScores] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [displayUser, setDisplayUser] = useState<{ email?: string; role?: string; id?: string }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setDisplayUser({
            email: session.user.email,
            role: 'admin',
            id: session.user.id
          });
        }

        const [
          usersRes,
          eventsRes,
          videosRes,
          transactionsRes,
          forumPostsRes,
          gameScoresRes,
          productsRes
        ] = await Promise.all([
          supabase.from('users').select('*'),
          supabase.from('events').select('*'),
          supabase.from('videos').select('*'),
          supabase.from('transactions').select('*'),
          supabase.from('forum_posts').select('*'),
          supabase.from('game_scores').select('*'),
          supabase.from('products').select('*')
        ]);

        setUsers(usersRes.data || []);
        setEvents(eventsRes.data || []);
        setVideos(videosRes.data || []);
        setTransactions(transactionsRes.data || []);
        setForumPosts(forumPostsRes.data || []);
        setGameScores(gameScoresRes.data || []);
        setProducts(productsRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-bold uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const totalRevenue = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-8 text-white border-4 border-black">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center border-2 border-white shadow-lg">
            <span className="text-2xl font-black uppercase" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
              {displayUser.email?.charAt(0).toUpperCase() || 'A'}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Welcome back!</h1>
            <p className="text-emerald-100 font-bold uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Here's what's happening with your platform today.</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={users.length} 
          icon={Users} 
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          trend="+12%"
          onClick={() => onNavigateToTab?.('users')}
        />
        <StatCard 
          title="Events" 
          value={events.length} 
          icon={Calendar} 
          color="bg-gradient-to-br from-green-500 to-green-600"
          onClick={() => onNavigateToTab?.('events')}
        />
        <StatCard 
          title="Products" 
          value={products.length} 
          icon={ShoppingBag} 
          color="bg-gradient-to-br from-pink-500 to-pink-600"
          onClick={() => onNavigateToTab?.('souq')}
        />
        <StatCard 
          title="Revenue" 
          value={`$${totalRevenue.toLocaleString()}`} 
          icon={CreditCard} 
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          trend="+8%"
          onClick={() => onNavigateToTab?.('transactions')}
        />
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Forum Posts" 
          value={forumPosts.length} 
          icon={MessageSquare} 
          color="bg-gradient-to-br from-teal-500 to-teal-600"
          onClick={() => onNavigateToTab?.('forum')}
        />
        <StatCard 
          title="Games Played" 
          value={gameScores.length} 
          icon={Trophy} 
          color="bg-gradient-to-br from-amber-500 to-amber-600"
          onClick={() => onNavigateToTab?.('games')}
        />
        <StatCard 
          title="Videos" 
          value={videos.length} 
          icon={Image} 
          color="bg-gradient-to-br from-indigo-500 to-indigo-600"
          onClick={() => onNavigateToTab?.('media')}
        />
        <StatCard 
          title="Transactions" 
          value={transactions.length} 
          icon={Radio} 
          color="bg-gradient-to-br from-cyan-500 to-cyan-600"
          onClick={() => onNavigateToTab?.('transactions')}
        />
      </div>

      {/* Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Events */}
        <div className="bg-white rounded-xl shadow-sm border-4 border-black overflow-hidden">
          <div className="p-6 border-b-4 border-black flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center border-2 border-black">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-black text-gray-800 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Recent Events</h3>
                <p className="text-xs text-gray-600 font-bold uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Latest activity</p>
              </div>
            </div>
            <button 
              onClick={() => onNavigateToTab?.('events')}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-bold uppercase tracking-wide flex items-center space-x-1 border-2 border-black px-3 py-1 rounded-lg hover:bg-emerald-50 transition-colors"
              style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
            >
              <span>View all</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y-2 divide-gray-100">
            {events.slice(0, 4).length === 0 ? (
              <div className="p-8 text-center">
                <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-bold uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>No events yet</p>
              </div>
            ) : (
              events.slice(0, 4).map((event) => (
                <ActivityItem 
                  key={event.id}
                  title={event.title || 'Untitled Event'}
                  subtitle={event.location?.venue || 'TBD'}
                  time={event.start_date ? new Date(event.start_date).toLocaleDateString() : ''}
                  status={event.is_active ? 'success' : 'warning'}
                  icon={Calendar}
                />
              ))
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border-4 border-black overflow-hidden">
          <div className="p-6 border-b-4 border-black flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center border-2 border-black">
                <CreditCard className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-black text-gray-800 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Transactions</h3>
                <p className="text-xs text-gray-600 font-bold uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Recent payments</p>
              </div>
            </div>
            <button 
              onClick={() => onNavigateToTab?.('transactions')}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-bold uppercase tracking-wide flex items-center space-x-1 border-2 border-black px-3 py-1 rounded-lg hover:bg-emerald-50 transition-colors"
              style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
            >
              <span>View all</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y-2 divide-gray-100">
            {transactions.slice(0, 4).length === 0 ? (
              <div className="p-8 text-center">
                <CreditCard className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-bold uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>No transactions yet</p>
              </div>
            ) : (
              transactions.slice(0, 4).map((transaction) => (
                <ActivityItem 
                  key={transaction.id}
                  title={`$${parseFloat(transaction.amount || '0').toFixed(2)}`}
                  subtitle={transaction.description || transaction.type || 'Payment'}
                  time={transaction.created_at ? new Date(transaction.created_at).toLocaleDateString() : ''}
                  status={transaction.status === 'completed' ? 'success' : transaction.status === 'pending' ? 'warning' : 'error'}
                  icon={CreditCard}
                />
              ))
            )}
          </div>
        </div>

        {/* Forum Posts */}
        <div className="bg-white rounded-xl shadow-sm border-4 border-black overflow-hidden">
          <div className="p-6 border-b-4 border-black flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center border-2 border-black">
                <MessageSquare className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h3 className="font-black text-gray-800 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Forum Posts</h3>
                <p className="text-xs text-gray-600 font-bold uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Community discussions</p>
              </div>
            </div>
            <button 
              onClick={() => onNavigateToTab?.('forum')}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-bold uppercase tracking-wide flex items-center space-x-1 border-2 border-black px-3 py-1 rounded-lg hover:bg-emerald-50 transition-colors"
              style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
            >
              <span>View all</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y-2 divide-gray-100">
            {forumPosts.slice(0, 4).length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-bold uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>No posts yet</p>
              </div>
            ) : (
              forumPosts.slice(0, 4).map((post) => (
                <ActivityItem 
                  key={post.id}
                  title={post.title || 'Untitled Post'}
                  subtitle={post.category || 'General'}
                  time={post.created_at ? new Date(post.created_at).toLocaleDateString() : ''}
                  status="info"
                  icon={MessageSquare}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
