import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, ShoppingBag, Radio, Image, Settings, BarChart3, Edit3, Trash2, Plus, ArrowLeft, Save, X, LogOut, LogIn, CreditCard, MessageSquare, Trophy, Gamepad2, Filter, Search, MoreVertical, Eye, Ban, CheckCircle, Info, Upload, Camera, Menu, PanelLeftClose, ChevronDown, User } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { forumAPI } from '../services/forum';
import { pointsAPI } from '../services/points';
import { cloudinaryService } from '../services/cloudinary';
import Modal from '../components/Modal';
import MediaGalleryModal from '../components/MediaGalleryModal';
import ImageUpload from '../components/ImageUpload';
import TeamForm from '../components/TeamForm';
import ProductForm from '../components/ProductForm';
import EventForm from '../components/EventForm';
import QuickActions from '../components/QuickActions';
import ImageUploadModal from '../components/ImageUploadModal';
import AdminOverview from '../components/AdminOverview';
import AdminAnalytics from '../components/AdminAnalytics';
import AdminUsers from '../components/AdminUsers';
import AdminEvents from '../pages/AdminEvents';
import AdminForum from '../components/AdminForum';
import AdminGames from '../pages/AdminGames';
import AdminGallery from '../pages/AdminGallery';
import AdminMedia from '../pages/AdminMedia';
import AdminRadio from '../pages/AdminRadio';
import AdminSouq from '../pages/AdminSouq';
import AdminTransactions from '../pages/AdminTransactions';
import AdminAbout from '../pages/AdminAbout';
import AdminSettings from '../pages/AdminSettings';




