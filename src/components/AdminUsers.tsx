import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, Shield, Trophy, MessageSquare, Gamepad2, Plus, Search, Filter, X, Mail, User as UserIcon, Edit, Trash2 } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between px-6 py-4 border-b-4 border-black bg-gradient-to-r from-emerald-600 to-teal-600">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-2 border-black shadow-lg">
              <Users className="w-7 h-7 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>User Management</h1>
              <p className="text-sm text-emerald-100 font-bold uppercase">Manage platform users and roles</p>
            </div>
          </div>
          <button
            onClick={() => { setShowUserForm(true); setEditingUser(null); setUserFormData({ email: '', username: '', role: 'user', is_active: true }); }}
            className="retro-btn px-4 py-2 bg-white text-black"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Add User
          </button>
        </div>
      </div>

      {/* Stats Cards - Retro Style with Black Icons */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-4 text-center">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-4 border-black mx-auto mb-3">
              <Users className="w-6 h-6 text-black" />
            </div>
            <p className="text-3xl font-black text-gray-900 retro-title">{totalUsers}</p>
            <p className="text-sm font-bold text-gray-700 uppercase tracking-wide retro-text">Users</p>
          </div>
        </div>
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-4 text-center">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-4 border-black mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-black" />
            </div>
            <p className="text-3xl font-black text-gray-900 retro-title">{activeUsers}</p>
            <p className="text-sm font-bold text-gray-700 uppercase tracking-wide retro-text">Active</p>
          </div>
        </div>
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-4 text-center">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-4 border-black mx-auto mb-3">
              <Shield className="w-6 h-6 text-black" />
            </div>
            <p className="text-3xl font-black text-gray-900 retro-title">{adminUsers}</p>
            <p className="text-sm font-bold text-gray-700 uppercase tracking-wide retro-text">Admins</p>
          </div>
        </div>
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-4 text-center">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-4 border-black mx-auto mb-3">
              <Trophy className="w-6 h-6 text-black" />
            </div>
            <p className="text-3xl font-black text-gray-900 retro-title">{totalPoints.toLocaleString()}</p>
            <p className="text-sm font-bold text-gray-700 uppercase tracking-wide retro-text">Points</p>
          </div>
        </div>
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-4 text-center">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-4 border-black mx-auto mb-3">
              <MessageSquare className="w-6 h-6 text-black" />
            </div>
            <p className="text-3xl font-black text-gray-900 retro-title">{totalPosts}</p>
            <p className="text-sm font-bold text-gray-700 uppercase tracking-wide retro-text">Posts</p>
          </div>
        </div>
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-4 text-center">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-4 border-black mx-auto mb-3">
              <Gamepad2 className="w-6 h-6 text-black" />
            </div>
            <p className="text-3xl font-black text-gray-900 retro-title">{totalGames}</p>
            <p className="text-sm font-bold text-gray-700 uppercase tracking-wide retro-text">Games</p>
          </div>
        </div>
      </div>

      {/* User Form Modal */}
      {showUserForm && (
        <div 
          className="fixed inset-0 z-[100000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => { setShowUserForm(false); setEditingUser(null); }}
        >
          <div 
            className="max-w-md w-full bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Retro Title Bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b-4 border-black bg-gradient-to-r from-emerald-500 to-teal-500">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg border-2 border-black">
                  <Users className="w-5 h-5 text-black" />
                </div>
                <h3 className="text-lg font-black text-white uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                  {editingUser ? 'Edit User' : 'Add New User'}
                </h3>
              </div>
              <button 
                onClick={() => { setShowUserForm(false); setEditingUser(null); }}
                className="p-2 bg-white border-2 border-black rounded-lg shadow hover:bg-red-500 hover:text-white transition-all"
              >
                <X className="w-4 h-4 text-black" />
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
                  <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Email</label>
                  <input
                    type="email"
                    required
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    className="retro-input w-full"
                    placeholder="user@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Username</label>
                  <input
                    type="text"
                    required
                    value={userFormData.username}
                    onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                    className="retro-input w-full"
                    placeholder="username"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Role</label>
                  <select
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                    className="retro-input w-full"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={userFormData.is_active}
                    onChange={(e) => setUserFormData({ ...userFormData, is_active: e.target.checked })}
                    className="w-5 h-5 border-2 border-black rounded-none"
                  />
                  <label htmlFor="is_active" className="text-sm font-bold text-gray-700 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Active</label>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 retro-btn">
                    {editingUser ? 'Update User' : 'Add User'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowUserForm(false); setEditingUser(null); setUserFormData({ email: '', username: '', role: 'user', is_active: true }); }}
                    className="flex-1 retro-btn bg-gray-400 border-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter - Retro Card */}
      <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="px-6 py-4 border-b-4 border-black bg-gradient-to-r from-gray-100 to-gray-200">
          <h3 className="text-lg font-black text-gray-800 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Search & Filter</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Search Users</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by email or username..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="retro-input w-full pl-12"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Filter</label>
              <select
                value={userFilterStatus}
                onChange={(e) => setUserFilterStatus(e.target.value)}
                className="retro-input w-full"
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

      {/* Users Table - Retro Card */}
      <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="px-6 py-4 border-b-4 border-black bg-gradient-to-r from-emerald-500 to-teal-500">
          <h3 className="text-lg font-black text-white uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Users ({filteredUsers.length})</h3>
        </div>
        {loading ? (
          <div className="p-12 text-center">
            <div className="retro-spinner w-16 h-16 mx-auto mb-4"></div>
            <p className="retro-text text-lg">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="retro-text text-xl">No users found</p>
            <p className="retro-text text-sm opacity-70 mt-2">
              {users.length === 0 ? 'Users will appear here' : 'No users match your search criteria'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b-4 border-black">
                  <th className="text-left p-4 text-sm font-black text-gray-800 uppercase tracking-wide">User</th>
                  <th className="text-left p-4 text-sm font-black text-gray-800 uppercase tracking-wide">Role</th>
                  <th className="text-left p-4 text-sm font-black text-gray-800 uppercase tracking-wide">Points</th>
                  <th className="text-left p-4 text-sm font-black text-gray-800 uppercase tracking-wide">Posts</th>
                  <th className="text-left p-4 text-sm font-black text-gray-800 uppercase tracking-wide">Games</th>
                  <th className="text-left p-4 text-sm font-black text-gray-800 uppercase tracking-wide">Joined</th>
                  <th className="text-left p-4 text-sm font-black text-gray-800 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const userStats = userPoints.find(p => p.user_id === user.id);
                  const userPostsCount = forumPosts.filter(p => p.created_by === user.id).length;
                  const userGamesCount = gameScores.filter(g => g.user_id === user.id).length;
                  return (
                    <tr key={user.id} className="border-b-2 border-black hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border-2 border-black">
                            <span className="text-black font-bold" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                              {user.email?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 retro-text">{user.username || user.email?.split('@')[0]}</p>
                            <p className="text-sm text-gray-500 retro-text">{user.email}</p>
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
                              alert('User role updated!');
                            } catch (error) {
                              console.error('Error updating user role:', error);
                              alert('Error updating user role');
                            }
                          }}
                          className="retro-input w-32 py-2"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <span className="font-black text-gray-900 retro-title text-lg">{userStats?.total_points || 0}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-black text-gray-900 retro-title text-lg">{userPostsCount}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-black text-gray-900 retro-title text-lg">{userGamesCount}</span>
                      </td>
                      <td className="p-4">
                        <span className="retro-text text-sm">{new Date(user.created_at).toLocaleDateString()}</span>
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
                            className="p-2 bg-white border-2 border-black rounded-lg hover:bg-yellow-100 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-black" />
                          </button>
                          <button
                            onClick={async () => {
                              if (!confirm('Deactivate this user?')) return;
                              try {
                                const { error } = await supabase
                                  .from('users')
                                  .update({ is_active: false })
                                  .eq('id', user.id);
                                if (error) throw error;
                                setUsers(users.map(u => u.id === user.id ? { ...u, is_active: false } : u));
                                alert('User deactivated!');
                              } catch (error) {
                                console.error('Error deactivating user:', error);
                                alert('Error deactivating user');
                              }
                            }}
                            className="p-2 bg-white border-2 border-black rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                            disabled={!user.is_active}
                            title="Deactivate"
                          >
                            <Trash2 className="w-4 h-4 text-black" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
