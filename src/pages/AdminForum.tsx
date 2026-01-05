import  { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, ShoppingBag, Radio, Image, Settings, BarChart3, Edit3, Trash2, Plus, ArrowLeft, Save, X, LogOut, LogIn, CreditCard, MessageSquare, Trophy, Gamepad2, Filter, Search, MoreVertical, Eye, Ban, CheckCircle, Info, Upload, Camera, Menu, PanelLeftClose, ChevronDown, User } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { forumAPI } from '../services/forum';
import { pointsAPI } from '../services/points';
import Modal from '../components/Modal';

const AdminForum = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const { user, logout, login, loading: authLoading } = useAuth();

  // Data states
  const [forumPosts, setForumPosts] = useState<any[]>([]);
  const [forumComments, setForumComments] = useState<any[]>([]);
  const [userPoints, setUserPoints] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);

  // Form data states
  const [postFormData, setPostFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: [] as string[]
  });

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(6);

  // Fetch data when user is authenticated and has admin role
  useEffect(() => {
    console.log("User", user, authLoading)
    if (!authLoading && user) {
      fetchForumData();
    }
  }, [user, authLoading]);

  // Hide canvas and enable scrolling when admin dashboard is active
  useEffect(() => {
    const canvas = document.querySelector('.canvas') as HTMLElement;
    if (canvas) {
      canvas.style.display = 'none';
    }
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    return () => {
      if (canvas) {
        canvas.style.display = '';
      }
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    };
  }, []);

  // Set form data when editing
  useEffect(() => {
    if (editingPost) {
      setPostFormData({
        title: editingPost.title || '',
        content: editingPost.content || '',
        category: editingPost.category || 'general',
        tags: editingPost.tags || []
      });
    }
  }, [editingPost]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const fetchForumData = async () => {
    setLoading(true);
    try {
      // Fetch forum posts
      const { data: postsData, error: postsError } = await supabase
        .from('forum_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Error fetching forum posts:', postsError);
      } else {
        setForumPosts(postsData || []);
      }

      // Fetch users for post authors
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('Error fetching users:', usersError);
      } else {
        setUsers(usersData || []);
      }

      // Fetch user points
      const { data: pointsData, error: pointsError } = await supabase
        .from('user_points')
        .select('*')
        .order('total_points', { ascending: false });

      if (pointsError) {
        console.error('Error fetching user points:', pointsError);
      } else {
        setUserPoints(pointsData || []);
      }
    } catch (error) {
      console.error('Error fetching forum data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (postData: any) => {
    try {
      const data = await forumAPI.createPost(postData);
      setForumPosts([data, ...forumPosts]);
      fetchForumData();
    } catch (error) {
      console.error('Error creating post:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      alert('Failed to create post: ' + message);
    }
  };

  const handleEditPost = async (postData: any) => {
    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .update(postData)
        .eq('id', editingPost.id)
        .select();

      if (error) throw error;

      setForumPosts(forumPosts.map(p => p.id === editingPost.id ? data[0] : p));
      setEditingPost(null);
      fetchForumData();
    } catch (error) {
      console.error('Error updating post:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      alert('Error updating post: ' + message);
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

  // Allow demo access - create mock admin user if not authenticated
  const displayUser = user || {
    email: 'admin@kebele.com',
    role: 'admin' as const,
    id: 'admin-demo'
  };

  return (
    <div>
      {/* Top Header */}
      <div className="bg-white border-b-4 border-charcoal px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin')}
            className="retro-btn px-4 py-2 flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4 retro-icon" />
            <span>Back to Admin</span>
          </button>
          <h1 className="retro-title text-xl font-bold">Forum Management</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-md border-2 border-blue-400">
              <span className="text-white font-bold text-sm retro-title">
                {displayUser.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-semibold text-gray-900">{(displayUser as any).username || displayUser.email?.split('@')[0]}</p>
              <p className="text-xs text-gray-500">{displayUser.role === 'admin' ? 'Administrator' : 'User'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="retro-btn-secondary px-3 py-2 text-sm flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4 retro-icon" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="min-h-screen retro-bg retro-bg-enhanced">
        {/* Main Content */}
        <div className="flex flex-col min-h-screen">
          {/* Page Content */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="p-6 h-full">
              <div className="space-y-8">
                {/* Forum Stats Card */}
                <div className="retro-card retro-hover">
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 retro-title mb-4">Forum Statistics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md border-2 border-blue-400 retro-icon mx-auto mb-2">
                          <MessageSquare className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-lg font-bold text-blue-900 retro-title">{forumPosts.length}</p>
                        <p className="text-xs text-blue-700 uppercase tracking-wide retro-text">Total Posts</p>
                      </div>

                      <div className="text-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md border-2 border-green-400 retro-icon mx-auto mb-2">
                          <MessageSquare className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-lg font-bold text-green-900 retro-title">
                          {forumPosts.filter(p => new Date(p.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                        </p>
                        <p className="text-xs text-green-700 uppercase tracking-wide retro-text">This Week</p>
                      </div>

                      <div className="text-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md border-2 border-purple-400 retro-icon mx-auto mb-2">
                          <MessageSquare className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-lg font-bold text-purple-900 retro-title">
                          {forumComments.length}
                        </p>
                        <p className="text-xs text-purple-700 uppercase tracking-wide retro-text">Comments</p>
                      </div>

                      <div className="text-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md border-2 border-orange-400 retro-icon mx-auto mb-2">
                          <Eye className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-lg font-bold text-orange-900 retro-title">
                          {forumPosts.reduce((sum, p) => sum + (p.views || 0), 0)}
                        </p>
                        <p className="text-xs text-orange-700 uppercase tracking-wide retro-text">Total Views</p>
                      </div>

                      <div className="text-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center shadow-md border-2 border-teal-400 retro-icon mx-auto mb-2">
                          <Trophy className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-lg font-bold text-teal-900 retro-title">
                          {forumPosts.reduce((sum, p) => sum + (p.likes || 0), 0)}
                        </p>
                        <p className="text-xs text-teal-700 uppercase tracking-wide retro-text">Total Likes</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="retro-title text-xl">Forum Management</h2>
                    <p className="retro-text text-base opacity-80 mt-2">Manage forum posts and community discussions</p>
                  </div>
                  <button
                    onClick={() => setShowPostForm(true)}
                    className="retro-btn px-6 py-3 flex items-center space-x-2"
                  >
                    <Plus className="w-5 h-5 retro-icon" />
                    <span>Add Post</span>
                  </button>
                </div>
                </div>

                {/* Search and Filter */}
                <div className="retro-window">
                  <div className="p-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-semibold retro-text mb-2">Search Posts</label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            placeholder="Search by title, content, or tags..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 retro-input"
                          />
                        </div>
                      </div>
                      <div className="lg:w-64">
                        <label className="block text-sm font-semibold retro-text mb-2">Filter by Category</label>
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="w-full px-4 py-2 bg-white retro-input"
                        >
                          <option value="">All Categories</option>
                          <option value="general">General</option>
                          <option value="culture">Culture</option>
                          <option value="events">Events</option>
                          <option value="games">Games</option>
                          <option value="help">Help</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <Modal
                  isOpen={showPostForm}
                  onClose={() => setShowPostForm(false)}
                  title="Create New Forum Post"
                >
                  <form onSubmit={(e) => { e.preventDefault(); handleCreatePost(postFormData); setShowPostForm(false); }} className="space-y-6">
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold retro-text">Title</label>
                      <input
                        type="text"
                        required
                        value={postFormData.title}
                        onChange={(e) => setPostFormData({ ...postFormData, title: e.target.value })}
                        className="retro-input w-full"
                        placeholder="Enter post title"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold retro-text">Category</label>
                      <select
                        value={postFormData.category}
                        onChange={(e) => setPostFormData({ ...postFormData, category: e.target.value })}
                        className="retro-input w-full bg-white"
                      >
                        <option value="general">General</option>
                        <option value="culture">Culture</option>
                        <option value="events">Events</option>
                        <option value="games">Games</option>
                        <option value="help">Help</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold retro-text">Content</label>
                      <textarea
                        rows={4}
                        required
                        value={postFormData.content}
                        onChange={(e) => setPostFormData({ ...postFormData, content: e.target.value })}
                        className="retro-input w-full resize-none"
                        placeholder="Write your post content"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold retro-text">Tags (optional)</label>
                      <input
                        type="text"
                        value={postFormData.tags.join(', ')}
                        onChange={(e) => setPostFormData({ ...postFormData, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) })}
                        className="retro-input w-full"
                        placeholder="Comma-separated tags (e.g., culture, discussion, help)"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t-4 border-mustard">
                      <button
                        type="submit"
                        className="flex-1 retro-btn-success py-3 px-6"
                      >
                        📝 Create Post
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowPostForm(false); setPostFormData({ title: '', content: '', category: 'general', tags: [] }); }}
                        className="retro-btn-secondary py-3 px-6"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </Modal>

                <Modal
                  isOpen={!!editingPost}
                  onClose={() => setEditingPost(null)}
                  title="Edit Forum Post"
                >
                  <form onSubmit={(e) => { e.preventDefault(); handleEditPost(postFormData); setEditingPost(null); }} className="space-y-6">
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold retro-text">Title</label>
                      <input
                        type="text"
                        required
                        value={postFormData.title}
                        onChange={(e) => setPostFormData({ ...postFormData, title: e.target.value })}
                        className="retro-input w-full"
                        placeholder="Enter post title"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold retro-text">Category</label>
                      <select
                        value={postFormData.category}
                        onChange={(e) => setPostFormData({ ...postFormData, category: e.target.value })}
                        className="retro-input w-full bg-white"
                      >
                        <option value="general">General</option>
                        <option value="culture">Culture</option>
                        <option value="events">Events</option>
                        <option value="games">Games</option>
                        <option value="help">Help</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold retro-text">Content</label>
                      <textarea
                        rows={4}
                        required
                        value={postFormData.content}
                        onChange={(e) => setPostFormData({ ...postFormData, content: e.target.value })}
                        className="retro-input w-full resize-none"
                        placeholder="Write your post content"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold retro-text">Tags (optional)</label>
                      <input
                        type="text"
                        value={postFormData.tags.join(', ')}
                        onChange={(e) => setPostFormData({ ...postFormData, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) })}
                        className="retro-input w-full"
                        placeholder="Comma-separated tags (e.g., culture, discussion, help)"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t-4 border-mustard">
                      <button
                        type="submit"
                        className="flex-1 retro-btn-success py-3 px-6"
                      >
                        💾 Update Post
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEditingPost(null); setPostFormData({ title: '', content: '', category: 'general', tags: [] }); }}
                        className="retro-btn-secondary py-3 px-6"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </Modal>

                {loading ? (
                  <div className="retro-window text-center py-16">
                    <div className="retro-spinner w-16 h-16 mx-auto mb-6"></div>
                    <p className="retro-text text-lg">Loading forum posts...</p>
                  </div>
                ) : forumPosts.length === 0 ? (
                  <div className="retro-window text-center py-16">
                    <MessageSquare className="w-20 h-20 text-gray-300 mx-auto mb-6 retro-icon" />
                    <p className="retro-text text-xl">No forum posts found</p>
                    <p className="retro-text text-base opacity-70 mt-3">Create the first post to get started</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {(() => {
                      const filteredPosts = forumPosts.filter(post =>
                        (searchTerm === '' ||
                         post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (post.tags && post.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())))) &&
                        (filterStatus === '' || post.category === filterStatus)
                      )

                      const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
                      const startIndex = (currentPage - 1) * postsPerPage;
                      const paginatedPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage);

                      return (
                        <>
                          {/* Posts List */}
                          <div className="space-y-4">
                            {paginatedPosts.map((post) => (
                              <div key={post.id} className="retro-window retro-hover">
                                <div className="p-4">
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2 mb-2">
                                        <h3 className="font-bold text-gray-900 text-lg retro-title">{post.title}</h3>
                                        <span className="retro-badge px-2 py-1 text-xs bg-green-100 text-green-800 capitalize">
                                          {post.category}
                                        </span>
                                      </div>
                                      <div className="flex items-center space-x-4 text-xs retro-text opacity-70 mb-2">
                                        <span>💬 {forumComments.filter(c => c.post_id === post.id).length}</span>
                                        <span>❤️ {post.likes || 0}</span>
                                        <span>👁️ {post.views || 0}</span>
                                        <span>📅 {new Date(post.created_at).toLocaleDateString()}</span>
                                      </div>
                                      <p className="text-gray-600 text-sm retro-text line-clamp-2 mb-2">{post.content}</p>
                                      {post.tags && post.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                          {post.tags.map((tag: string, index: number) => (
                                            <span key={index} className="retro-badge px-1 py-0.5 text-xs bg-blue-100 text-blue-800">
                                              #{tag}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex space-x-1 ml-4">
                                      <button
                                        onClick={() => setEditingPost(post)}
                                        className="retro-btn-secondary p-1.5 hover:scale-105 transition-transform"
                                        title="Edit Post"
                                      >
                                        <Edit3 className="w-3 h-3 retro-icon" />
                                      </button>
                                      <button
                                        onClick={async () => {
                                          if (!confirm('Delete this post?')) return;
                                          try {
                                            await forumAPI.deletePost(post.id);
                                            setForumPosts(forumPosts.filter(p => p.id !== post.id));
                                          } catch (error) {
                                            const message = error instanceof Error ? error.message : 'Unknown error';
                                            alert('Error deleting post: ' + message);
                                          }
                                        }}
                                        className="retro-btn-secondary p-1.5 hover:scale-105 transition-transform"
                                        title="Delete Post"
                                      >
                                        <Trash2 className="w-3 h-3 retro-icon" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Pagination */}
                          {totalPages > 1 && (
                            <div className="flex justify-center items-center space-x-2 mt-6">
                              <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="retro-btn-secondary px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                ← Previous
                              </button>

                              <div className="flex space-x-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                                  <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`px-3 py-2 rounded retro-btn-secondary ${
                                      currentPage === pageNum ? 'bg-yellow-500 text-white' : ''
                                    }`}
                                  >
                                    {pageNum}
                                  </button>
                                ))}
                              </div>

                              <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="retro-btn-secondary px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Next →
                              </button>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  )
};

export default AdminForum;