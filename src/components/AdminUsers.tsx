 import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, Settings, Trophy, MessageSquare, Gamepad2, Plus, Search } from 'lucide-react';
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
      <div className="bg-white border-b-4 border-charcoal px-4 py-3 flex justify-between items-center shadow-sm">
        <div>
          <h2 className="retro-title text-xl">User Management</h2>
          <p className="retro-text text-base opacity-80 mt-2">Manage platform users and their roles</p>
        </div>
        <button
          onClick={() => { setShowUserForm(true); setEditingUser(null); setUserFormData({ email: '', username: '', role: 'user', is_active: true }); }}
          className="retro-btn px-6 py-3 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5 retro-icon" />
          <span>Add User</span>
        </button>
      </div>

      {/* User Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="retro-card retro-hover">
          <div className="p-4 text-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md border-2 border-blue-400 retro-icon mx-auto mb-2">
              <Users className="w-4 h-4 text-white" />
            </div>
            <p className="text-lg font-bold text-blue-900 retro-title">{totalUsers}</p>
            <p className="text-xs text-blue-700 uppercase tracking-wide retro-text">Total Users</p>
          </div>
        </div>
        <div className="retro-card retro-hover">
          <div className="p-4 text-center">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md border-2 border-green-400 retro-icon mx-auto mb-2">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <p className="text-lg font-bold text-green-900 retro-title">{activeUsers}</p>
            <p className="text-xs text-green-700 uppercase tracking-wide retro-text">Active</p>
          </div>
        </div>
        <div className="retro-card retro-hover">
          <div className="p-4 text-center">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md border-2 border-purple-400 retro-icon mx-auto mb-2">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <p className="text-lg font-bold text-purple-900 retro-title">{adminUsers}</p>
            <p className="text-xs text-purple-700 uppercase tracking-wide retro-text">Admins</p>
          </div>
        </div>
        <div className="retro-card retro-hover">
          <div className="p-4 text-center">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md border-2 border-orange-400 retro-icon mx-auto mb-2">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <p className="text-lg font-bold text-orange-900 retro-title">{totalPoints}</p>
            <p className="text-xs text-orange-700 uppercase tracking-wide retro-text">Total Points</p>
          </div>
        </div>
        <div className="retro-card retro-hover">
          <div className="p-4 text-center">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center shadow-md border-2 border-teal-400 retro-icon mx-auto mb-2">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <p className="text-lg font-bold text-teal-900 retro-title">{totalPosts}</p>
            <p className="text-xs text-teal-700 uppercase tracking-wide retro-text">Forum Posts</p>
          </div>
        </div>
        <div className="retro-card retro-hover">
          <div className="p-4 text-center">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md border-2 border-pink-400 retro-icon mx-auto mb-2">
              <Gamepad2 className="w-4 h-4 text-white" />
            </div>
            <p className="text-lg font-bold text-pink-900 retro-title">{totalGames}</p>
            <p className="text-xs text-pink-700 uppercase tracking-wide retro-text">Games Played</p>
          </div>
        </div>
      </div>

      {/* User Form Modal */}
      {showUserForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="retro-window w-full max-w-md mx-4">
            <div className="retro-titlebar retro-titlebar-blue p-4 flex justify-between items-center">
              <h3 className="retro-title text-lg">{editingUser ? 'Edit User' : 'Add New User'}</h3>
              <button onClick={() => { setShowUserForm(false); setEditingUser(null); }} className="retro-btn-secondary p-1">
                ✕
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
                  <label className="block text-sm font-semibold retro-text">Email</label>
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
                  <label className="block text-sm font-semibold retro-text">Username</label>
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
                  <label className="block text-sm font-semibold retro-text">Role</label>
                  <select
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                    className="retro-input w-full bg-white"
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
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="is_active" className="text-sm font-semibold retro-text">Active</label>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t-2 border-mustard">
                  <button type="submit" className="flex-1 retro-btn-success py-2 px-4">
                    {editingUser ? 'Update User' : 'Add User'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowUserForm(false); setEditingUser(null); setUserFormData({ email: '', username: '', role: 'user', is_active: true }); }}
                    className="retro-btn-secondary py-2 px-4"
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
      <div className="retro-window">
        <div className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold retro-text mb-2">Search Users</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by email or username..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 retro-input"
                />
              </div>
            </div>
            <div className="lg:w-64">
              <label className="block text-sm font-semibold retro-text mb-2">Filter</label>
              <select
                value={userFilterStatus}
                onChange={(e) => setUserFilterStatus(e.target.value)}
                className="w-full px-4 py-2 bg-white retro-input"
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

      {loading ? (
        <div className="retro-window text-center py-16">
          <div className="retro-spinner w-16 h-16 mx-auto mb-6"></div>
          <p className="retro-text text-lg">Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="retro-window text-center py-16">
          <Users className="w-20 h-20 text-gray-300 mx-auto mb-6 retro-icon" />
          <p className="retro-text text-xl">No users found</p>
          <p className="retro-text text-base opacity-70 mt-3">
            {users.length === 0 ? 'Users will appear here' : 'No users match your search criteria'}
          </p>
        </div>
      ) : (
        <div className="retro-window">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-charcoal">
                  <th className="text-left p-4 retro-title text-sm">User</th>
                  <th className="text-left p-4 retro-title text-sm">Role</th>
                  <th className="text-left p-4 retro-title text-sm">Points</th>
                  <th className="text-left p-4 retro-title text-sm">Posts</th>
                  <th className="text-left p-4 retro-title text-sm">Games</th>
                  <th className="text-left p-4 retro-title text-sm">Joined</th>
                  <th className="text-left p-4 retro-title text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const userStats = userPoints.find(p => p.user_id === user.id);
                  const userPostsCount = forumPosts.filter(p => p.created_by === user.id).length;
                  const userGamesCount = gameScores.filter(g => g.user_id === user.id).length;
                  return (
                    <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-md border-2 border-blue-400 retro-icon">
                            <span className="text-white font-bold text-sm retro-title">
                              {user.email?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 retro-title">{user.username || user.email?.split('@')[0]}</p>
                            <p className="text-sm text-gray-600 retro-text">{user.email}</p>
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
                          className="retro-input text-sm px-2 py-1"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <span className="retro-title font-bold text-orange-600">{userStats?.total_points || 0}</span>
                      </td>
                      <td className="p-4">
                        <span className="retro-title font-bold text-blue-600">{userPostsCount}</span>
                      </td>
                      <td className="p-4">
                        <span className="retro-title font-bold text-green-600">{userGamesCount}</span>
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
                            className="retro-btn-secondary px-3 py-1 text-xs"
                          >
                            Edit
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
                            className="retro-btn-secondary px-3 py-1 text-xs"
                            disabled={!user.is_active}
                          >
                            Deactivate
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