const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const { user, logout, login, loading: authLoading } = useAuth();

  // Data states
  const [aboutData, setAboutData] = useState<any>({
    title: 'Empowering Ethiopian Communities Through Culture & Innovation',
    hero_section_title: 'WELCOME TO KEBELE',
    content: 'Kebele represents the heart of Ethiopian community - the traditional neighborhood unit that forms the foundation of our social structure. Our platform brings this concept to the digital age, creating spaces where culture thrives, businesses flourish, and communities connect.',
    summary: 'Empowering Ethiopian communities through culture, commerce, and connection',
    mission: 'To preserve and promote Ethiopian cultural heritage while fostering economic growth and community development through innovative digital platforms.',
    vision: 'To become the leading digital hub connecting Ethiopians worldwide, celebrating our rich culture, supporting local businesses, and building stronger communities.',
    mission_title: 'OUR MISSION',
    vision_title: 'OUR VISION',
    story_title: 'OUR STORY',
    impact_title: 'OUR IMPACT',
    values: ["Cultural Preservation", "Community Empowerment", "Innovation", "Excellence", "Unity"],
    history: 'Founded in 2020, Kebele emerged from a vision to bridge the gap between traditional Ethiopian culture and modern digital platforms. What started as a small community project has grown into a comprehensive ecosystem serving millions across the diaspora.',
    team: [],
    contact: {
      email: 'hello@kebele.com',
      phone: '+251 911 123 456',
      address: {
        street: '123 Addis Ababa Street',
        city: 'Addis Ababa',
        state: 'Addis Ababa',
        zipCode: '1000',
        country: 'Ethiopia'
      },
      socialMedia: {
        facebook: 'https://facebook.com/kebele',
        twitter: 'https://twitter.com/kebele',
        instagram: 'https://instagram.com/kebele',
        youtube: 'https://youtube.com/kebele',
        linkedin: 'https://linkedin.com/company/kebele'
      }
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=800&fit=crop',
        alt: 'Ethiopian landscape with traditional houses',
        caption: 'The heart of Ethiopian culture',
        isHero: true
      }
    ],
    stats: [
      { label: "Active Users", value: "500K+", icon: "users" },
      { label: "Events Hosted", value: "2,500+", icon: "calendar" },
      { label: "Products Sold", value: "50K+", icon: "shopping" },
      { label: "Videos Shared", value: "10K+", icon: "play" }
    ],
    hero_image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=800&fit=crop',
    our_story: 'Founded in 2020, Kebele emerged from a vision to bridge the gap between traditional Ethiopian culture and modern digital platforms. What started as a small community project has grown into a comprehensive ecosystem serving millions across the diaspora.',
    our_impact: 'Kebele represents the heart of Ethiopian community - the traditional neighborhood unit that forms the foundation of our social structure. Our platform brings this concept to the digital age, creating spaces where culture thrives, businesses flourish, and communities connect.',
    contact_email: 'hello@kebele.com',
    contact_phone: '+251 911 123 456',
    contact_address: '123 Addis Ababa Street, Addis Ababa, Ethiopia'
  });
  const [users, setUsers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [radioTracks, setRadioTracks] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [forumPosts, setForumPosts] = useState<any[]>([]);
  const [gameScores, setGameScores] = useState<any[]>([]);
  const [userPoints, setUserPoints] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingAbout, setEditingAbout] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState<any>(null);

  // Modal states
  const [showEventForm, setShowEventForm] = useState(false);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [showRadioForm, setShowRadioForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [showGameScoreForm, setShowGameScoreForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [currentImageField, setCurrentImageField] = useState<string>('');

  // Form data states
  const [videoFormData, setVideoFormData] = useState({
    title: '',
    description: '',
    youtube_id: '',
    category: 'cultural'
  });
  const [radioFormData, setRadioFormData] = useState({
    title: '',
    description: '',
    youtube_id: '',
    category: 'music',
    tags: '',
    is_featured: false
  });
  const [userFormData, setUserFormData] = useState({
    email: '',
    username: '',
    role: 'user'
  });
  const [postFormData, setPostFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: [] as string[]
  });
  const [gameScoreFormData, setGameScoreFormData] = useState({
    user_id: '',
    game_type: 'checkers',
    score: 0,
    result: 'win'
  });
  const [productFormData, setProductFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'handicraft',
    stock_quantity: 0
  });
  const [teamFormData, setTeamFormData] = useState({
    name: '',
    role: '',
    bio: '',
    image_url: '',
    linkedin_url: '',
    twitter_url: '',
    instagram_url: '',
    website_url: ''
  });

  const [showUserProfileDropdown, setShowUserProfileDropdown] = useState(false);


  // Fetch data when user is authenticated and has admin role
  useEffect(() => {
    console.log("User", user, authLoading)
    if (!authLoading && user
      //  && user.role === 'admin'
      ) {
      fetchAllData();
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.profile-dropdown')) {
        setShowUserProfileDropdown(false);
      }
    };

    if (showUserProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserProfileDropdown]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Quick action handler
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'create_user':
        setShowUserForm(true);
        break;
      case 'create_post':
        setShowPostForm(true);
        break;
      case 'create_event':
        setShowEventForm(true);
        break;
      case 'create_game_score':
        setShowGameScoreForm(true);
        break;
      case 'create_team':
        setShowTeamForm(true);
        break;
    }
  };

  const handleOpenMediaGallery = (field: string) => {
    setCurrentImageField(field);
    setShowMediaGallery(true);
  };

  const handleSelectImage = (imageUrl: string) => {
    if (currentImageField === 'hero_image') {
      setAboutData({ ...aboutData, hero_image: imageUrl });
    }
    // Add more fields as needed
  };

  // Image Upload Modal Component
  const ImageUploadModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    editingItem?: any;
  }> = ({ isOpen, onClose, onSubmit, editingItem }) => {
    const [formData, setFormData] = useState<{
      title: string;
      description: string;
      alt_text: string;
      caption: string;
      status: string;
      category: string;
      tags: string[];
      media_url: string;
    }>({
      title: '',
      description: '',
      alt_text: '',
      caption: '',
      status: 'draft',
      category: '',
      tags: [],
      media_url: ''
    });

    useEffect(() => {
      if (editingItem) {
        setFormData({
          title: editingItem.title || '',
          description: editingItem.description || '',
          alt_text: editingItem.alt_text || '',
          caption: editingItem.caption || '',
          status: editingItem.status || 'draft',
          category: editingItem.category || '',
          tags: editingItem.tags || [],
          media_url: editingItem.media_url || ''
        });
      } else {
        setFormData({
          title: '',
          description: '',
          alt_text: '',
          caption: '',
          status: 'draft',
          category: '',
          tags: [],
          media_url: ''
        });
      }
    }, [editingItem, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      try {
        let mediaUrl = formData.media_url;

        // If media_url is a data URL or blob, upload to Cloudinary
        if (formData.media_url && (formData.media_url.startsWith('data:') || formData.media_url.startsWith('blob:'))) {
          const response = await fetch(formData.media_url);
          const blob = await response.blob();
          const file = new File([blob], 'upload.jpg', { type: 'image/jpeg' });

          const result = await cloudinaryService.uploadFile(file, {
            folder: 'kebele-media'
          });
          mediaUrl = result.secure_url;
        }

        onSubmit({
          ...formData,
          media_url: mediaUrl
        });
      } catch (error) {
        console.error('Upload failed:', error);
        alert('Upload failed: ' + (error as Error).message);
      }
    };

    return (
      <Modal isOpen={isOpen} onClose={onClose} title={editingItem ? "Edit Image" : "Upload New Image"} size="lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-sm font-semibold retro-text">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="retro-input w-full"
                placeholder="Image title"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-semibold retro-text">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="retro-input w-full bg-white"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold retro-text">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="retro-input w-full resize-none"
              placeholder="Image description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-sm font-semibold retro-text">Alt Text</label>
              <input
                type="text"
                value={formData.alt_text}
                onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
                className="retro-input w-full"
                placeholder="Alt text for accessibility"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-semibold retro-text">Caption</label>
              <input
                type="text"
                value={formData.caption}
                onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                className="retro-input w-full"
                placeholder="Image caption"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold retro-text">Category</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="retro-input w-full"
              placeholder="e.g., about, events, team, general"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold retro-text">Tags</label>
            <input
              type="text"
              value={formData.tags.join(', ')}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) })}
              className="retro-input w-full"
              placeholder="Comma-separated tags"
            />
          </div>

          <ImageUpload
            label="Image File"
            value={formData.media_url}
            onChange={(url) => setFormData({ ...formData, media_url: url })}
            placeholder="Upload or drag & drop image"
          />

          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t-4 border-mustard">
            <button
              type="submit"
              className="flex-1 retro-btn-success py-3 px-6"
            >
              📸 {editingItem ? 'Update' : 'Upload'} Image
            </button>
            <button
              type="button"
              onClick={onClose}
              className="retro-btn-secondary py-3 px-6"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    );
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {

      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });



      if (usersError) {
        console.error('Error fetching users:', usersError);
      } else {
        setUsers(usersData || []);
      }


      // Fetch about content sections
      const { data: aboutContent, error: aboutContentError } = await supabase
        .from('about_content')
        .select('*')
        .eq('is_active', true);

      // Build about data with defaults, then override with database content if available
      const aboutData = {
        title: 'Empowering Ethiopian Communities Through Culture & Innovation',
        summary: 'Empowering Ethiopian communities through culture, commerce, and connection',
        mission: 'To preserve and promote Ethiopian cultural heritage while fostering economic growth and community development through innovative digital platforms.',
        vision: 'To become the leading digital hub connecting Ethiopians worldwide, celebrating our rich culture, supporting local businesses, and building stronger communities.',
        our_story: 'Founded in 2020, Kebele emerged from a vision to bridge the gap between traditional Ethiopian culture and modern digital platforms. What started as a small community project has grown into a comprehensive ecosystem serving millions across the diaspora.',
        our_impact: 'Kebele represents the heart of Ethiopian community - the traditional neighborhood unit that forms the foundation of our social structure. Our platform brings this concept to the digital age, creating spaces where culture thrives, businesses flourish, and communities connect.',
        hero_image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=800&fit=crop',
        mission_title: 'OUR MISSION',
        vision_title: 'OUR VISION',
        story_title: 'OUR STORY',
        impact_title: 'OUR IMPACT',
        hero_section_title: 'WELCOME TO KEBELE',
        contact_email: 'hello@kebele.com',
        contact_phone: '+251 911 123 456',
        contact_address: '123 Addis Ababa Street, Addis Ababa, Ethiopia'
      };

      if (!aboutContentError && aboutContent) {
        // Override with database content
        const titleContent = aboutContent.find(c => c.section === 'title')?.content;
        if (titleContent) aboutData.title = titleContent;

        const heroContent = aboutContent.find(c => c.section === 'hero');
        if (heroContent) {
          if (heroContent.content) aboutData.summary = heroContent.content;
          if (heroContent.image_url) aboutData.hero_image = heroContent.image_url;
          if (heroContent.title) aboutData.hero_section_title = heroContent.title;
        }

        const missionContent = aboutContent.find(c => c.section === 'mission');
        if (missionContent) {
          if (missionContent.content) aboutData.mission = missionContent.content;
          if (missionContent.title) aboutData.mission_title = missionContent.title;
        }

        const visionContent = aboutContent.find(c => c.section === 'vision');
        if (visionContent) {
          if (visionContent.content) aboutData.vision = visionContent.content;
          if (visionContent.title) aboutData.vision_title = visionContent.title;
        }

        const storyContent = aboutContent.find(c => c.section === 'story');
        if (storyContent) {
          if (storyContent.content) aboutData.our_story = storyContent.content;
          if (storyContent.title) aboutData.story_title = storyContent.title;
        }

        const impactContent = aboutContent.find(c => c.section === 'impact');
        if (impactContent) {
          if (impactContent.content) aboutData.our_impact = impactContent.content;
          if (impactContent.title) aboutData.impact_title = impactContent.title;
        }

        const contactContent = aboutContent.find(c => c.section === 'contact')?.content;
        if (contactContent) {
          const emailMatch = contactContent.match(/Email: ([^\n]+)/);
          if (emailMatch) aboutData.contact_email = emailMatch[1];

          const phoneMatch = contactContent.match(/Phone: ([^\n]+)/);
          if (phoneMatch) aboutData.contact_phone = phoneMatch[1];

          const addressMatch = contactContent.match(/Address: ([^\n]+)/);
          if (addressMatch) aboutData.contact_address = addressMatch[1];
        }
      }

      if (aboutContentError) {
        console.error('Error fetching about content:', aboutContentError);
      }

      setAboutData(aboutData);

      if (aboutContentError) {
        console.error('Error fetching about content:', aboutContentError);
      }

      // Fetch events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (eventsError) {
        console.error('Error fetching events:', eventsError);
      } else {
        setEvents(eventsData || []);
      }

      // Fetch videos
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (videosError) {
        console.error('Error fetching videos:', videosError);
      } else {
        setVideos(videosData || []);
      }

      // Fetch radio tracks
      const { data: radioData, error: radioError } = await supabase
        .from('radio')
        .select('*')
        .order('created_at', { ascending: false });

      if (radioError) {
        console.error('Error fetching radio:', radioError);
      } else {
        setRadioTracks(radioData || []);
      }

      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (transactionsError) {
        console.error('Error fetching transactions:', transactionsError);
      } else {
        setTransactions(transactionsData || []);
      }

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

      // Fetch game scores
      const { data: scoresData, error: scoresError } = await supabase
        .from('game_scores')
        .select('*')
        .order('played_at', { ascending: false });

      if (scoresError) {
        console.error('Error fetching game scores:', scoresError);
      } else {
        setGameScores(scoresData || []);
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
      
      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsError) {
        console.error('Error fetching products:', productsError);
      } else {
        setProducts(productsData || []);
      }

      // Fetch team members
      const { data: teamData, error: teamError } = await supabase
        .from('team_members')
        .select('*')
        .order('display_order', { ascending: true });

      if (teamError) {
        console.error('Error fetching team members:', teamError);
        // Set mock team members if error
        setTeamMembers([
          {
            id: '1',
            name: 'Alemayehu Tadesse',
            role: 'Founder & CEO',
            bio: 'Visionary leader with 15+ years in tech and cultural preservation',
            image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
            linkedin_url: 'https://linkedin.com/in/alemayehu',
            twitter_url: '@alemayehu'
          },
          {
            id: '2',
            name: 'Meseret Haile',
            role: 'Cultural Director',
            bio: 'Ethnomusicologist and cultural heritage expert',
            image_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
            instagram_url: '@meseret_culture'
          },
          {
            id: '3',
            name: 'Dawit Bekele',
            role: 'Tech Lead',
            bio: 'Full-stack developer passionate about cultural tech solutions',
            image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
            linkedin_url: 'https://linkedin.com/in/dawitbekele',
            website_url: 'https://dawit.dev'
          }
        ]);
      } else {
        setTeamMembers(teamData || []);
      }

      // Fetch media
      const { data: mediaData, error: mediaError } = await supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false });

      if (mediaError) {
        console.error('Error fetching media:', mediaError);
      } else {
        setMediaItems(mediaData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };



  const handleCreateUser = async (userData: any) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select();

      if (error) throw error;

      setUsers([...users, data[0]]);
      setShowUserForm(false);
      fetchAllData();
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error creating user');
    }
  };

  
  const handleCreateProduct = async (productData: any) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select();

      if (error) throw error;

      setProducts([...products, data[0]]);
      setShowProductForm(false);
      fetchAllData();
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Error adding product');
    }
  };

  const handleUpdateProduct = async (productData: any, productId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', productId)
        .select();

      if (error) throw error;

      setProducts(products.map(p => p.id === productId ? data[0] : p));
      setShowProductForm(false);
      setEditingItem(null);
      fetchAllData();
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating product');
    }
  };
  
 

  const handleCreateTeamMember = async (memberData: any) => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .insert([memberData])
        .select();

      if (error) throw error;

      setTeamMembers([...teamMembers, data[0]]);
      setShowTeamForm(false);
      fetchAllData();
    } catch (error) {
      console.error('Error creating team member:', error);
      alert('Error adding team member');
    }
  };

  const handleUpdateTeamMember = async (memberData: any, memberId: string) => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .update(memberData)
        .eq('id', memberId)
        .select();

      if (error) throw error;

      setTeamMembers(teamMembers.map(m => m.id === memberId ? data[0] : m));
      setShowTeamForm(false);
      setEditingTeamMember(null);
      fetchAllData();
    } catch (error) {
      console.error('Error updating team member:', error);
      alert('Error updating team member');
    }
  };





  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'forum', label: 'Forum', icon: MessageSquare },
    { id: 'games', label: 'Games', icon: Gamepad2 },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'gallery', label: 'Media Library', icon: Image },
    { id: 'media', label: 'Videos', icon: Image },
    { id: 'radio', label: 'Radio', icon: Radio },
    { id: 'souq', label: 'Souq', icon: ShoppingBag },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'about', label: 'About', icon: Info },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminOverview onNavigateToTab={setActiveTab} />;
      

      case 'analytics':
        return <AdminAnalytics />;
 
        case 'users':
          return <AdminUsers />;

      case 'about':
        return <AdminAbout />;

      case 'forum':
        return <AdminForum />;

      case 'games':
        return <AdminGames />;

      case 'events':
        return <AdminEvents />;

      case 'transactions':
        return <AdminTransactions />;

      case 'souq':
         return <AdminSouq />;

      case 'radio':
          return <AdminRadio />;
      
      case 'gallery':
         return <AdminGallery />;

      case 'media':
         return <AdminMedia />;

      case 'settings':
         return <AdminSettings />;

      default:
        return null;
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
      {/* Top Header - Improved */}
      <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 border-b-4 border-charcoal px-6 py-3 flex justify-between items-center shadow-lg z-40">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-600 rounded-lg flex items-center justify-center shadow-xl border-2 border-amber-400 overflow-hidden">
            <img src="/logo.png" alt="Kebele Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="retro-title text-xl font-bold text-white">Admin Dashboard</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative profile-dropdown">
            <button
              onClick={() => setShowUserProfileDropdown(!showUserProfileDropdown)}
              className="flex items-center space-x-3 hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-md border-2 border-blue-400">
                <span className="text-white font-bold text-sm">
                  {displayUser.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-semibold text-white">{(displayUser as any).username || displayUser.email?.split('@')[0]}</p>
                <p className="text-xs text-yellow-100">{displayUser.role === 'admin' ? 'Administrator' : 'User'}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-white" />
            </button>

            {showUserProfileDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border-2 border-amber-200 py-1 z-50">
                <button
                  onClick={() => {
                    setActiveTab('settings');
                    setShowUserProfileDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 flex items-center space-x-2"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
                <button
                  onClick={() => {
                    // Could open user profile modal here
                    setShowUserProfileDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 flex items-center space-x-2"
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </button>
                <div className="border-t border-amber-200 my-1"></div>
                <button
                  onClick={() => {
                    navigate('/');
                    setShowUserProfileDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Site</span>
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setShowUserProfileDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals - Rendered outside main container for proper z-index */}
      {showUserForm && (
        <Modal
          isOpen={showUserForm}
          onClose={() => setShowUserForm(false)}
          title="Add New User"
        >
          <form onSubmit={(e) => { e.preventDefault(); handleCreateUser(userFormData); setShowUserForm(false); }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
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
              <div className="space-y-3">
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
            </div>
            <div className="space-y-3">
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
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t-4 border-mustard">
              <button
                type="submit"
                className="flex-1 retro-btn-success py-3 px-6"
              >
                👤 Create User
              </button>
              <button
                type="button"
                onClick={() => { setShowUserForm(false); setUserFormData({ email: '', username: '', role: 'user' }); }}
                className="retro-btn-secondary py-3 px-6"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showProductForm && (
        <Modal
          isOpen={showProductForm}
          onClose={() => { setShowProductForm(false); setEditingItem(null); }}
          title={editingItem ? "Edit Product" : "Add New Product"}
          size="md"
        >
          <ProductForm
            onSubmit={(data) => {
              if (editingItem) {
                handleUpdateProduct(data, editingItem.id);
              } else {
                handleCreateProduct(data);
              }
            }}
            onCancel={() => { setShowProductForm(false); setEditingItem(null); }}
            editingItem={editingItem}
          />
        </Modal>
      )}

      <MediaGalleryModal
        isOpen={showMediaGallery}
        onClose={() => setShowMediaGallery(false)}
        onSelectImage={handleSelectImage}
      />

      <ImageUploadModal
        isOpen={showImageUploadModal}
        onClose={() => {
          setShowImageUploadModal(false);
          setEditingItem(null);
        }}
        onSubmit={async (formData) => {
          try {
            // Save to media table
            const { data: responseData, error } = await supabase
              .from('media')
              .insert([{
                title: formData.title,
                description: formData.description,
                alt_text: formData.alt_text,
                caption: formData.caption,
                media_url: formData.media_url,
                status: formData.status,
                tags: formData.tags,
                category: formData.category || 'general',
                is_active: formData.status === 'published'
              }])
              .select()
              .single();

            if (error) throw error;

            console.log('Image saved to media table:', responseData);
            alert('Image uploaded and saved successfully!');
            setShowImageUploadModal(false);
            setEditingItem(null);

            // Refresh media items
            fetchAllData();
          } catch (error) {
            console.error('Error saving image:', error);
            alert('Error saving image to database');
          }
        }}
        editingItem={editingItem}
      />

      {showTeamForm && (
        <Modal
          isOpen={showTeamForm}
          onClose={() => { setShowTeamForm(false); setEditingTeamMember(null); }}
          title={editingTeamMember ? "Edit Team Member" : "Add New Team Member"}
          size="md"
        >
          <TeamForm
            onSubmit={(data) => {
              if (editingTeamMember) {
                handleUpdateTeamMember(data, editingTeamMember.id);
              } else {
                handleCreateTeamMember(data);
              }
            }}
            onCancel={() => { setShowTeamForm(false); setEditingTeamMember(null); }}
            editingItem={editingTeamMember}
          />
        </Modal>
      )}

      <div className="min-h-screen retro-bg retro-bg-enhanced">
        {/* Sidebar - Improved */}
        <div className={`fixed top-0 left-0 min-h-screen bg-gradient-to-b from-white via-gray-50 to-white shadow-xl border-r-4 border-charcoal z-50 transition-all duration-500 ease-in-out overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 ${
          sidebarCollapsed ? 'w-16' : 'w-60'
        }`}>
        {/* Header - Improved */}
        <div className="p-4 border-b-4 border-charcoal bg-gradient-to-r from-amber-500 to-orange-500">
          <div className="flex items-center justify-between">
            <div className={`flex items-center space-x-3 ${sidebarCollapsed ? 'justify-center flex-1' : ''}`}>
              <div className="w-9 h-9 bg-gradient-to-br from-amber-600 to-orange-600 rounded-lg flex items-center justify-center retro-icon shadow-xl border-2 border-amber-400 overflow-hidden">
                <img src="/logo.png" alt="Kebele Logo" className="w-full h-full object-cover" />
              </div>
              {!sidebarCollapsed && (
                <div>
                  <h1 className="retro-title text-lg font-bold text-white">Admin Panel</h1>
                  <p className="retro-text text-xs text-yellow-100">Kebele Zero</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="retro-btn p-2 cursor-pointer hover:scale-110 transition-transform ml-2 bg-white/20 backdrop-blur-sm"
              title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              <PanelLeftClose className={`w-5 h-5 retro-icon transition-transform duration-300 text-white ${
                sidebarCollapsed ? 'rotate-180' : ''
              }`} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-2">
          <div className="space-y-1">
            {/* Main Management */}
            {!sidebarCollapsed && (
              <h3 className="retro-title text-xs font-bold uppercase tracking-wider px-3 py-2 text-gray-600">Management</h3>
            )}
            {['overview', 'analytics', 'users', 'forum', 'games', 'souq'].map((tabId) => {
              const tab = tabs.find(t => t.id === tabId);
              if (!tab) return null;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-yellow-500 text-white border border-yellow-600 shadow-sm'
                      : 'hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                  } ${sidebarCollapsed ? 'justify-center px-3 py-3' : ''}`}
                  title={sidebarCollapsed ? tab.label : ''}
                >
                  <Icon className={`retro-icon transition-colors duration-200 ease-in-out ${sidebarCollapsed ? 'w-5 h-5' : 'w-4 h-4'} ${
                    activeTab === tab.id ? 'text-white' : 'text-gray-700'
                  }`} />
                  {!sidebarCollapsed && (
                    <span className={`text-sm font-medium transition-colors duration-200 ease-in-out ${activeTab === tab.id ? 'text-white' : 'retro-text'}`}>{tab.label}</span>
                  )}
                </button>
              );
            })}

            {/* Content Section */}
            {!sidebarCollapsed && (
              <h3 className="retro-title text-xs font-bold uppercase tracking-wider px-3 py-2 mt-4 text-gray-600">Content</h3>
            )}
            {['events', 'gallery', 'media', 'radio'].map((tabId) => {
              const tab = tabs.find(t => t.id === tabId);
              if (!tab) return null;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-yellow-500 text-white border border-yellow-600 shadow-sm'
                      : 'hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                  } ${sidebarCollapsed ? 'justify-center px-3 py-3' : ''}`}
                  title={sidebarCollapsed ? tab.label : ''}
                >
                  <Icon className={`retro-icon transition-colors duration-200 ease-in-out ${sidebarCollapsed ? 'w-5 h-5' : 'w-4 h-4'} ${
                    activeTab === tab.id ? 'text-white' : 'text-gray-700'
                  }`} />
                  {!sidebarCollapsed && (
                    <span className={`text-sm font-medium transition-colors duration-200 ease-in-out ${activeTab === tab.id ? 'text-white' : 'retro-text'}`}>{tab.label}</span>
                  )}
                </button>
              );
            })}

            {/* System Section */}
            {!sidebarCollapsed && (
              <h3 className="retro-title text-xs font-bold uppercase tracking-wider px-3 py-2 mt-4 text-gray-600">System</h3>
            )}
            {['about', 'transactions', 'settings'].map((tabId) => {
              const tab = tabs.find(t => t.id === tabId);
              if (!tab) return null;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-yellow-500 text-white border border-yellow-600 shadow-sm'
                      : 'hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                  } ${sidebarCollapsed ? 'justify-center px-3 py-3' : ''}`}
                  title={sidebarCollapsed ? tab.label : ''}
                >
                  <Icon className={`retro-icon transition-colors duration-200 ease-in-out ${sidebarCollapsed ? 'w-5 h-5' : 'w-4 h-4'} ${
                    activeTab === tab.id ? 'text-white' : 'text-gray-700'
                  }`} />
                  {!sidebarCollapsed && (
                    <span className={`text-sm font-medium transition-colors duration-200 ease-in-out ${activeTab === tab.id ? 'text-white' : 'retro-text'}`}>{tab.label}</span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

      </div>

      {/* Main Content */}
      <div className={`flex flex-col min-h-screen transition-all duration-500 ease-in-out mt-20 ${
        sidebarCollapsed ? 'ml-20' : 'ml-72'
      }`}>
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="p-6 h-full">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}

export default AdminDashboard;

