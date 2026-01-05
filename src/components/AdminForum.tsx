import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, Edit3, Trash2, Search, Filter, Eye, Trophy } from 'lucide-react';
import Modal from './Modal';
import { forumAPI } from '../services/forum';

const AdminForum: React.FC = () => {
  const [forumPosts, setForumPosts] = useState<any[]>([]);
  const [forumComments, setForumComments] = useState<any[]>([]);
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [postFormData, setPostFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: [] as string[]
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const posts = await forumAPI.getPosts();
        setForumPosts(posts);

        // Fetch comments for all posts
        const allComments: any[] = [];
        for (const post of posts) {
          const comments = await forumAPI.getComments(post.id);
          allComments.push(...comments);
        }
        setForumComments(allComments);
      } catch (error) {
        console.error('Error fetching forum data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreatePost = async (data: any) => {
    try {
      const newPost = await forumAPI.createPost(data);
      setForumPosts([newPost, ...forumPosts]);
      setPostFormData({ title: '', content: '', category: 'general', tags: [] });
      setEditingPost(null);
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Error creating post');
    }
  };

  const handleUpdatePost = async (postId: string, data: any) => {
    try {
      const updatedPost = await forumAPI.updatePost(postId, data);
      setForumPosts(forumPosts.map(post => post.id === postId ? updatedPost : post));
      setPostFormData({ title: '', content: '', category: 'general', tags: [] });
      setEditingPost(null);
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Error updating post');
    }
  };
  return (
    <div className="space-y-8">
      <div className="bg-white border-b-4 border-charcoal px-4 py-3 flex justify-between items-center shadow-sm">
        <div>
          <h2 className="retro-title text-xl">Forum Management</h2>
          <p className="retro-text text-base opacity-80 mt-2">Manage forum posts and community discussions</p>
        </div>
        <button
          onClick={() => { setShowPostForm(true); setEditingPost(null); setPostFormData({ title: '', content: '', category: 'general', tags: [] }); }}
          className="retro-btn px-6 py-3 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5 retro-icon" />
          <span>Add Post</span>
        </button>
      </div>

  {/* Forum Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="retro-card retro-hover">
          <div className="p-3 text-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md border-2 border-blue-400 retro-icon mx-auto mb-2">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <p className="text-lg font-bold text-blue-900 retro-title">{forumPosts.length}</p>
            <p className="text-xs text-blue-700 uppercase tracking-wide retro-text">Total Posts</p>
          </div>
        </div>

        <div className="retro-card retro-hover">
          <div className="p-3 text-center">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md border-2 border-green-400 retro-icon mx-auto mb-2">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <p className="text-lg font-bold text-green-900 retro-title">
              {forumPosts.filter(p => new Date(p.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
            </p>
            <p className="text-xs text-green-700 uppercase tracking-wide retro-text">This Week</p>
          </div>
        </div>

        <div className="retro-card retro-hover">
          <div className="p-3 text-center">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md border-2 border-purple-400 retro-icon mx-auto mb-2">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <p className="text-lg font-bold text-purple-900 retro-title">
              {forumComments.length}
            </p>
            <p className="text-xs text-purple-700 uppercase tracking-wide retro-text">Comments</p>
          </div>
        </div>

        <div className="retro-card retro-hover">
          <div className="p-3 text-center">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md border-2 border-orange-400 retro-icon mx-auto mb-2">
              <Eye className="w-4 h-4 text-white" />
            </div>
            <p className="text-lg font-bold text-orange-900 retro-title">
              {forumPosts.reduce((sum, p) => sum + (p.views || 0), 0)}
            </p>
            <p className="text-xs text-orange-700 uppercase tracking-wide retro-text">Total Views</p>
          </div>
        </div>

        <div className="retro-card retro-hover">
          <div className="p-3 text-center">
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
        onClose={() => { setShowPostForm(false); setEditingPost(null); }}
        title={editingPost ? "Edit Forum Post" : "Create New Forum Post"}
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          if (editingPost) {
            handleUpdatePost(editingPost.id, postFormData);
          } else {
            handleCreatePost(postFormData);
          }
          setShowPostForm(false);
        }} className="space-y-6">
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
            );
    
            const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
            const startIndex = (currentPage - 1) * postsPerPage;
            const paginatedPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage);
    
            return (
              <>
                {/* Posts List */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {paginatedPosts.map((post) => (
                    <div key={post.id} className="retro-window retro-hover">
                      <div className="p-6">
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
                              onClick={() => {
                                setEditingPost(post);
                                setPostFormData({
                                  title: post.title,
                                  content: post.content,
                                  category: post.category,
                                  tags: post.tags || []
                                });
                                setShowPostForm(true);
                              }}
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
                                  alert('Error deleting post');
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
                      onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
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
                      onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
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
  );
};

export default AdminForum;