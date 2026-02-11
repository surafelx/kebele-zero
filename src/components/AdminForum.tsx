import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, Edit3, Trash2, Search, Eye, ThumbsUp, MessageCircle, Calendar } from 'lucide-react';
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
  const [filterCategory, setFilterCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const posts = await forumAPI.getPosts();
        setForumPosts(posts);

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

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await forumAPI.deletePost(postId);
      setForumPosts(forumPosts.filter(p => p.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error deleting post');
    }
  };

  const filteredPosts = forumPosts.filter(post => {
    const matchesSearch = !searchTerm || 
      post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || post.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['general', 'culture', 'events', 'games', 'help'];

  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between px-6 py-4 border-b-4 border-black bg-gradient-to-r from-teal-600 to-emerald-600">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-2 border-black shadow-lg">
              <MessageSquare className="w-7 h-7 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Forum Management</h1>
              <p className="text-sm text-teal-100 font-bold uppercase">Manage community discussions</p>
            </div>
          </div>
          <button
            onClick={() => { 
              setShowPostForm(true); 
              setEditingPost(null); 
              setPostFormData({ title: '', content: '', category: 'general', tags: [] }); 
            }}
            className="retro-btn px-4 py-2 bg-white text-black"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Add Post
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-5 text-center">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-4 border-black mx-auto mb-3">
              <MessageSquare className="w-6 h-6 text-black" />
            </div>
            <p className="text-3xl font-black text-gray-900 retro-title">{forumPosts.length}</p>
            <p className="text-sm font-bold text-gray-700 uppercase tracking-wide retro-text">Total Posts</p>
          </div>
        </div>
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-5 text-center">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-4 border-black mx-auto mb-3">
              <Calendar className="w-6 h-6 text-black" />
            </div>
            <p className="text-3xl font-black text-gray-900 retro-title">
              {forumPosts.filter(p => new Date(p.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
            </p>
            <p className="text-sm font-bold text-gray-700 uppercase tracking-wide retro-text">This Week</p>
          </div>
        </div>
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-5 text-center">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-4 border-black mx-auto mb-3">
              <MessageCircle className="w-6 h-6 text-black" />
            </div>
            <p className="text-3xl font-black text-gray-900 retro-title">{forumComments.length}</p>
            <p className="text-sm font-bold text-gray-700 uppercase tracking-wide retro-text">Comments</p>
          </div>
        </div>
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-5 text-center">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-4 border-black mx-auto mb-3">
              <Eye className="w-6 h-6 text-black" />
            </div>
            <p className="text-3xl font-black text-gray-900 retro-title">
              {forumPosts.reduce((sum, p) => sum + (p.views || 0), 0).toLocaleString()}
            </p>
            <p className="text-sm font-bold text-gray-700 uppercase tracking-wide retro-text">Total Views</p>
          </div>
        </div>
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-5 text-center">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-4 border-black mx-auto mb-3">
              <ThumbsUp className="w-6 h-6 text-black" />
            </div>
            <p className="text-3xl font-black text-gray-900 retro-title">
              {forumPosts.reduce((sum, p) => sum + (p.likes || 0), 0).toLocaleString()}
            </p>
            <p className="text-sm font-bold text-gray-700 uppercase tracking-wide retro-text">Total Likes</p>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="px-6 py-4 border-b-4 border-black bg-gradient-to-r from-gray-100 to-gray-200">
          <h3 className="text-lg font-black text-gray-800 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Search & Filter</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="retro-input w-full pl-12"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="retro-input"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Posts Grid with Pagination */}
      {loading ? (
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-12 text-center">
            <div className="retro-spinner w-16 h-16 mx-auto mb-4"></div>
            <p className="retro-text text-lg">Loading posts...</p>
          </div>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="retro-text text-xl">No posts found</p>
            <p className="retro-text text-sm opacity-70 mt-2">Create the first post to get started</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {paginatedPosts.map((post) => (
              <div key={post.id} className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-transform">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-bold uppercase tracking-wide border-2 border-black rounded mb-2">
                        {post.category || 'General'}
                      </span>
                      <h3 className="font-bold text-gray-800 text-lg mb-2 retro-title">{post.title}</h3>
                    </div>
                    <div className="flex space-x-2">
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
                        className="p-2 bg-white border-2 border-black rounded-lg hover:bg-yellow-100 transition-colors"
                      >
                        <Edit3 className="w-4 h-4 text-black" />
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-2 bg-white border-2 border-black rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-black" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4 retro-text">{post.content}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1 retro-text text-gray-500">
                        <MessageCircle className="w-4 h-4" />
                        <span>{forumComments.filter(c => c.post_id === post.id).length}</span>
                      </span>
                      <span className="flex items-center space-x-1 retro-text text-gray-500">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{post.likes || 0}</span>
                      </span>
                      <span className="flex items-center space-x-1 retro-text text-gray-500">
                        <Eye className="w-4 h-4" />
                        <span>{post.views || 0}</span>
                      </span>
                    </div>
                    <span className="retro-text text-gray-500">{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                  
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {post.tags.map((tag: string, index: number) => (
                        <span key={index} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold uppercase border border-black rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-gray-100 border-4 border-black">
              <p className="retro-text text-sm">
                Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredPosts.length)} of {filteredPosts.length} posts
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="retro-btn px-3 py-1.5"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="retro-btn px-3 py-1.5"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal */}
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
        }} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Title</label>
            <input
              type="text"
              required
              value={postFormData.title}
              onChange={(e) => setPostFormData({ ...postFormData, title: e.target.value })}
              className="retro-input w-full"
              placeholder="Enter post title"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Category</label>
            <select
              value={postFormData.category}
              onChange={(e) => setPostFormData({ ...postFormData, category: e.target.value })}
              className="retro-input w-full"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Content</label>
            <textarea
              rows={4}
              required
              value={postFormData.content}
              onChange={(e) => setPostFormData({ ...postFormData, content: e.target.value })}
              className="retro-input w-full resize-none"
              placeholder="Write your post content"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Tags (optional)</label>
            <input
              type="text"
              value={postFormData.tags.join(', ')}
              onChange={(e) => setPostFormData({ ...postFormData, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) })}
              className="retro-input w-full"
              placeholder="Comma-separated tags"
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 retro-btn"
            >
              {editingPost ? 'Update Post' : 'Create Post'}
            </button>
            <button
              type="button"
              onClick={() => { 
                setShowPostForm(false); 
                setPostFormData({ title: '', content: '', category: 'general', tags: [] }); 
              }}
              className="flex-1 retro-btn bg-gray-400 border-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminForum;
