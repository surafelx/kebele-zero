import React, { useState, useEffect } from 'react';
import { MessageSquare, Eye, Trophy, ArrowLeft, Plus, Search, Filter, Heart, Reply, Flag, Trash2 } from 'lucide-react';
import { forumAPI } from '../services/forum';
import { pointsAPI } from '../services/points';
import { useAuth } from '../contexts/AuthContext';
import ModalLoader from '../components/ModalLoader';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  is_pinned: boolean;
  is_locked: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  upvotes?: number;
  likes?: number;
  views?: number;
}

interface ForumComment {
  id: string;
  post_id: string;
  content: string;
  parent_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface UserPoints {
  id: string;
  user_id: string;
  total_points: number;
  games_played: number;
  checkers_wins: number;
  marbles_wins: number;
  created_at: string;
  updated_at: string;
}

// Helper: open the site-wide auth modal instead of navigating away
const requireAuth = (feature = 'forum') => {
  if (typeof window !== 'undefined' && (window as any).checkAuthForFeature) {
    (window as any).checkAuthForFeature(feature);
  }
};

const KebeleForum: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);

  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'general'
  });
  const [newComment, setNewComment] = useState('');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [upvotedPosts, setUpvotedPosts] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const postsPerPage = 10;

  // User ID → display name. Also accepts the full post/comment object for populated username.
  const getUserDisplayName = (userId?: string, post?: any) => {
    if (!userId) return 'Anonymous';
    // Use populated username from the normalizer when available
    if (post?.created_by_username) return post.created_by_username;
    if (user && user.id === userId) return 'You';
    // MongoDB ObjectId: 24 hex chars
    if (/^[0-9a-f]{24}$/i.test(userId)) return `User…${userId.slice(-6)}`;
    // UUID: 8-4-4-4-12
    if (/^[0-9a-f]{8}-[0-9a-f]{4}/i.test(userId)) return userId.slice(0, 8);
    return userId;
  };


  // Re-fetch when category or page changes
  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, currentPage]);

  useEffect(() => {
    fetchCategories();
    if (user) fetchUserPoints();
  }, [user]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const result = await forumAPI.getPosts(selectedCategory || undefined, currentPage, postsPerPage);
      // Backend returns { posts, total, page } or a plain array
      if (result && typeof result === 'object' && 'posts' in result) {
        setPosts(result.posts || []);
        setTotalPosts(result.total || 0);
      } else {
        setPosts(Array.isArray(result) ? result : []);
        setTotalPosts(Array.isArray(result) ? result.length : 0);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
      setTotalPosts(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await forumAPI.getCategories();
      // API may return objects {name, slug} or plain strings
      const names = data.map((c: any) => (typeof c === 'string' ? c : c.name || c.slug));
      setCategories(names.filter(Boolean));
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchUserPoints = async () => {
    if (!user) return;
    try {
      const data = await pointsAPI.getUserPoints(user.id);
      setUserPoints(data);
    } catch (error) {
      console.error('Error fetching user points:', error);
    }
  };

  const fetchComments = async (postId: string) => {
    try {
      const data = await forumAPI.getComments(postId);
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      requireAuth();
      return;
    }

    const postData = {
      ...newPost,
      tags: [],
      is_pinned: false,
      is_locked: false
    };

    try {
      await forumAPI.createPost(postData);
      setNewPost({ title: '', content: '', category: 'general' });
      setShowCreateForm(false);
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    }
  };

  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      requireAuth();
      return;
    }
    if (!selectedPost || !newComment.trim()) return;

    try {
      await forumAPI.createComment(selectedPost.id, newComment);
      setNewComment('');
      fetchComments(selectedPost.id);
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  const handlePostClick = (post: ForumPost) => {
    setSelectedPost(post);
    fetchComments(post.id);
    setActiveTab('post');
  };

  const handleLikePost = (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      requireAuth();
      return;
    }

    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleUpvotePost = (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      requireAuth();
      return;
    }

    setUpvotedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await forumAPI.deletePost(postId);
      setSelectedPost(null);
      setActiveTab('posts');
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    }
  };

  // Client-side search filter on the already server-fetched page
  const filteredPosts = posts.filter(post =>
    !searchQuery ||
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(totalPosts / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  // Posts are already paginated by the server; just render them
  const paginatedPosts = filteredPosts;

  // Reset to page 1 on search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const renderPostsList = () => (
    <div className="space-y-6">
      {/* Minimal Search and Filter - Top of posts */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 retro-icon" />
            <input
              type="text"
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="retro-input w-full pl-12 pr-4 py-3 text-base"
            />
          </div>
        </div>
        <div className="sm:w-48">
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
            className="retro-input w-full px-4 py-3 text-base"
          >
            <option value="">All Categories</option>
            {(categories.length > 0
              ? categories
              : ['general', 'games', 'culture', 'events', 'help']
            ).map(cat => (
              <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
          </select>
        </div>
        <div className="sm:w-auto flex items-center">
          <div className="text-sm text-gray-600 mr-4">
            {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
          </div>
          <button
            onClick={() => {
              if (!user) { requireAuth(); return; }
              setShowCreateForm(true);
            }}
            className="retro-btn-success px-4 py-3 font-bold flex items-center justify-center space-x-2 uppercase text-sm tracking-wide"
          >
            <Plus className="w-4 h-4 retro-icon" />
            <span>New</span>
          </button>
        </div>
      </div>

      {/* Posts List */}
      {loading ? (
        <ModalLoader label="Loading Discussions..." />
      ) : paginatedPosts.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
            <MessageSquare className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-6 uppercase tracking-wide">No discussions found</h3>
          <p className="text-gray-600 text-xl mb-8 max-w-2xl mx-auto">Try adjusting your search terms or browse all categories to find what you're looking for.</p>
          <div className="space-x-4">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
              }}
              className="retro-btn-secondary px-6 py-3 font-bold uppercase text-base tracking-wide"
            >
              Clear Filters
            </button>
            <button
              onClick={() => {
                if (!user) { requireAuth(); return; }
                setShowCreateForm(true);
              }}
              className="retro-btn px-6 py-3 font-bold uppercase text-base tracking-wide"
            >
              Create First Post
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Posts Grid */}
          <div className="grid grid-cols-1 gap-4">
            {paginatedPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => handlePostClick(post)}
                className="retro-window cursor-pointer hover:-translate-y-1 transition-all duration-300 bg-white border-2 border-gray-100"
              >
                <div className="retro-titlebar retro-titlebar-blue p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4 retro-icon" />
                      <span className="retro-title text-sm uppercase font-bold">{post.category}</span>
                      {post.is_pinned && (
                        <span className="px-2 py-1 bg-yellow-400 text-black rounded text-xs font-bold uppercase tracking-wide">
                          📌 Pinned
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-700 font-medium">
                      <span>💬{(post as any).commentCount ?? (post as any).comment_count ?? 0}</span>
                      <span>❤️{post.likes || 0}</span>
                      <span>👁️{post.views || 0}</span>
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="retro-title text-lg font-bold mb-2 leading-tight text-gray-800">
                    {post.title}
                  </h3>
                  <p className="retro-text text-sm leading-relaxed line-clamp-3 mb-3 text-gray-700">
                    {post.content}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-700">
                          {(post.created_by || '?').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium retro-text">{getUserDisplayName(post.created_by, post)}</div>
                        <div className="text-xs text-gray-500">{new Date(post.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>

                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {post.tags.slice(0, 2).map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 rounded text-xs font-medium hover:bg-purple-200 cursor-pointer transition-colors">
                            #{tag}
                          </span>
                        ))}
                        {post.tags.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                            +{post.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Compact Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="retro-btn-secondary px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ‹ Prev
              </button>

              <div className="flex space-x-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 rounded transition-colors text-sm ${
                        currentPage === pageNum
                          ? 'retro-btn'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="retro-btn-secondary px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next ›
              </button>
            </div>
          )}

          {/* Compact Pagination Info */}
          <div className="text-center text-gray-600 text-sm mt-2">
            {startIndex + 1}-{Math.min(startIndex + postsPerPage, filteredPosts.length)} of {filteredPosts.length}
          </div>
        </div>
      )}
    </div>
  );

  const renderPostView = () => {
    if (!selectedPost) return null;

    return (
      <div className="space-y-4">
        {/* Back Button - More compact */}
        <button
          onClick={() => {
            setSelectedPost(null);
            setActiveTab('posts');
          }}
          className="retro-btn-secondary text-xs py-2 px-3 font-bold uppercase mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2 inline" />
          Back
        </button>

        {user && (selectedPost.created_by === user.id || (user as any).role === 'admin') && (
          <button
            onClick={() => handleDeletePost(selectedPost.id)}
            className="retro-btn text-xs py-2 px-3 font-bold uppercase mb-4 ml-2 bg-red-500 border-red-700 hover:bg-red-600 text-white"
          >
            <Trash2 className="w-4 h-4 mr-1 inline" />
            Delete
          </button>
        )}

        {/* Post Content - Cleaner and more compact */}
        <div className="retro-window">
          <div className="retro-titlebar retro-titlebar-blue p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 retro-icon" />
                <span className="retro-title text-sm uppercase font-bold">{selectedPost.category}</span>
                {selectedPost.is_pinned && (
                  <span className="px-2 py-1 bg-yellow-400 text-black rounded-full text-xs font-bold uppercase tracking-wide">
                    📌
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-700 font-medium">
                <span className="flex items-center space-x-1"><MessageSquare className="w-3 h-3" /><span>{comments.length}</span></span>
                <span className="flex items-center space-x-1"><Heart className="w-3 h-3" /><span>{selectedPost.likes || 0}</span></span>
                <span className="flex items-center space-x-1"><Eye className="w-3 h-3" /><span>{selectedPost.views || 0}</span></span>
              </div>
            </div>
          </div>
          <div className="p-4">
            <h1 className="retro-title text-xl font-bold mb-3 leading-tight text-gray-800">{selectedPost.title}</h1>
            <p className="retro-text text-sm leading-relaxed mb-4 text-gray-700">{selectedPost.content}</p>

            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-700">
                    {(selectedPost.created_by || '?').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-medium retro-text">{getUserDisplayName(selectedPost.created_by, selectedPost)}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(selectedPost.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {selectedPost.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedPost.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 rounded-full text-xs font-medium hover:bg-purple-200 cursor-pointer transition-colors">
                      #{tag}
                    </span>
                  ))}
                  {selectedPost.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                      +{selectedPost.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comments - More compact */}
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="retro-title text-base font-bold uppercase tracking-wide">Comments ({comments.length})</h3>
            <div className="retro-text text-xs opacity-80 uppercase tracking-wide">
              Join conversation
            </div>
          </div>

          {comments.length === 0 ? (
            <div className="retro-window text-center py-6">
              <MessageSquare className="w-6 h-6 text-gray-400 mx-auto mb-3 retro-icon" />
              <p className="retro-text text-xs opacity-80">No comments yet. Be the first!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {comments.map((comment) => (
                <div key={comment.id} className="retro-window p-3">
                  <p className="retro-text text-xs leading-relaxed mb-2 text-gray-700">{comment.content}</p>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-600">
                          {(comment.created_by || '?').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium retro-text">{getUserDisplayName(comment.created_by, comment)}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-500">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-gray-400 hover:text-gray-600 transition-colors">
                        <Heart className="w-3 h-3" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600 transition-colors">
                        <Reply className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Comment - More compact */}
          <div className="retro-window">
            <div className="retro-titlebar retro-titlebar-green p-2">
              <h4 className="retro-title text-xs font-bold uppercase tracking-wide">
                {user ? 'Add Comment' : 'Sign in to comment'}
              </h4>
            </div>
            <div className="p-3">
              {user ? (
                <form onSubmit={handleCreateComment}>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    rows={2}
                    className="retro-input w-full resize-none text-xs mb-2"
                    required
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="retro-btn text-xs py-1 px-3 font-bold uppercase"
                    >
                      Post
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-3">
                  <p className="retro-text text-xs opacity-80 mb-2">Sign in to comment</p>
                  <button
                    onClick={() => requireAuth()}
                    className="retro-btn text-xs py-1 px-3 font-bold uppercase"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCreateForm = () => (
    <div className="max-w-lg mx-auto">
      <div className="retro-window">
        <div className="retro-titlebar retro-titlebar-blue p-2">
          <div className="flex items-center space-x-2">
            <Plus className="w-4 h-4 retro-icon" />
            <span className="retro-title text-sm uppercase">New Post</span>
          </div>
        </div>
        <div className="p-3">
          <div className="text-center mb-3">
            <h2 className="retro-title text-base font-bold uppercase tracking-tight">Start Discussion</h2>
            <p className="retro-text text-xs opacity-80">Share with community</p>
          </div>

          <form onSubmit={handleCreatePost} className="space-y-2">
            <div className="space-y-1">
              <label className="block text-xs font-semibold retro-text uppercase tracking-wide">Title</label>
              <input
                type="text"
                required
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                className="retro-input w-full text-xs py-2"
                placeholder="Discussion topic..."
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold retro-text uppercase tracking-wide">Category</label>
              <select
                value={newPost.category}
                onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                className="retro-input w-full bg-paper text-xs py-2"
              >
                <option value="general">General</option>
                <option value="games">Games</option>
                <option value="events">Events</option>
                <option value="culture">Culture</option>
                <option value="help">Help</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold retro-text uppercase tracking-wide">Content</label>
              <textarea
                required
                rows={2}
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                className="retro-input w-full resize-none text-xs"
                placeholder="Your thoughts..."
              />
            </div>

            <div className="flex gap-2 pt-2 border-t border-charcoal">
              <button
                type="submit"
                className="flex-1 retro-btn text-xs py-2 px-3 font-bold uppercase"
              >
                <Plus className="w-3 h-3 mr-1 inline" />
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="retro-btn text-xs py-2 px-3 font-bold uppercase"
                style={{ backgroundColor: '#4B5563', borderColor: '#374151' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen retro-bg">
      {/* Main Content - More compact */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Forum Content */}
          <div className="flex-1 min-w-0">
            {activeTab === 'posts' && !showCreateForm && renderPostsList()}
            {activeTab === 'post' && renderPostView()}
            {showCreateForm && renderCreateForm()}
          </div>

          {/* Sidebar - More compact */}
          <div className="lg:w-64 space-y-2 lg:order-last">

            {/* Recent Activity */}
            <div className="retro-window">
              <div className="retro-titlebar retro-titlebar-green p-2">
                <h3 className="retro-title text-xs uppercase tracking-wide">Recent Activity</h3>
              </div>
              <div className="p-2 space-y-1">
                {posts.slice(0, 3).map((post) => (
                  <div key={post.id} className="flex items-start space-x-1 p-1 hover:bg-gray-50 rounded cursor-pointer" onClick={() => handlePostClick(post)}>
                    <div className="w-4 h-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-2 h-2 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium retro-text truncate">{post.title}</p>
                      <p className="text-xs text-gray-500">{new Date(post.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Tags */}
            <div className="retro-window">
              <div className="retro-titlebar retro-titlebar-purple p-2">
                <h3 className="retro-title text-xs uppercase tracking-wide">Popular Tags</h3>
              </div>
              <div className="p-2">
                <div className="flex flex-wrap gap-1">
                  {Array.from(new Set(posts.flatMap(p => p.tags))).slice(0, 6).map((tag) => (
                    <span key={tag} className="px-1 py-0.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 rounded text-xs font-medium hover:bg-purple-200 cursor-pointer transition-colors">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="retro-window">
              <div className="retro-titlebar retro-titlebar-orange p-2">
                <h3 className="retro-title text-xs uppercase tracking-wide">Quick Actions</h3>
              </div>
              <div className="p-2 space-y-2">
                <button
                  onClick={() => { setSelectedCategory(''); setCurrentPage(1); }}
                  className="w-full retro-btn py-2 px-3 font-bold text-xs uppercase flex items-center justify-center space-x-2"
                >
                  <span>📋</span>
                  <span>All Posts</span>
                </button>
                <button
                  onClick={() => { setSelectedCategory('games'); setCurrentPage(1); }}
                  className="w-full retro-btn py-2 px-3 font-bold text-xs uppercase flex items-center justify-center space-x-2"
                >
                  <span>🎮</span>
                  <span>Games</span>
                </button>
                <button
                  onClick={() => { setSelectedCategory('culture'); setCurrentPage(1); }}
                  className="w-full retro-btn py-2 px-3 font-bold text-xs uppercase flex items-center justify-center space-x-2"
                >
                  <span>🎨</span>
                  <span>Culture</span>
                </button>
                <button
                  onClick={() => { setSelectedCategory('events'); setCurrentPage(1); }}
                  className="w-full retro-btn py-2 px-3 font-bold text-xs uppercase flex items-center justify-center space-x-2"
                >
                  <span>📅</span>
                  <span>Events</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KebeleForum;