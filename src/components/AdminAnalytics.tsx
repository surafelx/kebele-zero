import React, { useState, useEffect } from 'react';
import { Users, MessageSquare, Trophy, CreditCard, BarChart3, Settings, TrendingUp, Clock, Activity, DollarSign } from 'lucide-react';
import { supabase } from '../services/supabase';
import { forumAPI } from '../services/forum';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  trend?: string;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, trend, subtitle }) => (
  <div className="bg-white rounded-xl p-6 border-4 border-black hover:shadow-lg transition-all duration-200">
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
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1 font-bold uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{subtitle}</p>
        )}
      </div>
      <div className={`w-14 h-14 rounded-xl ${color} flex items-center justify-center shadow-lg border-2 border-black hover:scale-105 transition-transform duration-200`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
    </div>
  </div>
);

const AdminAnalytics: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [forumPosts, setForumPosts] = useState<any[]>([]);
  const [forumComments, setForumComments] = useState<any[]>([]);
  const [gameScores, setGameScores] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          usersRes,
          forumPostsRes,
          gameScoresRes,
          transactionsRes,
          videosRes
        ] = await Promise.all([
          supabase.from('users').select('*'),
          supabase.from('forum_posts').select('*'),
          supabase.from('game_scores').select('*'),
          supabase.from('transactions').select('*'),
          supabase.from('videos').select('*')
        ]);

        setUsers(usersRes.data || []);
        setForumPosts(forumPostsRes.data || []);
        setGameScores(gameScoresRes.data || []);
        setTransactions(transactionsRes.data || []);
        setVideos(videosRes.data || []);

        const allComments: any[] = [];
        for (const post of forumPostsRes.data || []) {
          const comments = await forumAPI.getComments(post.id);
          allComments.push(...comments);
        }
        setForumComments(allComments);
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
          <p className="text-gray-600 font-bold uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Loading analytics...</p>
        </div>
      </div>
    );
  }

  const totalRevenue = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);

  const activeUsersThisMonth = users.filter(u => 
    new Date(u.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-gray-800 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Analytics & Tracking</h2>
          <p className="text-gray-600 mt-1 font-bold uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Monitor platform performance and user engagement</p>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 rounded-xl border-2 border-black">
          <Activity className="w-4 h-4 text-green-600" />
          <span className="text-sm font-bold text-green-700 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Live</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Active Users" 
          value={activeUsersThisMonth}
          icon={Users} 
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          trend="+12%"
          subtitle="Last 30 days"
        />
        <StatCard 
          title="Forum Activity" 
          value={forumPosts.length + forumComments.length}
          icon={MessageSquare} 
          color="bg-gradient-to-br from-green-500 to-green-600"
          trend="+8%"
          subtitle="Posts & Comments"
        />
        <StatCard 
          title="Game Sessions" 
          value={gameScores.length}
          icon={Trophy} 
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          trend="+15%"
          subtitle="Total plays"
        />
        <StatCard 
          title="Revenue" 
          value={`$${totalRevenue.toLocaleString()}`}
          icon={DollarSign} 
          color="bg-gradient-to-br from-amber-500 to-amber-600"
          trend="+5%"
          subtitle="This month"
        />
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Engagement Trends */}
        <div className="bg-white rounded-xl shadow-sm border-4 border-black overflow-hidden">
          <div className="p-6 border-b-4 border-black">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center border-2 border-black">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-black text-gray-800 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>User Engagement Trends</h3>
                <p className="text-xs text-gray-600 font-bold uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Activity over time</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border-2 border-black">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center border-2 border-black">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <span className="font-bold text-gray-800" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Total Users</span>
              </div>
              <span className="text-xl font-black text-gray-800" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{users.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border-2 border-black">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center border-2 border-black">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                </div>
                <span className="font-bold text-gray-800" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Forum Posts</span>
              </div>
              <span className="text-xl font-black text-gray-800" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{forumPosts.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border-2 border-black">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center border-2 border-black">
                  <Trophy className="w-5 h-5 text-purple-600" />
                </div>
                <span className="font-bold text-gray-800" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Game Plays</span>
              </div>
              <span className="text-xl font-black text-gray-800" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{gameScores.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border-2 border-black">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center border-2 border-black">
                  <Activity className="w-5 h-5 text-amber-600" />
                </div>
                <span className="font-bold text-gray-800" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Media Views</span>
              </div>
              <span className="text-xl font-black text-gray-800" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{videos.reduce((sum, v) => sum + (v.statistics?.viewCount || 0), 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Platform Health */}
        <div className="bg-white rounded-xl shadow-sm border-4 border-black overflow-hidden">
          <div className="p-6 border-b-4 border-black">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center border-2 border-black">
                <Settings className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h3 className="font-black text-gray-800 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Platform Health</h3>
                <p className="text-xs text-gray-600 font-bold uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>System performance</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl border-2 border-black">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center border-2 border-black">
                  <Activity className="w-5 h-5 text-green-600" />
                </div>
                <span className="font-bold text-gray-800" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Server Uptime</span>
              </div>
              <span className="text-xl font-black text-green-600" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>99.9%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl border-2 border-black">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center border-2 border-black">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <span className="font-bold text-gray-800" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Response Time</span>
              </div>
              <span className="text-xl font-black text-blue-600" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>120ms</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl border-2 border-black">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center border-2 border-black">
                  <Activity className="w-5 h-5 text-red-600" />
                </div>
                <span className="font-bold text-gray-800" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Error Rate</span>
              </div>
              <span className="text-xl font-black text-red-600" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>0.1%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-amber-50 rounded-xl border-2 border-black">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center border-2 border-black">
                  <DollarSign className="w-5 h-5 text-amber-600" />
                </div>
                <span className="font-bold text-gray-800" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Total Revenue</span>
              </div>
              <span className="text-xl font-black text-amber-600" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>${totalRevenue.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
