import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, ShoppingBag, Radio, Image, Settings, BarChart3, Edit3, Trash2, Plus, ArrowLeft, Save, X, LogOut, LogIn, CreditCard, MessageSquare, Trophy, Gamepad2, Filter, Search, MoreVertical, Eye, Ban, CheckCircle, Info, Upload, Camera, Menu, PanelLeftClose } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { forumAPI } from '../services/forum';
import { pointsAPI } from '../services/points';
import { cloudinaryService } from '../services/cloudinary';

// Modal Component
const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  return (
    <div className="fixed inset-0 z-[100000] retro-modal flex items-center justify-center p-4" style={{ zIndex: 100000, position: 'fixed' }}>
      <div className={`retro-modal-content ${sizeClasses[size]} w-full max-h-[90vh] overflow-hidden retro-floating-enhanced`} style={{ zIndex: 100001, position: 'relative' }}>
        <div className="retro-titlebar retro-titlebar-mustard">
          <h3 className="retro-title text-lg">{title}</h3>
          <button
            onClick={onClose}
            className="retro-btn text-xl px-3 py-1"
          >
            ×
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {children}
        </div>
      </div>
      </div>
    );
  };

// Media Gallery Modal for Image Selection
const MediaGalleryModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
}> = ({ isOpen, onClose, onSelectImage }) => {
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchMediaItems();
    }
  }, [isOpen]);

  const fetchMediaItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMediaItems(data || []);
    } catch (error) {
      console.error('Error fetching media:', error);
      // Fallback to mock data
      setMediaItems([
        { id: '1', title: 'Hero Image 1', media_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop' },
        { id: '2', title: 'Hero Image 2', media_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop' },
        { id: '3', title: 'Hero Image 3', media_url: 'https://images.unsplash.com/photo-1551818255-e9353de8d1b0?w=800&h=600&fit=crop' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Image from Gallery" size="xl">
      {loading ? (
        <div className="text-center py-8">
          <div className="retro-spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="retro-text">Loading media gallery...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mediaItems.map((item) => (
            <div
              key={item.id}
              className="retro-window cursor-pointer hover:scale-105 transition-transform"
              onClick={() => {
                onSelectImage(item.media_url);
                onClose();
              }}
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={item.media_url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-2">
                <p className="retro-text text-xs truncate">{item.title}</p>
              </div>
            </div>
          ))}
          {mediaItems.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="retro-text">No images in gallery yet.</p>
              <p className="retro-text text-sm opacity-70">Upload some images first!</p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

// Image URL Input Component
const ImageUpload: React.FC<{
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  saveToMedia?: boolean;
  onMediaUpdate?: (mediaItem: any) => void;
  disabled?: boolean;
}> = ({ value, onChange, label = "Image URL", placeholder = "Enter image URL", saveToMedia = false, onMediaUpdate, disabled = false }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => setImageError(true);
  const handleImageLoad = () => setImageError(false);

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-semibold retro-text">{label}</label>}
      <div className="space-y-3">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="retro-input w-full"
          disabled={disabled}
        />
        {value && (
          <div className="space-y-3">
            <div className="relative">
              <img
                src={value}
                alt="Preview"
                className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
              {imageError && (
                <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Invalid image URL</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Image preview</span>
              <button
                type="button"
                onClick={() => onChange('')}
                className="text-red-500 hover:text-red-700 text-sm font-medium"
                disabled={disabled}
              >
                Remove
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Team Form Component
const TeamForm: React.FC<{ onSubmit: (data: any) => void; onCancel: () => void; editingItem?: any }> = ({ onSubmit, onCancel, editingItem }) => {
  const [formData, setFormData] = useState({
    name: editingItem?.name || '',
    role: editingItem?.role || '',
    bio: editingItem?.bio || '',
    image_url: editingItem?.image_url || '',
    linkedin_url: editingItem?.linkedin_url || '',
    twitter_url: editingItem?.twitter_url || '',
    instagram_url: editingItem?.instagram_url || '',
    website_url: editingItem?.website_url || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-semibold retro-text">Name *</label>
          <input
            type="text"
            required
            placeholder="Full name"
            className="retro-input w-full"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-semibold retro-text">Role *</label>
          <input
            type="text"
            required
            placeholder="Job title"
            className="retro-input w-full"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold retro-text">Bio</label>
        <textarea
          rows={1}
          placeholder="Brief biography"
          className="retro-input w-full resize-none"
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
        />
      </div>

      <ImageUpload
        label="Profile Image"
        value={formData.image_url}
        onChange={(url) => setFormData({ ...formData, image_url: url })}
        placeholder="Drag & drop image or click to browse"
      />

      <div className="space-y-3">
        <label className="block text-sm font-semibold retro-text">Social Links</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="url"
            placeholder="LinkedIn URL"
            className="retro-input w-full"
            value={formData.linkedin_url}
            onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
          />
          <input
            type="text"
            placeholder="@twitter_handle"
            className="retro-input w-full"
            value={formData.twitter_url}
            onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
          />
          <input
            type="text"
            placeholder="@instagram_handle"
            className="retro-input w-full"
            value={formData.instagram_url}
            onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
          />
          <input
            type="url"
            placeholder="Website URL"
            className="retro-input w-full"
            value={formData.website_url}
            onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
        <button
          type="submit"
          className="flex-1 retro-btn-success py-2 px-4 text-sm"
        >
          👥 {editingItem ? 'Update' : 'Add Member'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="retro-btn-secondary py-2 px-4 text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

// Form Components
const ProductForm: React.FC<{ onSubmit: (data: any) => void; onCancel: () => void; editingItem?: any }> = ({ onSubmit, onCancel, editingItem }) => {
  const [formData, setFormData] = useState({
    name: editingItem?.name || '',
    description: editingItem?.description || '',
    price: editingItem?.price || 0,
    category: editingItem?.category || 'handicraft',
    stock_quantity: editingItem?.stock_quantity || 0,
    image_url: editingItem?.image_url || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-semibold retro-text">Product Name *</label>
          <input
            type="text"
            required
            placeholder="Enter product name"
            className="retro-input w-full"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-semibold retro-text">Category</label>
          <select
            className="retro-input w-full bg-white"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            <option value="handicraft">👐 Handicraft</option>
            <option value="food">🍽️ Food & Beverage</option>
            <option value="clothing">👕 Clothing</option>
            <option value="art">🎨 Art & Decor</option>
            <option value="books">📚 Books</option>
            <option value="other">📦 Other</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold retro-text">Description *</label>
        <textarea
          required
          rows={1}
          placeholder="Describe your product"
          className="retro-input w-full resize-none"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-semibold retro-text">Price ($)</label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            placeholder="0.00"
            className="retro-input w-full"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-semibold retro-text">Stock Quantity</label>
          <input
            type="number"
            required
            min="0"
            placeholder="0"
            className="retro-input w-full"
            value={formData.stock_quantity}
            onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
          />
        </div>
      </div>

      <ImageUpload
        label="Product Image"
        value={formData.image_url}
        onChange={(url) => setFormData({ ...formData, image_url: url })}
        placeholder="Drag & drop product image"
      />

      <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
        <button
          type="submit"
          className="flex-1 retro-btn-success py-2 px-4 text-sm"
        >
          🛍️ {editingItem ? 'Update' : 'Create'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="retro-btn-secondary py-2 px-4 text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

const EventForm: React.FC<{ onSubmit: (data: any) => void; onCancel: () => void }> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'cultural',
    start_date: '',
    end_date: '',
    location: { venue: '', address: { city: 'Addis Ababa', country: 'Ethiopia' } },
    organizer: { name: '', email: '' },
    image_url: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      start_date: new Date(formData.start_date).toISOString(),
      end_date: new Date(formData.end_date).toISOString()
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="retro-title text-xl mb-2">Create New Event</h3>
        <p className="retro-text text-sm opacity-80">Fill in the details to add a new event to your platform</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold retro-text">Event Title</label>
            <input
              type="text"
              required
              placeholder="Enter event title"
              className="retro-input w-full"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold retro-text">Category</label>
            <select
              className="retro-input w-full bg-white"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="music">🎵 Music</option>
              <option value="art">🎨 Art</option>
              <option value="workshop">🔧 Workshop</option>
              <option value="performance">🎭 Performance</option>
              <option value="networking">🤝 Networking</option>
              <option value="cultural">🏛️ Cultural</option>
              <option value="other">📌 Other</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold retro-text">Description</label>
          <textarea
            required
            rows={2}
            placeholder="Describe your event in detail"
            className="retro-input w-full resize-none"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold retro-text">Event Image URL</label>
          <input
            type="url"
            placeholder="https://example.com/event-image.jpg"
            className="retro-input w-full"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold retro-text">Start Date & Time</label>
            <input
              type="datetime-local"
              required
              className="retro-input w-full"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold retro-text">End Date & Time</label>
            <input
              type="datetime-local"
              required
              className="retro-input w-full"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold retro-text">Venue</label>
            <input
              type="text"
              required
              placeholder="Event location"
              className="retro-input w-full"
              value={formData.location.venue}
              onChange={(e) => setFormData({
                ...formData,
                location: { ...formData.location, venue: e.target.value }
              })}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold retro-text">City</label>
            <input
              type="text"
              required
              placeholder="City name"
              className="retro-input w-full"
              value={formData.location.address.city}
              onChange={(e) => setFormData({
                ...formData,
                location: {
                  ...formData.location,
                  address: { ...formData.location.address, city: e.target.value }
                }
              })}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t-4 border-mustard">
          <button
            type="submit"
            className="flex-1 retro-btn-success py-3 px-6"
          >
            🎉 Create Event
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="retro-btn-secondary py-3 px-6"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

// Quick Actions Component
const QuickActions: React.FC<{ onAction: (action: string) => void }> = ({ onAction }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
    <button
      onClick={() => onAction('create_user')}
      className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
    >
      <Plus className="w-5 h-5 text-blue-600 mx-auto mb-1" />
      <span className="text-xs font-medium text-blue-700">Add User</span>
    </button>
    <button
      onClick={() => onAction('create_post')}
      className="p-3 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
    >
      <MessageSquare className="w-5 h-5 text-green-600 mx-auto mb-1" />
      <span className="text-xs font-medium text-green-700">New Post</span>
    </button>
    <button
      onClick={() => onAction('create_event')}
      className="p-3 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
    >
      <Calendar className="w-5 h-5 text-purple-600 mx-auto mb-1" />
      <span className="text-xs font-medium text-purple-700">Add Event</span>
    </button>
    <button
      onClick={() => onAction('create_game_score')}
      className="p-3 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors"
    >
      <Trophy className="w-5 h-5 text-orange-600 mx-auto mb-1" />
      <span className="text-xs font-medium text-orange-700">Game Score</span>
    </button>
  </div>
);

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
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
  const [forumComments, setForumComments] = useState<any[]>([]);
  const [gameScores, setGameScores] = useState<any[]>([]);
  const [userPoints, setUserPoints] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingAbout, setEditingAbout] = useState(false);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState<any>(null);

  // Modal states
  const [showEventForm, setShowEventForm] = useState(false);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [showRadioForm, setShowRadioForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [showGameScoreForm, setShowGameScoreForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
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
    category:  'general',
    tags: []
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

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Fetch data when user is authenticated and has admin role
  useEffect(() => {
    console.log("User", user, authLoading)
    if (!authLoading && user && user.role === 'admin') {
      fetchAllData();
    }
  }, [user, authLoading]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
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

  const handleSaveAbout = async () => {
    if (!aboutData) return;

    try {
      // Save different sections to about_content table
      const sections = [
        {
          section: 'title',
          title: 'Main Title',
          content: aboutData.title,
          is_active: true
        },
        {
          section: 'hero',
          title: aboutData.hero_section_title || 'Welcome to Kebele',
          content: aboutData.summary,
          image_url: aboutData.hero_image,
          is_active: true
        },
        {
          section: 'mission',
          title: aboutData.mission_title || 'Our Mission',
          content: aboutData.mission,
          is_active: true
        },
        {
          section: 'vision',
          title: aboutData.vision_title || 'Our Vision',
          content: aboutData.vision,
          is_active: true
        },
        {
          section: 'story',
          title: aboutData.story_title || 'Our Story',
          content: aboutData.our_story,
          is_active: true
        },
        {
          section: 'impact',
          title: aboutData.impact_title || 'Our Impact',
          content: aboutData.our_impact,
          is_active: true
        },
        {
          section: 'contact',
          title: 'Contact Information',
          content: `Email: ${aboutData.contact_email}\nPhone: ${aboutData.contact_phone}\nAddress: ${aboutData.contact_address}`,
          is_active: true
        }
      ];
      console.log(user, "User")
      // Upsert each section
      for (const section of sections) {
        const { error } = await supabase
          .from('about_content')
          .upsert(section, { onConflict: 'section' });

        if (error) throw error;
      }

      setEditingAbout(false);
      // Refresh data to show changes
      fetchAllData();
      alert('About page updated successfully!');
    } catch (error) {
      console.error('Error saving about:', error);
      alert('Error saving about page');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEvents(events.filter(event => event.id !== id));
      alert('Event deleted successfully!');
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Error deleting event');
    }
  };

  const handleDeleteRadioTrack = async (id: string) => {
    if (!confirm('Are you sure you want to delete this track?')) return;

    try {
      const { error } = await supabase
        .from('radio')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRadioTracks(radioTracks.filter(track => track.id !== id));
      alert('Track deleted successfully!');
    } catch (error) {
      console.error('Error deleting track:', error);
      alert('Error deleting track');
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setVideos(videos.filter(video => video.id !== id));
      alert('Video deleted successfully!');
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Error deleting video');
    }
  };

  // CRUD functions
  const handleCreateEvent = async (eventData: any) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select();

      if (error) throw error;

      setEvents([...events, data[0]]);
      setShowEventForm(false);
      fetchAllData();
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Error creating event');
    }
  };

  const handleCreateVideo = async (videoData: any) => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .insert([videoData])
        .select();

      if (error) throw error;

      setVideos([...videos, data[0]]);
      setShowVideoForm(false);
      fetchAllData();
    } catch (error) {
      console.error('Error creating video:', error);
      alert('Error adding video');
    }
  };

  const handleCreateRadioTrack = async (trackData: any) => {
    try {
      const { data, error } = await supabase
        .from('radio')
        .insert([trackData])
        .select();

      if (error) throw error;

      setRadioTracks([...radioTracks, data[0]]);
      setShowRadioForm(false);
      fetchAllData();
    } catch (error) {
      console.error('Error creating track:', error);
      alert('Error adding track');
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

  const handleCreatePost = async (postData: any) => {
    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .insert([postData])
        .select();

      if (error) throw error;

      setForumPosts([...forumPosts, data[0]]);
      setShowPostForm(false);
      fetchAllData();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Error creating post');
    }
  };

  const handleCreateGameScore = async (scoreData: any) => {
    try {
      const { data, error } = await supabase
        .from('game_scores')
        .insert([scoreData])
        .select();
  
      if (error) throw error;
  
      setGameScores([...gameScores, data[0]]);
      setShowGameScoreForm(false);
      fetchAllData();
    } catch (error) {
      console.error('Error creating game score:', error);
      alert('Error creating game score');
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
  
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProducts(products.filter(product => product.id !== id));
      alert('Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
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

  const handleDeleteTeamMember = async (id: string) => {
    if (!confirm('Are you sure you want to delete this team member?')) return;

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTeamMembers(teamMembers.filter(member => member.id !== id));
      alert('Team member deleted successfully!');
    } catch (error) {
      console.error('Error deleting team member:', error);
      alert('Error deleting team member');
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
        return (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="retro-window">
              <div className="retro-titlebar retro-titlebar-coral">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-5 h-5 retro-icon" />
                  <span className="retro-title text-sm uppercase">Dashboard Overview</span>
                </div>
              </div>
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-amber-600 retro-icon">
                  <span className="text-white font-bold text-2xl retro-title">
                    {displayUser.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h1 className="text-xl md:text-2xl retro-title mb-2 uppercase tracking-tight">
                  Welcome back, {displayUser.email?.split('@')[0]}!
                </h1>
                <p className="text-sm retro-text max-w-2xl mx-auto leading-relaxed">
                  Manage your platform content and settings
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              <div className="retro-card retro-hover">
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center shadow-md border-2 border-amber-400 retro-icon">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-amber-900 retro-title">{events.length * 20}K+</p>
                      <p className="text-xs text-amber-700 uppercase tracking-wide retro-text">Users</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="retro-card retro-hover">
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-md border-2 border-green-400 retro-icon">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-green-900 retro-title">{events.length}</p>
                      <p className="text-xs text-green-700 uppercase tracking-wide retro-text">Events</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="retro-card retro-floating retro-hover">
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-md border-2 border-purple-400 retro-icon">
                      <Image className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-purple-900 retro-title">{videos.length}</p>
                      <p className="text-xs text-purple-700 uppercase tracking-wide retro-text">Videos</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="retro-card retro-floating retro-hover">
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-md border-2 border-orange-400 retro-icon">
                      <CreditCard className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-orange-900 retro-title">
                      ${transactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0).toFixed(0)}
                      </p>
                      <p className="text-xs text-orange-700 uppercase tracking-wide retro-text">Revenue</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="retro-card retro-floating retro-hover">
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-md border-2 border-blue-400 retro-icon">
                      <Radio className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-900 retro-title">{radioTracks.length}</p>
                      <p className="text-xs text-blue-700 uppercase tracking-wide retro-text">Radio</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="retro-card retro-floating retro-hover">
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center shadow-md border-2 border-pink-400 retro-icon">
                      <ShoppingBag className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-pink-900 retro-title">{products.length}</p>
                      <p className="text-xs text-pink-700 uppercase tracking-wide retro-text">Products</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="retro-card retro-floating retro-hover">
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-md border-2 border-teal-400 retro-icon">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-teal-900 retro-title">{forumPosts.length}</p>
                      <p className="text-xs text-teal-700 uppercase tracking-wide retro-text">Posts</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="retro-card retro-floating retro-hover">
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-lg flex items-center justify-center shadow-md border-2 border-yellow-400 retro-icon">
                      <Trophy className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-yellow-900 retro-title">{gameScores.length}</p>
                      <p className="text-xs text-yellow-700 uppercase tracking-wide retro-text">Games</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="retro-card retro-floating retro-hover">
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shadow-md border-2 border-indigo-400 retro-icon">
                      <CreditCard className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-indigo-900 retro-title">{transactions.length}</p>
                      <p className="text-xs text-indigo-700 uppercase tracking-wide retro-text">Transactions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="retro-window">
                <div className="retro-titlebar retro-titlebar-teal">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 retro-icon" />
                    <div>
                      <h3 className="retro-title text-sm">Recent Events</h3>
                      <p className="retro-text text-xs opacity-80">Latest event activity</p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  {events.slice(0, 4).length === 0 ? (
                    <div className="text-center py-6">
                      <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2 retro-icon" />
                      <p className="retro-text text-sm">No events yet</p>
                      <p className="retro-text text-xs opacity-70">Create your first event to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {events.slice(0, 4).map((event) => (
                        <div key={event.id} className="flex items-center space-x-3 p-2 retro-card retro-hover">
                          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-900 truncate retro-title">{event.title}</p>
                            <p className="text-xs text-gray-500 retro-text">
                              📅 {new Date(event.start_date).toLocaleDateString()} • 📍 {event.location?.venue || 'TBD'}
                            </p>
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium retro-badge">
                            Active
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="retro-window">
                <div className="retro-titlebar retro-titlebar-sky">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-4 h-4 retro-icon" />
                    <div>
                      <h3 className="retro-title text-sm">Recent Transactions</h3>
                      <p className="retro-text text-xs opacity-80">Payment activity overview</p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  {transactions.slice(0, 4).length === 0 ? (
                    <div className="text-center py-6">
                      <CreditCard className="w-10 h-10 text-gray-300 mx-auto mb-2 retro-icon" />
                      <p className="retro-text text-sm">No transactions yet</p>
                      <p className="retro-text text-xs opacity-70">Transactions will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {transactions.slice(0, 4).map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-2 retro-card retro-hover">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              transaction.status === 'completed' ? 'bg-green-500' :
                              transaction.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}></div>
                            <div>
                              <p className="text-xs font-semibold text-gray-900 retro-title">
                                ${transaction.amount} {transaction.currency}
                              </p>
                              <p className="text-xs text-gray-500 retro-text">
                                {new Date(transaction.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold retro-badge ${
                            transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                            transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {transaction.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
      );
      

      case 'analytics':
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
                    <>
                      <h3 className="retro-title text-xs">Game Sessions</h3>
                      <p className="retro-text text-xs opacity-80">Total plays</p>
                    </>
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
                    <>
                      <h3 className="retro-title text-xs">Revenue</h3>
                      <p className="retro-text text-xs opacity-80">This month</p>
                    </>
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
 
        case 'users':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="retro-title text-xl">User Management</h2>
                <p className="retro-text text-base opacity-80 mt-2">Manage platform users and their roles</p>
              </div>
              <button
                onClick={() => setShowUserForm(true)}
                className="retro-btn px-6 py-3 flex items-center space-x-2"
              >
                <Plus className="w-5 h-5 retro-icon" />
                <span>Add User</span>
              </button>
            </div>

            {loading ? (
              <div className="retro-window text-center py-16">
                <div className="retro-spinner w-16 h-16 mx-auto mb-6"></div>
                <p className="retro-text text-lg">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="retro-window text-center py-16">
                <Users className="w-20 h-20 text-gray-300 mx-auto mb-6 retro-icon" />
                <p className="retro-text text-xl">No users found</p>
                <p className="retro-text text-base opacity-70 mt-3">Users will appear here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {users.map((user) => (
                  <div key={user.id} className="retro-window retro-hover">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-md border-2 border-blue-400 retro-icon">
                            <span className="text-white font-bold retro-title">
                              {user.email?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-xl retro-title">{user.username || user.email}</h4>
                            <p className="text-sm text-gray-600 retro-text">{user.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="retro-text text-sm">Role:</span>
                          <select
                            value={user.role}
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
                            className="retro-input text-sm px-3 py-1"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="retro-text text-sm">Joined:</span>
                          <span className="retro-text text-sm opacity-80">
                            {new Date(user.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-end pt-2">
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
                            className="retro-btn-secondary px-4 py-2"
                            disabled={!user.is_active}
                          >
                            <Trash2 className="w-4 h-4 retro-icon mr-2" />
                            Deactivate
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'about':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="retro-title text-xl">About Page Management</h2>
                <p className="retro-text text-sm opacity-80">Edit the content displayed on the about page</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingAbout(!editingAbout)}
                  className={`retro-btn px-4 py-2 text-sm flex items-center space-x-2 ${
                    editingAbout ? 'bg-red-500 hover:bg-red-600' : ''
                  }`}
                >
                  {editingAbout ? <X className="w-4 h-4 retro-icon" /> : <Edit3 className="w-4 h-4 retro-icon" />}
                  <span>{editingAbout ? 'Cancel' : 'Edit'}</span>
                </button>
                {editingAbout && (
                  <button
                    onClick={handleSaveAbout}
                    className="retro-btn-success px-4 py-2 text-sm flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4 retro-icon" />
                    <span>Save All</span>
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="retro-window text-center py-8">
                <div className="retro-spinner w-12 h-12 mx-auto mb-4"></div>
                <p className="retro-text text-base">Loading about data...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Hero Section */}
                <div className="retro-window">
                  <div className="retro-titlebar retro-titlebar-coral p-3">
                    <h3 className="retro-title text-base">Hero Section</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold retro-text">Main Title</label>
                        <input
                          type="text"
                          className={`retro-input w-full text-sm py-2 ${!editingAbout ? 'bg-gray-50' : ''}`}
                          value={aboutData?.title || ''}
                          onChange={(e) => setAboutData({ ...aboutData, title: e.target.value })}
                          disabled={!editingAbout}
                          placeholder="Empowering Ethiopian Communities..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold retro-text">Hero Title</label>
                        <input
                          type="text"
                          className={`retro-input w-full text-sm py-2 ${!editingAbout ? 'bg-gray-50' : ''}`}
                          value={aboutData?.hero_section_title || 'WELCOME TO KEBELE'}
                          onChange={(e) => setAboutData({ ...aboutData, hero_section_title: e.target.value })}
                          disabled={!editingAbout}
                          placeholder="WELCOME TO KEBELE"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold retro-text">Hero Content</label>
                      <textarea
                        rows={1}
                        className={`retro-input w-full resize-none text-sm ${!editingAbout ? 'bg-gray-50' : ''}`}
                        value={aboutData?.summary || ''}
                        onChange={(e) => setAboutData({ ...aboutData, summary: e.target.value })}
                        disabled={!editingAbout}
                        placeholder="Empowering Ethiopian communities..."
                      />
                    </div>
                    <div className="space-y-2">
                      <ImageUpload
                        label="Hero Image"
                        value={aboutData?.hero_image || ''}
                        onChange={(url) => setAboutData({ ...aboutData, hero_image: url })}
                        placeholder="Drag & drop hero image"
                        saveToMedia={true}
                        onMediaUpdate={(item) => setMediaItems(prev => [...prev, item])}
                        disabled={!editingAbout}
                      />
                    </div>
                  </div>
                </div>

                {/* Mission & Vision */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="retro-window">
                    <div className="retro-titlebar retro-titlebar-sky p-3">
                      <h3 className="retro-title text-base">Mission</h3>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold retro-text">Title</label>
                        <input
                          type="text"
                          className={`retro-input w-full text-sm py-2 ${!editingAbout ? 'bg-gray-50' : ''}`}
                          value={aboutData?.mission_title || 'OUR MISSION'}
                          onChange={(e) => setAboutData({ ...aboutData, mission_title: e.target.value })}
                          disabled={!editingAbout}
                          placeholder="OUR MISSION"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold retro-text">Content</label>
                        <textarea
                          rows={2}
                          className={`retro-input w-full resize-none text-sm ${!editingAbout ? 'bg-gray-50' : ''}`}
                          value={aboutData?.mission || ''}
                          onChange={(e) => setAboutData({ ...aboutData, mission: e.target.value })}
                          disabled={!editingAbout}
                          placeholder="Our mission statement..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="retro-window">
                    <div className="retro-titlebar retro-titlebar-teal p-3">
                      <h3 className="retro-title text-base">Vision</h3>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold retro-text">Title</label>
                        <input
                          type="text"
                          className={`retro-input w-full text-sm py-2 ${!editingAbout ? 'bg-gray-50' : ''}`}
                          value={aboutData?.vision_title || 'OUR VISION'}
                          onChange={(e) => setAboutData({ ...aboutData, vision_title: e.target.value })}
                          disabled={!editingAbout}
                          placeholder="OUR VISION"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold retro-text">Content</label>
                        <textarea
                          rows={2}
                          className={`retro-input w-full resize-none text-sm ${!editingAbout ? 'bg-gray-50' : ''}`}
                          value={aboutData?.vision || ''}
                          onChange={(e) => setAboutData({ ...aboutData, vision: e.target.value })}
                          disabled={!editingAbout}
                          placeholder="Our vision statement..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Story & Impact */}
                <div className="retro-window">
                  <div className="retro-titlebar retro-titlebar-mustard p-3">
                    <h3 className="retro-title text-base">Our Story & Impact</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold retro-text">Story Title</label>
                        <input
                          type="text"
                          className={`retro-input w-full text-sm py-2 ${!editingAbout ? 'bg-gray-50' : ''}`}
                          value={aboutData?.story_title || 'OUR STORY'}
                          onChange={(e) => setAboutData({ ...aboutData, story_title: e.target.value })}
                          disabled={!editingAbout}
                          placeholder="OUR STORY"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold retro-text">Impact Title</label>
                        <input
                          type="text"
                          className={`retro-input w-full text-sm py-2 ${!editingAbout ? 'bg-gray-50' : ''}`}
                          value={aboutData?.impact_title || 'OUR IMPACT'}
                          onChange={(e) => setAboutData({ ...aboutData, impact_title: e.target.value })}
                          disabled={!editingAbout}
                          placeholder="OUR IMPACT"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold retro-text">Our Story</label>
                      <textarea
                        rows={1}
                        className={`retro-input w-full resize-none text-sm ${!editingAbout ? 'bg-gray-50' : ''}`}
                        value={aboutData?.our_story || ''}
                        onChange={(e) => setAboutData({ ...aboutData, our_story: e.target.value })}
                        disabled={!editingAbout}
                        placeholder="Tell your story..."
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold retro-text">Our Impact</label>
                      <textarea
                        rows={1}
                        className={`retro-input w-full resize-none text-sm ${!editingAbout ? 'bg-gray-50' : ''}`}
                        value={aboutData?.our_impact || ''}
                        onChange={(e) => setAboutData({ ...aboutData, our_impact: e.target.value })}
                        disabled={!editingAbout}
                        placeholder="Describe your impact..."
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="retro-window">
                  <div className="retro-titlebar retro-titlebar-coral p-3">
                    <h3 className="retro-title text-base">Contact Information</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold retro-text">Email</label>
                        <input
                          type="email"
                          className={`retro-input w-full text-sm py-2 ${!editingAbout ? 'bg-gray-50' : ''}`}
                          value={aboutData?.contact_email || ''}
                          onChange={(e) => setAboutData({ ...aboutData, contact_email: e.target.value })}
                          disabled={!editingAbout}
                          placeholder="contact@kebele.com"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold retro-text">Phone</label>
                        <input
                          type="tel"
                          className={`retro-input w-full text-sm py-2 ${!editingAbout ? 'bg-gray-50' : ''}`}
                          value={aboutData?.contact_phone || ''}
                          onChange={(e) => setAboutData({ ...aboutData, contact_phone: e.target.value })}
                          disabled={!editingAbout}
                          placeholder="+251 XXX XXX XXX"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold retro-text">Address</label>
                      <textarea
                        rows={1}
                        className={`retro-input w-full resize-none text-sm ${!editingAbout ? 'bg-gray-50' : ''}`}
                        value={aboutData?.contact_address || ''}
                        onChange={(e) => setAboutData({ ...aboutData, contact_address: e.target.value })}
                        disabled={!editingAbout}
                        placeholder="Physical address"
                      />
                    </div>
                  </div>
                </div>

                {/* Team Management */}
                <div className="retro-window">
                  <div className="retro-titlebar retro-titlebar-teal p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="retro-title text-lg">Team Members</h3>
                      <button
                        onClick={() => setShowTeamForm(true)}
                        className="retro-btn px-4 py-2 flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4 retro-icon" />
                        <span>Add Member</span>
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="retro-spinner w-8 h-8 mx-auto mb-4"></div>
                        <p className="retro-text">Loading team members...</p>
                      </div>
                    ) : teamMembers.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4 retro-icon" />
                        <p className="retro-text text-lg">No team members yet</p>
                        <p className="retro-text text-sm opacity-70">Add your first team member</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {teamMembers.map((member) => (
                          <div key={member.id} className="retro-window retro-hover p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <img
                                  src={member.image_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'}
                                  alt={member.name}
                                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                                />
                                <div>
                                  <h4 className="retro-title font-bold text-lg">{member.name}</h4>
                                  <p className="retro-text text-sm opacity-80">{member.role}</p>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    setEditingTeamMember(member);
                                    setShowTeamForm(true);
                                  }}
                                  className="retro-btn-secondary p-2"
                                >
                                  <Edit3 className="w-4 h-4 retro-icon" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTeamMember(member.id)}
                                  className="retro-btn-secondary p-2"
                                >
                                  <Trash2 className="w-4 h-4 retro-icon" />
                                </button>
                              </div>
                            </div>
                            <p className="retro-text text-sm opacity-90 line-clamp-2">{member.bio}</p>
                            <div className="flex items-center space-x-4 mt-3 text-xs retro-text opacity-70">
                              {member.linkedin_url && (
                                <span>LinkedIn: {member.linkedin_url}</span>
                              )}
                              {member.twitter_url && (
                                <span>Twitter: {member.twitter_url}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        );

      case 'forum':
        return (
          <div className="space-y-8">
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

            {/* Search and Filter */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mb-8">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Search Posts</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search discussions, topics, or tags..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-base shadow-sm"
                    />
                  </div>
                </div>
                <div className="lg:w-80">
                  <label className="block text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Category</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white text-base shadow-sm"
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
                {forumPosts
                  .filter(post =>
                    (searchTerm === '' ||
                     post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     post.content.toLowerCase().includes(searchTerm.toLowerCase())) &&
                    (filterStatus === '' || post.category === filterStatus)
                  )
                  .map((post) => (
                    <div key={post.id} className="retro-window retro-hover">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 text-xl retro-title mb-2">{post.title}</h3>
                            <div className="flex items-center space-x-6 text-sm retro-text opacity-80 mb-3">
                              <span>💬 {forumComments.filter(c => c.post_id === post.id).length} replies</span>
                              <span>❤️ {post.likes || 0} likes</span>
                              <span>👁️ {post.views || 0} views</span>
                              <span>📅 {new Date(post.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-gray-600 text-base retro-text line-clamp-3">{post.content}</p>
                          </div>
                          <div className="flex space-x-3 ml-6">
                            <button className="retro-btn-secondary p-3">
                              <Edit3 className="w-5 h-5 retro-icon" />
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
                              className="retro-btn-secondary p-3"
                            >
                              <Trash2 className="w-5 h-5 retro-icon" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        );

      case 'games':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="retro-title text-3xl">Games Management</h2>
                <p className="retro-text text-base opacity-80 mt-2">Manage game scores and player statistics</p>
              </div>
              <button
                onClick={() => setShowGameScoreForm(true)}
                className="retro-btn px-6 py-3 flex items-center space-x-2"
              >
                <Plus className="w-5 h-5 retro-icon" />
                <span>Add Score</span>
              </button>
            </div>

            <Modal
              isOpen={showGameScoreForm}
              onClose={() => setShowGameScoreForm(false)}
              title="Add Game Score"
            >
              <form onSubmit={(e) => { e.preventDefault(); handleCreateGameScore(gameScoreFormData); setShowGameScoreForm(false); }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold retro-text">User ID</label>
                    <input
                      type="text"
                      required
                      value={gameScoreFormData.user_id}
                      onChange={(e) => setGameScoreFormData({ ...gameScoreFormData, user_id: e.target.value })}
                      className="retro-input w-full"
                      placeholder="User ID"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold retro-text">Game Type</label>
                    <select
                      value={gameScoreFormData.game_type}
                      onChange={(e) => setGameScoreFormData({ ...gameScoreFormData, game_type: e.target.value })}
                      className="retro-input w-full bg-white"
                    >
                      <option value="checkers">Checkers</option>
                      <option value="marbles">Marbles</option>
                      <option value="pool">Pool 9-Ball</option>
                      <option value="foosball">Foosball</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold retro-text">Score</label>
                    <input
                      type="number"
                      required
                      value={gameScoreFormData.score}
                      onChange={(e) => setGameScoreFormData({ ...gameScoreFormData, score: parseInt(e.target.value) })}
                      className="retro-input w-full"
                      placeholder="Score"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold retro-text">Result</label>
                    <select
                      value={gameScoreFormData.result}
                      onChange={(e) => setGameScoreFormData({ ...gameScoreFormData, result: e.target.value })}
                      className="retro-input w-full bg-white"
                    >
                      <option value="win">Win</option>
                      <option value="loss">Loss</option>
                      <option value="draw">Draw</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t-4 border-mustard">
                  <button
                    type="submit"
                    className="flex-1 retro-btn-success py-3 px-6"
                  >
                    🏆 Add Score
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowGameScoreForm(false); setGameScoreFormData({ user_id: '', game_type: 'checkers', score: 0, result: 'win' }); }}
                    className="retro-btn-secondary py-3 px-6"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </Modal>

            {/* Leaderboard */}
            <div className="retro-window">
              <div className="retro-titlebar retro-titlebar-orange p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center retro-icon">
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="retro-title text-sm">Leaderboard</h3>
                    <p className="retro-text text-xs opacity-80">Top players and their achievements</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {userPoints.slice(0, 10).map((player, index) => (
                    <div key={player.id} className="retro-window retro-hover p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold retro-title">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 retro-title text-lg">{player.user_id}</p>
                            <p className="text-sm text-gray-600 retro-text">Games: {player.games_played}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-orange-600 retro-title text-xl">{player.total_points} pts</p>
                          <p className="text-sm text-gray-500 retro-text">Wins: {player.checkers_wins + player.marbles_wins + (player.pool_wins || 0)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Game Scores */}
            <div className="retro-window">
              <div className="retro-titlebar retro-titlebar-red p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center retro-icon">
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="retro-title text-sm">Recent Game Scores</h3>
                    <p className="retro-text text-xs opacity-80">Latest game activity</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {gameScores.slice(0, 10).map((score) => (
                    <div key={score.id} className="retro-window retro-hover p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold retro-title text-lg ${
                            score.result === 'win' ? 'bg-green-500' :
                            score.result === 'loss' ? 'bg-red-500' : 'bg-yellow-500'
                          }`}>
                            {score.game_type === 'checkers' ? '♟️' :
                             score.game_type === 'marbles' ? '⚪' :
                             score.game_type === 'pool' ? '🎱' :
                             score.game_type === 'foosball' ? '⚽' : '🎮'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 retro-title text-lg">{score.user_id}</p>
                            <p className="text-base text-gray-600 retro-text">
                              {score.game_type} • Score: {score.score} • {new Date(score.played_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className={`retro-badge px-4 py-2 ${
                          score.result === 'win' ? 'bg-green-100 text-green-800' :
                          score.result === 'loss' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {score.result}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Game Point Levels Management */}
            <div className="retro-window">
              <div className="retro-titlebar retro-titlebar-gold p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center retro-icon">
                    <Trophy className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="retro-title text-sm">Game Point Levels & Titles</h3>
                    <p className="retro-text text-xs opacity-80">Customize achievement titles for different point ranges</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { level: 'Bronze', points: '0-99', title: 'Beginner', color: 'bronze' },
                    { level: 'Silver', points: '100-499', title: 'Apprentice', color: 'silver' },
                    { level: 'Gold', points: '500-999', title: 'Skilled Player', color: 'gold' },
                    { level: 'Platinum', points: '1000-2499', title: 'Expert', color: 'platinum' },
                    { level: 'Diamond', points: '2500-4999', title: 'Master', color: 'diamond' },
                    { level: 'Legendary', points: '5000+', title: 'Grandmaster', color: 'legendary' }
                  ].map((tier) => (
                    <div key={tier.level} className="retro-window retro-hover p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                          tier.color === 'bronze' ? 'bg-amber-600' :
                          tier.color === 'silver' ? 'bg-gray-400' :
                          tier.color === 'gold' ? 'bg-yellow-500' :
                          tier.color === 'platinum' ? 'bg-blue-500' :
                          tier.color === 'diamond' ? 'bg-purple-500' :
                          'bg-red-500'
                        }`}>
                          {tier.level.charAt(0)}
                        </div>
                        <span className="retro-text text-xs opacity-70">{tier.points} pts</span>
                      </div>
                      <h4 className="retro-title font-bold mb-2">{tier.title}</h4>
                      <input
                        type="text"
                        defaultValue={tier.title}
                        className="retro-input w-full text-sm py-2"
                        placeholder="Custom title"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t-4 border-mustard">
                  <button className="retro-btn px-8 py-3">
                    Save Level Titles
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'events':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="retro-title text-xl">Events Management</h2>
                <p className="retro-text text-base opacity-80 mt-2">Create and manage community events</p>
              </div>
              <button
                onClick={() => setShowEventForm(true)}
                className="retro-btn px-6 py-3 flex items-center space-x-2"
              >
                <Plus className="w-5 h-5 retro-icon" />
                <span>Add Event</span>
              </button>
            </div>

            <Modal
              isOpen={showEventForm}
              onClose={() => setShowEventForm(false)}
              title="Create New Event"
            >
              <EventForm
                onSubmit={(data) => {
                  handleCreateEvent(data);
                  setShowEventForm(false);
                }}
                onCancel={() => setShowEventForm(false)}
              />
            </Modal>

            {loading ? (
              <div className="retro-window text-center py-16">
                <div className="retro-spinner w-16 h-16 mx-auto mb-6"></div>
                <p className="retro-text text-lg">Loading events...</p>
              </div>
            ) : events.length === 0 ? (
              <div className="retro-window text-center py-16">
                <Calendar className="w-20 h-20 text-gray-300 mx-auto mb-6 retro-icon" />
                <p className="retro-text text-xl">No events found</p>
                <p className="retro-text text-base opacity-70 mt-3">Create your first event to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {events.map((event) => (
                  <div key={event.id} className="retro-window retro-hover">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md retro-icon">
                          <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex space-x-2">
                          <button className="retro-btn-secondary p-2">
                            <Edit3 className="w-4 h-4 retro-icon" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="retro-btn-secondary p-2"
                          >
                            <Trash2 className="w-4 h-4 retro-icon" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-xl retro-title mb-3">{event.title}</h3>
                        <p className="text-gray-600 text-base retro-text mb-4 line-clamp-3">{event.description}</p>
                        <div className="space-y-2">
                          <div className="flex items-center text-sm retro-text opacity-80">
                            <span className="font-medium">📅 {new Date(event.start_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center text-sm retro-text opacity-80">
                            <span className="font-medium">📍 {event.location?.venue || 'TBD'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'transactions':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="retro-title text-3xl">Transaction Management</h2>
                <p className="retro-text text-base opacity-80 mt-2">Monitor payments and revenue</p>
              </div>
            </div>

            {/* Transaction Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="retro-window retro-hover">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md retro-icon">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-green-600 retro-title">{transactions.filter(t => t.status === 'completed').length}</p>
                      <p className="text-sm text-gray-500 uppercase tracking-wide retro-text">Completed</p>
                    </div>
                  </div>
                  <div className="retro-progress">
                    <div className="retro-progress-fill bg-green-500" style={{width: '85%'}}></div>
                  </div>
                </div>
              </div>
              <div className="retro-window retro-hover">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md retro-icon">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-yellow-600 retro-title">{transactions.filter(t => t.status === 'pending').length}</p>
                      <p className="text-sm text-gray-500 uppercase tracking-wide retro-text">Pending</p>
                    </div>
                  </div>
                  <div className="retro-progress">
                    <div className="retro-progress-fill bg-yellow-500" style={{width: '65%'}}></div>
                  </div>
                </div>
              </div>
              <div className="retro-window retro-hover">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md retro-icon">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-blue-600 retro-title">
                        ${transactions.reduce((sum, t) => sum + (t.status === 'completed' ? parseFloat(t.amount || '0') : 0), 0).toFixed(0)}K
                      </p>
                      <p className="text-sm text-gray-500 uppercase tracking-wide retro-text">Revenue</p>
                    </div>
                  </div>
                  <div className="retro-progress">
                    <div className="retro-progress-fill bg-blue-500" style={{width: '75%'}}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="retro-window">
              <div className="retro-titlebar retro-titlebar-blue p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center retro-icon">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="retro-title text-xl">Recent Transactions</h3>
                    <p className="retro-text text-base opacity-80">Payment activity overview</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="retro-spinner w-16 h-16 mx-auto mb-6"></div>
                    <p className="retro-text text-lg">Loading transactions...</p>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="w-20 h-20 text-gray-300 mx-auto mb-6 retro-icon" />
                    <p className="retro-text text-xl">No transactions found</p>
                    <p className="retro-text text-base opacity-70 mt-3">Transactions will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="retro-window retro-hover p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-6">
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-md retro-icon ${
                              transaction.status === 'completed' ? 'bg-green-100' :
                              transaction.status === 'pending' ? 'bg-yellow-100' : 'bg-red-100'
                            }`}>
                              <CreditCard className={`w-7 h-7 ${
                                transaction.status === 'completed' ? 'text-green-600' :
                                transaction.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                              }`} />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 text-xl retro-title">
                                ${transaction.amount} {transaction.currency}
                              </h4>
                              <p className="text-base text-gray-600 retro-text">
                                {transaction.payment_method || 'Unknown method'} • {new Date(transaction.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className={`retro-badge px-4 py-2 ${
                              transaction.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : transaction.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : transaction.status === 'failed'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {transaction.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'souq':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="retro-title text-3xl">Souq Management</h2>
                <p className="retro-text text-base opacity-80 mt-2">Manage your marketplace products</p>
              </div>
              <button
                onClick={() => setShowProductForm(true)}
                className="retro-btn px-6 py-3 flex items-center space-x-2"
              >
                <Plus className="w-5 h-5 retro-icon" />
                <span>Add Product</span>
              </button>
            </div>


            {loading ? (
              <div className="retro-window text-center py-16">
                <div className="retro-spinner w-16 h-16 mx-auto mb-6"></div>
                <p className="retro-text text-lg">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="retro-window text-center py-16">
                <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-6 retro-icon" />
                <p className="retro-text text-xl">No products found</p>
                <p className="retro-text text-base opacity-70 mt-3">Create your first product to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="retro-window retro-hover">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md retro-icon">
                          <ShoppingBag className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditingItem(product);
                              setShowProductForm(true);
                            }}
                            className="retro-btn-secondary p-2"
                          >
                            <Edit3 className="w-4 h-4 retro-icon" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="retro-btn-secondary p-2"
                          >
                            <Trash2 className="w-4 h-4 retro-icon" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-xl retro-title mb-3">{product.name}</h3>
                        <p className="text-gray-600 text-base retro-text mb-4 line-clamp-3">{product.description}</p>
                        <div className="space-y-2">
                          <div className="flex items-center text-sm retro-text opacity-80">
                            <span className="font-medium">${product.price}</span>
                          </div>
                          <div className="flex items-center text-sm retro-text opacity-80">
                            <span className="font-medium">Stock: {product.stock_quantity}</span>
                          </div>
                          <div className="flex items-center text-sm retro-text opacity-80">
                            <span className="font-medium">Category: {product.category}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="retro-title text-xl">Radio Management</h2>
                <p className="retro-text text-base opacity-80 mt-2">Manage your radio tracks and playlist</p>
              </div>
              <button
                onClick={() => setShowRadioForm(true)}
                className="retro-btn px-6 py-3 flex items-center space-x-2"
              >
                <Plus className="w-5 h-5 retro-icon" />
                <span>Add Track</span>
              </button>
            </div>

            <Modal
              isOpen={showRadioForm}
              onClose={() => setShowRadioForm(false)}
              title="Add New YouTube Video"
            >
              <form onSubmit={(e) => { e.preventDefault(); handleCreateRadioTrack(radioFormData); setShowRadioForm(false); }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold retro-text">Title</label>
                    <input
                      type="text"
                      required
                      value={radioFormData.title}
                      onChange={(e) => setRadioFormData({ ...radioFormData, title: e.target.value })}
                      className="retro-input w-full"
                      placeholder="Enter video title"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold retro-text">Category</label>
                    <select
                      value={radioFormData.category}
                      onChange={(e) => setRadioFormData({ ...radioFormData, category: e.target.value })}
                      className="retro-input w-full bg-white"
                    >
                      <option value="music">🎵 Music</option>
                      <option value="culture">🏛️ Culture</option>
                      <option value="religious">⛪ Religious</option>
                      <option value="documentary">🎥 Documentary</option>
                      <option value="entertainment">🎭 Entertainment</option>
                      <option value="education">📚 Education</option>
                      <option value="other">📌 Other</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-semibold retro-text">YouTube Video ID</label>
                  <input
                    type="text"
                    required
                    value={radioFormData.youtube_id}
                    onChange={(e) => setRadioFormData({ ...radioFormData, youtube_id: e.target.value })}
                    className="retro-input w-full"
                    placeholder="e.g., dQw4w9WgXcQ"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-semibold retro-text">Description</label>
                  <textarea
                    rows={2}
                    required
                    value={radioFormData.description}
                    onChange={(e) => setRadioFormData({ ...radioFormData, description: e.target.value })}
                    className="retro-input w-full resize-none"
                    placeholder="Describe the video content"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-semibold retro-text">Tags (optional)</label>
                  <input
                    type="text"
                    value={radioFormData.tags}
                    onChange={(e) => setRadioFormData({ ...radioFormData, tags: e.target.value })}
                    className="retro-input w-full"
                    placeholder="Comma-separated tags"
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={radioFormData.is_featured}
                    onChange={(e) => setRadioFormData({ ...radioFormData, is_featured: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="is_featured" className="text-sm font-semibold retro-text">Mark as Featured</label>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t-4 border-mustard">
                  <button
                    type="submit"
                    className="flex-1 retro-btn-success py-3 px-6"
                  >
                    🎥 Add Video
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowRadioForm(false); setRadioFormData({ title: '', description: '', youtube_id: '', category: 'music', tags: '', is_featured: false }); }}
                    className="retro-btn-secondary py-3 px-6"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </Modal>

            <div className="retro-window">
              <div className="retro-titlebar retro-titlebar-amber p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center retro-icon">
                    <Radio className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="retro-title text-xl">Current Playlist</h3>
                    <p className="retro-text text-base opacity-80">Manage your YouTube videos</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="retro-spinner w-16 h-16 mx-auto mb-6"></div>
                    <p className="retro-text text-lg">Loading videos...</p>
                  </div>
                ) : radioTracks.length === 0 ? (
                  <div className="text-center py-8">
                    <Radio className="w-20 h-20 text-gray-300 mx-auto mb-6 retro-icon" />
                    <p className="retro-text text-xl">No videos found</p>
                    <p className="retro-text text-base opacity-70 mt-3">Add your first YouTube video to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {radioTracks.map((track) => (
                      <div key={track.id} className="retro-window retro-hover p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md retro-icon">
                              <Radio className="w-8 h-8 text-white" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 text-xl retro-title mb-1">{track.title}</h4>
                              <p className="text-base text-gray-600 retro-text">
                                {track.category} • YouTube ID: {track.youtube_id}
                              </p>
                              {track.description && (
                                <p className="text-sm text-gray-500 retro-text mt-1 line-clamp-2">{track.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            {track.is_featured && (
                              <span className="retro-badge px-4 py-2 bg-green-100 text-green-800">Featured</span>
                            )}
                            <button className="retro-btn-secondary p-3">
                              <Edit3 className="w-5 h-5 retro-icon" />
                            </button>
                            <button
                              onClick={() => handleDeleteRadioTrack(track.id)}
                              className="retro-btn-secondary p-3"
                            >
                              <Trash2 className="w-5 h-5 retro-icon" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'gallery':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="retro-title text-3xl">Media Gallery Management</h2>
                <p className="retro-text text-base opacity-80 mt-2">Upload and manage images</p>
              </div>
              <button
                onClick={() => setShowImageUploadModal(true)}
                className="retro-btn px-6 py-3 flex items-center space-x-2"
              >
                <Plus className="w-5 h-5 retro-icon" />
                <span>Upload Image</span>
              </button>
            </div>

            <div className="retro-window">
              <div className="retro-titlebar retro-titlebar-coral p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-coral to-orange-500 rounded-lg flex items-center justify-center retro-icon">
                    <Image className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="retro-title text-sm">Media Library</h3>
                    <p className="retro-text text-xs opacity-80">Manage all uploaded media and images</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {mediaItems.map((image) => (
                    <div key={image.id} className="retro-window retro-hover cursor-pointer">
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={image.media_url}
                          alt={image.alt_text}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <h4 className="retro-title text-sm font-bold truncate">{image.title}</h4>
                        <p className="retro-text text-xs opacity-70 truncate">{image.alt_text}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className={`retro-badge px-2 py-1 text-xs ${
                            image.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {image.status || 'Draft'}
                          </span>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => {
                                setEditingItem(image);
                                setShowImageUploadModal(true);
                              }}
                              className="retro-btn-secondary p-1"
                            >
                              <Edit3 className="w-3 h-3 retro-icon" />
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm('Delete this image?')) {
                                  try {
                                    const { error } = await supabase
                                      .from('media')
                                      .delete()
                                      .eq('id', image.id);
                                    if (error) throw error;
                                    setMediaItems(mediaItems.filter(item => item.id !== image.id));
                                    alert('Image deleted successfully!');
                                  } catch (error) {
                                    console.error('Error deleting image:', error);
                                    alert('Error deleting image');
                                  }
                                }
                              }}
                              className="retro-btn-secondary p-1"
                            >
                              <Trash2 className="w-3 h-3 retro-icon" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {mediaItems.length === 0 && (
                  <div className="text-center py-8">
                    <Image className="w-16 h-16 text-gray-300 mx-auto mb-4 retro-icon" />
                    <p className="retro-text text-lg">No images in gallery</p>
                    <p className="retro-text text-sm opacity-70">Upload your first image to get started</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'media':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="retro-title text-xl">Video Management</h2>
                <p className="retro-text text-base opacity-80 mt-2">Upload and manage videos</p>
              </div>
              <button
                onClick={() => setShowVideoForm(true)}
                className="retro-btn px-6 py-3 flex items-center space-x-2"
              >
                <Plus className="w-5 h-5 retro-icon" />
                <span>Upload Video</span>
              </button>
            </div>

            <Modal
              isOpen={showVideoForm}
              onClose={() => setShowVideoForm(false)}
              title="Add New Video"
            >
              <form onSubmit={(e) => { e.preventDefault(); handleCreateVideo(videoFormData); setShowVideoForm(false); }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold retro-text">Title</label>
                    <input
                      type="text"
                      required
                      value={videoFormData.title}
                      onChange={(e) => setVideoFormData({ ...videoFormData, title: e.target.value })}
                      className="retro-input w-full"
                      placeholder="Enter video title"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold retro-text">Category</label>
                    <select
                      value={videoFormData.category}
                      onChange={(e) => setVideoFormData({ ...videoFormData, category: e.target.value })}
                      className="retro-input w-full bg-white"
                    >
                      <option value="music">🎵 Music</option>
                      <option value="interview">🎙️ Interview</option>
                      <option value="documentary">🎥 Documentary</option>
                      <option value="performance">🎭 Performance</option>
                      <option value="educational">📚 Educational</option>
                      <option value="cultural">🏛️ Cultural</option>
                      <option value="other">📌 Other</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-semibold retro-text">YouTube Video ID</label>
                  <input
                    type="text"
                    required
                    value={videoFormData.youtube_id}
                    onChange={(e) => setVideoFormData({ ...videoFormData, youtube_id: e.target.value })}
                    className="retro-input w-full"
                    placeholder="e.g., dQw4w9WgXcQ"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-semibold retro-text">Description</label>
                  <textarea
                    rows={3}
                    required
                    value={videoFormData.description}
                    onChange={(e) => setVideoFormData({ ...videoFormData, description: e.target.value })}
                    className="retro-input w-full resize-none"
                    placeholder="Describe your video"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t-4 border-mustard">
                  <button
                    type="submit"
                    className="flex-1 retro-btn-success py-3 px-6"
                  >
                    🎥 Add Video
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowVideoForm(false); setVideoFormData({ title: '', description: '', youtube_id: '', category: 'cultural' }); }}
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
                <p className="retro-text text-lg">Loading videos...</p>
              </div>
            ) : videos.length === 0 ? (
              <div className="retro-window text-center py-16">
                <Image className="w-20 h-20 text-gray-300 mx-auto mb-6 retro-icon" />
                <p className="retro-text text-xl">No videos found</p>
                <p className="retro-text text-base opacity-70 mt-3">Upload your first video to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {videos.map((video) => (
                  <div key={video.id} className="retro-window retro-hover">
                    <div className="p-6">
                      <div className="relative mb-6">
                        <img
                          src={video.thumbnail?.url || 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=200&fit=crop'}
                          alt={video.title}
                          className="w-full h-48 object-cover rounded-xl shadow-md"
                        />
                        <div className="absolute top-4 right-4 flex space-x-2">
                          <button className="retro-btn-secondary p-2">
                            <Edit3 className="w-4 h-4 retro-icon" />
                          </button>
                          <button
                            onClick={() => handleDeleteVideo(video.id)}
                            className="retro-btn-secondary p-2"
                          >
                            <Trash2 className="w-4 h-4 retro-icon" />
                          </button>
                        </div>
                      </div>
                      <h4 className="font-bold text-gray-900 text-xl retro-title mb-3">{video.title}</h4>
                      <p className="text-gray-600 text-base retro-text mb-4 line-clamp-3">{video.description}</p>
                      <div className="flex justify-between items-center text-sm retro-text opacity-80">
                        <span>
                          {video.category} • {new Date(video.published_at).toLocaleDateString()}
                        </span>
                        <span>
                          {video.statistics?.viewCount || 0} views
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="retro-title text-3xl">Settings</h2>
              <p className="retro-text text-base opacity-80 mt-2">Configure your platform settings</p>
            </div>

            <div className="retro-window">
              <div className="p-8">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="block text-xl font-semibold retro-text">Site Title</label>
                    <input
                      type="text"
                      className="retro-input w-full text-lg py-4"
                      defaultValue="Kebele Zero"
                      placeholder="Enter site title"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-xl font-semibold retro-text">Site Description</label>
                    <textarea
                      className="retro-input w-full resize-none text-base py-4"
                      rows={4}
                      defaultValue="Empowering Ethiopian communities through culture, commerce, and connection"
                      placeholder="Enter site description"
                    />
                  </div>
                  <div className="space-y-6">
                    <label className="block text-xl font-semibold retro-text">System Settings</label>
                    <div className="retro-window p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900 retro-title text-lg">Maintenance Mode</h4>
                          <p className="retro-text text-base opacity-80 mt-1">Temporarily disable public access to the site</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" id="maintenance" />
                          <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="pt-8 border-t-4 border-mustard">
                    <button className="retro-btn px-8 py-4 text-lg">
                      Save Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

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
        {/* Sidebar */}
        <div className={`fixed top-0 left-0 min-h-screen bg-gradient-to-b from-white via-gray-50 to-white shadow-xl border-r-4 border-charcoal z-50 transition-all duration-500 ease-in-out overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 ${
          sidebarCollapsed ? 'w-20' : 'w-72'
        }`}>
        {/* Header */}
        <div className="p-3 border-b-4 border-charcoal">
          <div className="flex items-center justify-between">
            <div className={`flex items-center space-x-3 ${sidebarCollapsed ? 'justify-center flex-1' : ''}`}>
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center retro-icon shadow-md border-2 border-amber-400">
                <span className="text-white font-bold text-sm retro-title">K</span>
              </div>
              {!sidebarCollapsed && (
                <div>
                  <h1 className="retro-title text-sm font-bold">Admin Panel</h1>
                  <p className="retro-text text-xs opacity-80">Kebele Zero</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="retro-btn p-2 cursor-pointer hover:scale-110 transition-transform ml-2"
              title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              <PanelLeftClose className={`w-4 h-4 retro-icon transition-transform duration-300 ${
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
                  <Icon className={`retro-icon ${sidebarCollapsed ? 'w-5 h-5' : 'w-4 h-4'} ${
                    activeTab === tab.id ? 'text-white' : 'text-gray-700'
                  }`} />
                  {!sidebarCollapsed && (
                    <span className={`text-sm font-medium ${activeTab === tab.id ? 'text-white' : 'retro-text'}`}>{tab.label}</span>
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
                  <Icon className={`retro-icon ${sidebarCollapsed ? 'w-5 h-5' : 'w-4 h-4'} ${
                    activeTab === tab.id ? 'text-white' : 'text-gray-700'
                  }`} />
                  {!sidebarCollapsed && (
                    <span className={`text-sm font-medium ${activeTab === tab.id ? 'text-white' : 'retro-text'}`}>{tab.label}</span>
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
                  <Icon className={`retro-icon ${sidebarCollapsed ? 'w-5 h-5' : 'w-4 h-4'} ${
                    activeTab === tab.id ? 'text-white' : 'text-gray-700'
                  }`} />
                  {!sidebarCollapsed && (
                    <span className={`text-sm font-medium ${activeTab === tab.id ? 'text-white' : 'retro-text'}`}>{tab.label}</span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className="p-2 border-t-4 border-charcoal mt-auto">
          <button
            onClick={() => navigate('/')}
            className={`flex items-center space-x-2 px-3 py-3 retro-btn-secondary text-sm mb-1 cursor-pointer hover:scale-105 transition-transform ${
              sidebarCollapsed ? 'justify-center px-2 py-3 rounded-full' : 'w-full'
            }`}
            title={sidebarCollapsed ? 'Back to Site' : ''}
          >
            <ArrowLeft className={`retro-icon ${sidebarCollapsed ? 'w-4 h-4' : 'w-4 h-4'}`} />
            {!sidebarCollapsed && <span>Back to Site</span>}
          </button>
          <button
            onClick={handleLogout}
            className={`flex items-center space-x-2 px-3 py-3 retro-btn-secondary text-sm cursor-pointer hover:scale-105 transition-transform ${
              sidebarCollapsed ? 'justify-center px-2 py-3 rounded-full' : 'w-full'
            }`}
            title={sidebarCollapsed ? 'Logout' : ''}
          >
            <LogOut className={`retro-icon ${sidebarCollapsed ? 'w-4 h-4' : 'w-4 h-4'}`} />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex flex-col min-h-screen transition-all duration-500 ease-in-out ${
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
  );
};

export default AdminDashboard;
