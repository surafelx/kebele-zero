import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, Settings, Trophy, MessageSquare, Gamepad2, Plus, Search, Filter, X, Mail, User as UserIcon, Shield, Eye, Edit, Trash2 } from 'lucide-react';
import { supabase } from '../services/supabase';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [userPoints, setUserPoints] = useState<any[]>([]);
  const [forumPosts, setForumPosts] = useState<any[]>([]);
  const [gameScores, setGameScores] = useState<any[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userFilterStatus, setUserFilterStatus] = useState('');
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userFormData, setUserFormData] = useState({
    email: '',
    username: '',
    role: 'user',
    is_active: true
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          usersRes,
          userPointsRes,
          forumPostsRes,
          gameScoresRes
        ] = await Promise.all([
          supabase.from('users').select('*'),
          supabase.from('user_points').select('*'),
          supabase.from('forum_posts').select('*'),
          supabase.from('game_scores').select('*')
        ]);

        setUsers(usersRes.data || []);
        setUserPoints(userPointsRes.data || []);
        setForumPosts(forumPostsRes.data || []);
        setGameScores(gameScoresRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = userSearchTerm === '' ||
      user.email?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(userSearchTerm.toLowerCase());
    const matchesFilter = userFilterStatus === '' ||
      (userFilterStatus === 'active' && user.is_active) ||
      (userFilterStatus === 'inactive' && !user.is_active) ||
      (userFilterStatus === 'admin' && user.role === 'admin') ||
      (userFilterStatus === 'user' && user.role === 'user');
    return matchesSearch && matchesFilter;
  });

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.is_active).length;
  const adminUsers = users.filter(u => u.role === 'admin').length;
  const totalPoints = userPoints.reduce((sum, p) => sum + (p.total_points || 0), 0);
  const totalPosts = forumPosts.length;
  const totalGames = gameScores.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
          <p className="text-gray-500 mt-1">Manage platform users and their roles</p>
        </div>
        <button
          onClick={() => { setShowUserForm(true); setEditingUser(null); setUserFormData({ email: '', username: '', role: 'user', is_active: true }); }}
          className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
        >
          <Plus className="w-5 h-5" />
          <span>Add User</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 mb-3">
              <Users className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{totalUsers}</p>
            <p className="text-xs text-gray-500 font-medium">Total Users</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-200 mb-3">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{activeUsers}</p>
            <p className="text-xs text-gray-500 font-medium">Active</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200 mb-3">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{adminUsers}</p>
            <p className="text-xs text-gray-500 font-medium">Admins</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-200 mb-3">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{totalPoints.toLocaleString()}</p>
            <p className="text-xs text-gray-500 font-medium">Total Points</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-200 mb-3">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{totalPosts}</p>
            <p className="text-xs text-gray-500 font-medium">Forum Posts</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-200 mb-3">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{totalGames}</p>
            <p className="text-xs text-gray-500 font-medium">Games Played</p>
          </div>
        </div>
      </div>

      {/* User Form Modal */}
      {showUserForm && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => { setShowUserForm(false); setEditingUser(null); }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">{editingUser ? 'Edit User' : 'Add New User'}</h3>
              <button 
                onClick={() => { setShowUserForm(false); setEditingUser(null); }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
              >
                <X className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  if (editingUser) {
                    const { error } = await supabase
                      .from('users')
                      .update(userFormData)
                      .eq('id', editingUser.id);
                    if (error) throw error;
                    setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...userFormData } : u));
                  } else {
                    const { data, error } = await supabase
                      .from('users')
                      .insert([userFormData])
                      .select();
                    if (error) throw error;
                    setUsers([...users, data[0]]);
                  }
                  setShowUserForm(false);
                  setEditingUser(null);
                  setUserFormData({ email: '', username: '', role: 'user', is_active: true });
                } catch (error) {
                  console.error('Error saving user:', error);
                  alert('Error saving user');
                }
              }} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={userFormData.email}
                      onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="user@example.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={userFormData.username}
                      onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="username"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={userFormData.role}
                      onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={userFormData.is_active}
                    onChange={(e) => setUserFormData({ ...userFormData, is_active: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Active</label>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors">
                    {editingUser ? 'Update User' : 'Add User'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowUserForm(false); setEditingUser(null); setUserFormData({ email: '', username: '', role: 'user', is_active: true }); }}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by email or username..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="lg:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={userFilterStatus}
                onChange={(e) => setUserFilterStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
              >
                <option value="">All Users</option>
                <option value="active">Active Users</option>
                <option value="inactive">Inactive Users</option>
                <option value="admin">Admins</option>
                <option value="user">Regular Users</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 text-center py-16">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 text-center py-16">
          <Users className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-800">No users found</p>
          <p className="text-gray-500 mt-2">
            {users.length === 0 ? 'Users will appear here' : 'No users match your search criteria'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left p-4 text-sm font-semibold text-gray-600">User</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-600">Role</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-600">Points</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-600">Posts</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-600">Games</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-600">Joined</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const userStats = userPoints.find(p => p.user_id === user.id);
                  const userPostsCount = forumPosts.filter(p => p.created_by === user.id).length;
                  const userGamesCount = gameScores.filter(g => g.user_id === user.id).length;
                  return (
                    <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                            <span className="text-white font-bold text-sm">
                              {user.email?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{user.username || user.email?.split('@')[0]}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <select
                          value={user.role || 'user'}
                          onChange={async (e) => {
                            try {
                              const { error } = await supabase
                                .from('users')
                                .update({ role: e.target.value })
                                .eq('id', user.id);
                              if (error) throw error;
                              setUsers(users.map(u => u.id === user.id ? { ...u, role: e.target.value } : u));
                              alert('User role updated successfully!');
                            } catch (error) {
                              console.error('Error updating user role:', error);
                              alert('Error updating user role');
                            }
                          }}
                          className="px-3 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-amber-600">{userStats?.total_points || 0}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-blue-600">{userPostsCount}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-green-600">{userGamesCount}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setUserFormData({
                                email: user.email || '',
                                username: user.username || '',
                                role: user.role || 'user',
                                is_active: user.is_active || true
                              });
                              setShowUserForm(true);
                            }}
                            className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={async () => {
                              if (!confirm('Are you sure you want to deactivate this user?')) return;
                              try {
                                const { error } = await supabase
                                  .from('users')
                                  .update({ is_active: false })
                                  .eq('id', user.id);
                                if (error) throw error;
                                setUsers(users.map(u => u.id === user.id ? { ...u, is_active: false } : u));
                                alert('User deactivated successfully!');
                              } catch (error) {
                                console.error('Error deactivating user:', error);
                                alert('Error deactivating user');
                              }
                            }}
                            className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                            disabled={!user.is_active}
                            title="Deactivate"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
