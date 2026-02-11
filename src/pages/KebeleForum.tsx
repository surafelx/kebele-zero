import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Eye, Trophy, ArrowLeft, Plus, Search, Filter, Heart, Reply, Flag } from 'lucide-react';
import { forumAPI } from '../services/forum';
import { pointsAPI } from '../services/points';
import { useAuth } from '../contexts/AuthContext';

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

const KebeleForum: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);

  // Mock comments data
  const [mockComments] = useState<Record<string, ForumComment[]>>({
    '1': [
      {
        id: 'c1',
        post_id: '1',
        content: 'Welcome! I\'m so excited to be here too. The community already feels so welcoming and supportive.',
        created_by: 'NewMember123',
        created_at: '2024-12-20T11:30:00Z',
        updated_at: '2024-12-20T11:30:00Z'
      },
      {
        id: 'c2',
        post_id: '1',
        content: 'Great to have you here! Looking forward to collaborating on some amazing projects together.',
        created_by: 'CommunityBuilder',
        created_at: '2024-12-20T12:15:00Z',
        updated_at: '2024-12-20T12:15:00Z'
      }
    ],
    '2': [
      {
        id: 'c3',
        post_id: '2',
        content: 'I find that controlling the center of the board early is crucial. Also, try to create multiple jump opportunities!',
        created_by: 'StrategyMaster',
        created_at: '2024-12-19T16:45:00Z',
        updated_at: '2024-12-19T16:45:00Z'
      },
      {
        id: 'c4',
        post_id: '2',
        content: 'Don\'t forget about kinging your pieces! Having kings changes the game dynamics completely.',
        created_by: 'CheckersPro',
        created_at: '2024-12-19T17:20:00Z',
        updated_at: '2024-12-19T17:20:00Z'
      }
    ],
    '3': [
      {
        id: 'c5',
        post_id: '3',
        content: 'Timket is absolutely magical! The colors, the music, the energy - it\'s unforgettable. Highly recommend attending if you can.',
        created_by: 'FestivalGoer',
        created_at: '2024-12-18T10:30:00Z',
        updated_at: '2024-12-18T10:30:00Z'
      }
    ],
    '7': [
      {
        id: 'c6',
        post_id: '7',
        content: 'English is everything in pool! Learning to control the cue ball\'s spin and path after contact is what separates good players from great ones.',
        created_by: 'BilliardsExpert',
        created_at: '2024-12-14T15:00:00Z',
        updated_at: '2024-12-14T15:00:00Z'
      },
      {
        id: 'c7',
        post_id: '7',
        content: 'For break shots, I always aim for the head ball with medium speed and a slight draw. Consistency is key!',
        created_by: 'PoolShark',
        created_at: '2024-12-14T16:30:00Z',
        updated_at: '2024-12-14T16:30:00Z'
      }
    ],
    '8': [
      {
        id: 'c8',
        post_id: '8',
        content: 'Pimsleur Amharic is excellent for beginners! Also check out the Amharic courses on Memrise.',
        created_by: 'Polyglot',
        created_at: '2024-12-13T11:45:00Z',
        updated_at: '2024-12-13T11:45:00Z'
      },
      {
        id: 'c9',
        post_id: '8',
        content: 'Practice with locals at coffee shops! Nothing beats real conversation practice.',
        created_by: 'LanguageNerd',
        created_at: '2024-12-13T12:20:00Z',
        updated_at: '2024-12-13T12:20:00Z'
      }
    ]
  });
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
  const postsPerPage = 10;

  // User ID to name mapping for display
  const getUserDisplayName = (userId: string) => {
    // For mock data, return as-is since they already have names
    if (typeof userId === 'string' && !userId.includes('@') && userId.length < 50) {
      return userId; // Already a name
    }
    // For real user IDs, try to get user info
    if (user && user.id === userId) {
      return user.email?.split('@')[0] || 'You';
    }
    // For other users, generate a friendly name from ID
    return `User ${userId.slice(-4)}`;
  };

  // Mock high scores data
  const [highScores] = useState({
    checkers: [
      { name: 'Player1', score: 1500, wins: 45 },
      { name: 'Player2', score: 1420, wins: 38 },
      { name: 'Player3', score: 1380, wins: 42 }
    ],
    marbles: [
      { name: 'PlayerA', score: 2100, wins: 67 },
      { name: 'PlayerB', score: 1950, wins: 58 },
      { name: 'PlayerC', score: 1820, wins: 51 }
    ]
  });

  // Mock forum posts data
  const [mockPosts] = useState<ForumPost[]>([
    {
      id: '1',
      title: 'Welcome to Kebele Zero Community!',
      content: 'Hello everyone! I\'m excited to be part of this amazing community. Kebele Zero has brought together so many talented people from different backgrounds. Let\'s share our experiences, learn from each other, and build something amazing together. What are you most excited about in this community?',
      category: 'general',
      tags: ['welcome', 'community', 'introduction'],
      is_pinned: true,
      is_locked: false,
      created_by: 'Admin',
      created_at: '2024-12-20T10:00:00Z',
      updated_at: '2024-12-20T10:00:00Z',
      upvotes: 24,
      likes: 18,
      views: 156
    },
    {
      id: '2',
      title: 'Best strategies for Checkers tournament',
      content: 'I\'ve been playing checkers for a few weeks now and I\'m really enjoying it! I\'ve noticed some players have really advanced strategies. Can anyone share their best tips for winning games? I\'m particularly interested in opening moves and endgame tactics.',
      category: 'games',
      tags: ['checkers', 'strategy', 'tournament'],
      is_pinned: false,
      is_locked: false,
      created_by: 'CheckersFan',
      created_at: '2024-12-19T15:30:00Z',
      updated_at: '2024-12-19T15:30:00Z',
      upvotes: 15,
      likes: 12,
      views: 89
    },
    {
      id: '3',
      title: 'Upcoming Cultural Events in Addis Ababa',
      content: 'I\'ve been researching traditional Ethiopian cultural events and festivals. There are so many amazing celebrations throughout the year! I\'m particularly interested in the Timket festival and traditional coffee ceremonies. Has anyone attended these events? What was your experience like?',
      category: 'culture',
      tags: ['culture', 'events', 'addis-ababa', 'tradition'],
      is_pinned: false,
      is_locked: false,
      created_by: 'CultureLover',
      created_at: '2024-12-18T09:15:00Z',
      updated_at: '2024-12-18T09:15:00Z',
      upvotes: 31,
      likes: 27,
      views: 203
    },
    {
      id: '4',
      title: 'Marbles Game: Tips for beginners',
      content: 'Just started playing marbles and I\'m finding it quite challenging! The physics and aiming seem really important. Can someone explain the best techniques for shooting marbles? Also, what are some good strategies for positioning your pieces?',
      category: 'games',
      tags: ['marbles', 'beginners', 'tips'],
      is_pinned: false,
      is_locked: false,
      created_by: 'NewPlayer',
      created_at: '2024-12-17T14:20:00Z',
      updated_at: '2024-12-17T14:20:00Z',
      upvotes: 8,
      likes: 6,
      views: 67
    },
    {
      id: '5',
      title: 'Community Meetup Ideas',
      content: 'I think it would be amazing to organize some community meetups! Whether it\'s virtual coffee chats, local gatherings, or collaborative projects. What kind of meetups would you be interested in? I\'m thinking about tech discussions, cultural exchanges, or even game tournaments.',
      category: 'events',
      tags: ['meetup', 'community', 'collaboration'],
      is_pinned: false,
      is_locked: false,
      created_by: 'CommunityBuilder',
      created_at: '2024-12-16T11:45:00Z',
      updated_at: '2024-12-16T11:45:00Z',
      upvotes: 19,
      likes: 15,
      views: 134
    },
    {
      id: '6',
      title: 'Traditional Ethiopian Music Recommendations',
      content: 'I\'m looking to expand my knowledge of Ethiopian music. I\'ve heard about azmari music and traditional instruments like the krar and masenqo. Can anyone recommend some good artists or albums to start with? Also interested in modern Ethiopian music that blends traditional and contemporary styles.',
      category: 'culture',
      tags: ['music', 'ethiopian', 'recommendations'],
      is_pinned: false,
      is_locked: false,
      created_by: 'MusicExplorer',
      created_at: '2024-12-15T16:30:00Z',
      updated_at: '2024-12-15T16:30:00Z',
      upvotes: 22,
      likes: 20,
      views: 178
    },
    {
      id: '7',
      title: 'Pool 9-Ball: Advanced Shooting Techniques',
      content: 'I\'ve been practicing pool for a while now and I\'m really getting into the strategy aspect. The key is definitely positioning for the next shot. Anyone have tips on english (spin) and how it affects ball trajectories? Also, what are your favorite break shots?',
      category: 'games',
      tags: ['pool', '9-ball', 'advanced', 'technique'],
      is_pinned: false,
      is_locked: false,
      created_by: 'PoolMaster',
      created_at: '2024-12-14T13:45:00Z',
      updated_at: '2024-12-14T13:45:00Z',
      upvotes: 28,
      likes: 24,
      views: 145
    },
    {
      id: '8',
      title: 'Learning Amharic: Resources and Tips',
      content: 'I\'ve decided to learn Amharic to better connect with the local community. Does anyone have recommendations for good learning resources? I\'ve tried some apps but I\'m looking for more comprehensive courses. Also, any tips for practicing conversation skills?',
      category: 'culture',
      tags: ['amharic', 'language', 'learning', 'resources'],
      is_pinned: false,
      is_locked: false,
      created_by: 'LanguageLearner',
      created_at: '2024-12-13T10:20:00Z',
      updated_at: '2024-12-13T10:20:00Z',
      upvotes: 35,
      likes: 29,
      views: 267
    },
    {
      id: '9',
      title: 'Virtual Game Night - This Friday!',
      content: 'Hey everyone! Let\'s organize a virtual game night this Friday evening. We can play checkers, marbles, or pool tournaments. I\'ll set up a voice chat room. Who\'s interested? What games would you like to play? Let\'s make it fun!',
      category: 'events',
      tags: ['virtual', 'game-night', 'tournament', 'social'],
      is_pinned: false,
      is_locked: false,
      created_by: 'GameNightHost',
      created_at: '2024-12-12T18:15:00Z',
      updated_at: '2024-12-12T18:15:00Z',
      upvotes: 42,
      likes: 38,
      views: 189
    },
    {
      id: '10',
      title: 'Ethiopian Coffee Culture: A Deep Dive',
      content: 'Ethiopian coffee culture is so rich and fascinating! From the traditional jebena brewing to the social aspects of coffee ceremonies. I\'d love to hear about everyone\'s favorite coffee experiences. What are your go-to brewing methods? Any special coffee traditions in your family?',
      category: 'culture',
      tags: ['coffee', 'tradition', 'culture', 'brewing'],
      is_pinned: false,
      is_locked: false,
      created_by: 'CoffeeEnthusiast',
      created_at: '2024-12-11T08:30:00Z',
      updated_at: '2024-12-11T08:30:00Z',
      upvotes: 51,
      likes: 45,
      views: 312
    },
    {
      id: '11',
      title: 'Technical Support: Game Loading Issues',
      content: 'Hi everyone, I\'m having trouble loading the games on my browser. The 3D environment loads fine but when I try to start a game, it just shows a loading spinner forever. I\'ve tried Chrome, Firefox, and Safari. Any suggestions for troubleshooting?',
      category: 'help',
      tags: ['technical', 'support', 'games', 'loading', 'browser'],
      is_pinned: false,
      is_locked: false,
      created_by: 'TechSupportNeeded',
      created_at: '2024-12-10T16:45:00Z',
      updated_at: '2024-12-10T16:45:00Z',
      upvotes: 5,
      likes: 3,
      views: 78
    },
    {
      id: '12',
      title: 'Community Art Showcase',
      content: 'I\'ve been working on some digital art inspired by Ethiopian patterns and colors. I\'d love to share my work and see what everyone else is creating! Whether it\'s traditional art, modern interpretations, or completely original pieces. Let\'s create a virtual art gallery!',
      category: 'culture',
      tags: ['art', 'showcase', 'digital', 'creative', 'gallery'],
      is_pinned: false,
      is_locked: false,
      created_by: 'DigitalArtist',
      created_at: '2024-12-09T12:00:00Z',
      updated_at: '2024-12-09T12:00:00Z',
      upvotes: 33,
      likes: 28,
      views: 156
    },
    {
      id: '13',
      title: 'Weekly Checkers Championship Results',
      content: 'Great games everyone! This week\'s championship had some intense matches. Congratulations to all our winners! Here are the final standings. Next week we\'ll have a special tournament with different rules. Who\'s ready for round 2?',
      category: 'games',
      tags: ['checkers', 'championship', 'results', 'tournament'],
      is_pinned: false,
      is_locked: false,
      created_by: 'TournamentAdmin',
      created_at: '2024-12-08T20:30:00Z',
      updated_at: '2024-12-08T20:30:00Z',
      upvotes: 16,
      likes: 14,
      views: 98
    },
    {
      id: '14',
      title: 'Local Artisan Marketplace',
      content: 'I\'ve discovered some amazing local artisans in Addis Ababa who create beautiful handcrafted items. From traditional woven baskets to modern jewelry with Ethiopian motifs. Has anyone found good places to buy authentic local crafts? I\'d love recommendations!',
      category: 'culture',
      tags: ['artisan', 'marketplace', 'local', 'crafts', 'shopping'],
      is_pinned: false,
      is_locked: false,
      created_by: 'CraftHunter',
      created_at: '2024-12-07T14:10:00Z',
      updated_at: '2024-12-07T14:10:00Z',
      upvotes: 27,
      likes: 22,
      views: 134
    },
    {
      id: '15',
      title: 'New Feature Request: Dark Mode',
      content: 'I\'ve been using the platform a lot lately and I think a dark mode would be amazing! Especially for late-night gaming sessions. What do you all think? Should we petition the admins for this feature? Any other UI improvements you\'d like to see?',
      category: 'general',
      tags: ['feature-request', 'dark-mode', 'ui', 'improvements'],
      is_pinned: false,
      is_locked: false,
      created_by: 'NightOwl',
      created_at: '2024-12-06T22:45:00Z',
      updated_at: '2024-12-06T22:45:00Z',
      upvotes: 38,
      likes: 31,
      views: 203
    }
  ]);

  useEffect(() => {
    // Allow demo access - fetch data even without authentication
    fetchPosts();
    fetchCategories();
    if (user) {
      fetchUserPoints();
    }
  }, [user]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await forumAPI.getPosts(selectedCategory || undefined);
      // If no real posts, use mock data
      if (data.length === 0) {
        const filteredMockPosts = selectedCategory
          ? mockPosts.filter(post => post.category === selectedCategory)
          : mockPosts;
        setPosts(filteredMockPosts);
      } else {
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      // Fallback to mock data on error
      const filteredMockPosts = selectedCategory
        ? mockPosts.filter(post => post.category === selectedCategory)
        : mockPosts;
      setPosts(filteredMockPosts);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await forumAPI.getCategories();
      setCategories(data);
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
      // If no real comments, use mock data
      if (data.length === 0) {
        const mockData = mockComments[postId] || [];
        setComments(mockData);
      } else {
        setComments(data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      // Fallback to mock data on error
      const mockData = mockComments[postId] || [];
      setComments(mockData);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to create posts');
      navigate('/admin/login');
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
    } catch (error) {
      console.error('Error creating post:', error);
      // Add to mock data if API fails
      const newPostWithId = {
        ...postData,
        id: Date.now().toString(),
        created_by: user.email || 'Anonymous',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        upvotes: 0,
        likes: 0,
        views: 0
      };
      mockPosts.unshift(newPostWithId);
    }

    setNewPost({ title: '', content: '', category: 'general' });
    setShowCreateForm(false);
    fetchPosts();
  };

  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to comment');
      navigate('/admin/login');
      return;
    }
    if (!selectedPost || !newComment.trim()) return;

    try {
      await forumAPI.createComment({
        post_id: selectedPost.id,
        content: newComment
      });
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
      alert('Please sign in to like posts');
      navigate('/admin/login');
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
      alert('Please sign in to upvote posts');
      navigate('/admin/login');
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

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

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
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="retro-input w-full px-4 py-3 text-base"
          >
            <option value="">All Categories</option>
            <option value="general">General</option>
            <option value="games">Games</option>
            <option value="culture">Culture</option>
            <option value="events">Events</option>
            <option value="help">Help</option>
          </select>
        </div>
        <div className="sm:w-auto flex items-center">
          <div className="text-sm text-gray-600 mr-4">
            {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
          </div>
          <button
            onClick={() => {
              if (!user) {
                alert('Please sign in to create posts');
                navigate('/admin/login');
                return;
              }
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
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
            <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-blue-600"></div>
          </div>
          <p className="text-gray-600 text-xl font-medium">Loading discussions...</p>
        </div>
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
                if (!user) {
                  alert('Please sign in to create posts');
                  navigate('/admin/login');
                  return;
                }
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
                      <span>💬{comments.filter(c => c.post_id === post.id).length}</span>
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
                          {post.created_by.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium retro-text">{getUserDisplayName(post.created_by)}</div>
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
                <span className="flex items-center space-x-1"><MessageSquare className="w-3 h-3" /><span>{comments.filter(c => c.post_id === selectedPost.id).length}</span></span>
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
                    {selectedPost.created_by.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-medium retro-text">{getUserDisplayName(selectedPost.created_by)}</div>
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
                          {comment.created_by.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium retro-text">{getUserDisplayName(comment.created_by)}</span>
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
                    onClick={() => navigate('/admin/login')}
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
                  onClick={() => setSelectedCategory('')}
                  className="w-full retro-btn py-2 px-3 font-bold text-xs uppercase flex items-center justify-center space-x-2"
                >
                  <span>📋</span>
                  <span>All Posts</span>
                </button>
                <button
                  onClick={() => setSelectedCategory('games')}
                  className="w-full retro-btn py-2 px-3 font-bold text-xs uppercase flex items-center justify-center space-x-2"
                >
                  <span>🎮</span>
                  <span>Games</span>
                </button>
                <button
                  onClick={() => setSelectedCategory('culture')}
                  className="w-full retro-btn py-2 px-3 font-bold text-xs uppercase flex items-center justify-center space-x-2"
                >
                  <span>🎨</span>
                  <span>Culture</span>
                </button>
                <button
                  onClick={() => setSelectedCategory('events')}
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