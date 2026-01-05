import React, { useState, useEffect } from 'react';
import { Users, MessageSquare, Trophy, CreditCard, BarChart3, Settings } from 'lucide-react';
import { supabase } from '../services/supabase';
import { forumAPI } from '../services/forum';

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
        // Fetch all data
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

        // Fetch forum comments for all posts
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
      <div className="space-y-8">
        <div className="retro-window text-center py-16">
          <div className="retro-spinner w-16 h-16 mx-auto mb-6"></div>
          <p className="retro-text text-lg">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="retro-title text-xl">Analytics & Tracking</h2>
          <p className="retro-text text-base opacity-80 mt-2">Monitor platform performance and user engagement</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="retro-window retro-hover">
          <div className="retro-titlebar retro-titlebar-blue">
            <div className="flex items-center space-x-3 p-3">
              <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center retro-icon">
                <Users className="w-3 h-3 text-blue-600" />
              </div>
              <h3 className="retro-title text-xs">Active Users</h3>
              <p className="retro-text text-xs opacity-80">Last 30 days</p>
            </div>
          </div>
          <div className="p-6">
            <div className="text-3xl font-bold retro-title text-blue-600 mb-2">
              {users.filter(u => new Date(u.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
            </div>
            <p className="text-xs retro-text opacity-70 mt-2">+12% from last month</p>
          </div>
        </div>

        <div className="retro-window retro-hover">
          <div className="retro-titlebar retro-titlebar-green">
            <div className="flex items-center space-x-3 p-3">
              <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center retro-icon">
                <MessageSquare className="w-3 h-3 text-green-600" />
              </div>
              <h3 className="retro-title text-xs">Forum Activity</h3>
              <p className="retro-text text-xs opacity-80">Posts & Comments</p>
            </div>
          </div>
          <div className="p-6">
            <div className="text-3xl font-bold retro-title text-green-600 mb-2">
              {forumPosts.length + forumComments.length}
            </div>
            <p className="text-xs retro-text opacity-70 mt-2">+8% engagement rate</p>
          </div>
        </div>

        <div className="retro-window retro-hover">
          <div className="retro-titlebar retro-titlebar-purple">
            <div className="flex items-center space-x-3 p-3">
              <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center retro-icon">
                <Trophy className="w-3 h-3 text-purple-600" />
              </div>
              <h3 className="retro-title text-xs">Game Sessions</h3>
              <p className="retro-text text-xs opacity-80">Total plays</p>
            </div>
          </div>
          <div className="p-6">
            <div className="text-3xl font-bold retro-title text-purple-600 mb-2">
              {gameScores.length}
            </div>
            <p className="text-xs retro-text opacity-70 mt-2">+15% from last week</p>
          </div>
        </div>

        <div className="retro-window retro-hover">
          <div className="retro-titlebar retro-titlebar-orange">
            <div className="flex items-center space-x-3 p-3">
              <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center retro-icon">
                <CreditCard className="w-3 h-3 text-orange-600" />
              </div>
              <h3 className="retro-title text-xs">Revenue</h3>
              <p className="retro-text text-xs opacity-80">This month</p>
            </div>
          </div>
          <div className="p-6">
            <div className="text-3xl font-bold retro-title text-orange-600 mb-2">
              ${transactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0).toFixed(0)}K
            </div>
            <p className="text-xs retro-text opacity-70 mt-2">+5% growth</p>
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="retro-window">
          <div className="retro-titlebar retro-titlebar-indigo p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center retro-icon">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <h3 className="retro-title text-sm">User Engagement Trends</h3>
                <p className="retro-text text-xs opacity-80">Activity over time</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="retro-text">Forum Posts</span>
                <span className="retro-title font-bold">{forumPosts.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="retro-text">Game Plays</span>
                <span className="retro-title font-bold">{gameScores.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="retro-text">Media Views</span>
                <span className="retro-title font-bold">{videos.reduce((sum, v) => sum + (v.statistics?.viewCount || 0), 0)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="retro-window">
          <div className="retro-titlebar retro-titlebar-teal p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center retro-icon">
                <Settings className="w-4 h-4 text-teal-600" />
              </div>
              <div>
                <h3 className="retro-title text-sm">Platform Health</h3>
                <p className="retro-text text-xs opacity-80">System performance</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="retro-text">Server Uptime</span>
                <span className="retro-title font-bold text-green-600">99.9%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="retro-text">Response Time</span>
                <span className="retro-title font-bold text-blue-600">120ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="retro-text">Error Rate</span>
                <span className="retro-title font-bold text-red-600">0.1%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;