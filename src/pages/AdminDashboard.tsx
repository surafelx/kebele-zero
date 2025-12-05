import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, ShoppingBag, Radio, Image, Settings, BarChart3, Edit3, Trash2, Plus, ArrowLeft, Save, X, LogOut, LogIn, CreditCard } from 'lucide-react';
import { supabase } from '../services/supabase';

// Modal Component
const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10002] bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 10002 }}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// Form Components
const EventForm: React.FC<{ onSubmit: (data: any) => void; onCancel: () => void }> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'cultural',
    start_date: '',
    end_date: '',
    location: { venue: '', address: { city: 'Addis Ababa', country: 'Ethiopia' } },
    organizer: { name: '', email: '' }
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
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-xl font-bold text-gray-900">Create New Event</h3>
        <p className="text-sm text-gray-600 mt-1">Fill in the details to add a new event to your platform</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Event Title</label>
            <input
              type="text"
              required
              placeholder="Enter event title"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Category</label>
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
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
          <label className="block text-sm font-semibold text-gray-700">Description</label>
          <textarea
            required
            rows={4}
            placeholder="Describe your event in detail"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Start Date & Time</label>
            <input
              type="datetime-local"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">End Date & Time</label>
            <input
              type="datetime-local"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Venue</label>
            <input
              type="text"
              required
              placeholder="Event location"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              value={formData.location.venue}
              onChange={(e) => setFormData({
                ...formData,
                location: { ...formData.location, venue: e.target.value }
              })}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">City</label>
            <input
              type="text"
              required
              placeholder="City name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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

        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
          >
            🎉 Create Event
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Auth states
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Data states
  const [aboutData, setAboutData] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [radioTracks, setRadioTracks] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingAbout, setEditingAbout] = useState(false);

  // Form states for creating/editing
  const [showEventForm, setShowEventForm] = useState(false);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [showRadioForm, setShowRadioForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form data states
  const [videoFormData, setVideoFormData] = useState({
    title: '',
    description: '',
    youtube_id: '',
    category: 'cultural'
  });
  const [radioFormData, setRadioFormData] = useState({
    title: '',
    artist: '',
    audio_url: '',
    category: 'music'
  });

  // Check authentication and fetch data on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        console.error('Auth error:', error);
        navigate('/admin/login');
        return;
      }

      if (user) {
        setUser(user);
        fetchAllData();
      } else {
        navigate('/admin/login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      navigate('/admin/login');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch about data
      const { data: about, error: aboutError } = await supabase
        .from('about')
        .select('*')
        .eq('is_active', true)
        .single();

      if (aboutError) {
        if (aboutError.code === 'PGRST116') {
          // No active about record found, set to null
          setAboutData(null);
        } else {
          console.error('Error fetching about:', aboutError);
        }
      } else {
        setAboutData(about);
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
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAbout = async () => {
    if (!aboutData) return;

    try {
      const { error } = await supabase
        .from('about')
        .upsert(aboutData);

      if (error) throw error;

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

  // Create functions
  const handleCreateEvent = async (eventData: any) => {
    try {
      // Remove created_by field since user isn't authenticated
      const { created_by, ...eventDataWithoutUser } = eventData;

      const { data, error } = await supabase
        .from('events')
        .insert([eventDataWithoutUser])
        .select();

      if (error) throw error;

      setEvents([...events, data[0]]);
      setShowEventForm(false);
      alert('Event created successfully!');
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
      alert('Video added successfully!');
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
      alert('Track added successfully!');
    } catch (error) {
      console.error('Error creating track:', error);
      alert('Error adding track');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'about', label: 'About Page', icon: Users },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'souq', label: 'Souq', icon: ShoppingBag },
    { id: 'radio', label: 'Radio', icon: Radio },
    { id: 'media', label: 'Media', icon: Image },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Welcome back, Admin! 👋</h2>
                  <p className="text-blue-100">Here's what's happening with your platform today</p>
                </div>
                <div className="hidden md:block">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{events.length * 20}K+</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Total Users</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: '85%'}}></div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{events.length}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Active Events</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: '65%'}}></div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Image className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{videos.length + radioTracks.length}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Media Items</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{width: '90%'}}></div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      ${transactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0).toFixed(0)}K
                    </p>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Revenue</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{width: '75%'}}></div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Recent Events</h3>
                      <p className="text-sm text-gray-600">Latest event activity</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {events.slice(0, 4).length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No events yet</p>
                      <p className="text-sm text-gray-400">Create your first event to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {events.slice(0, 4).map((event) => (
                        <div key={event.id} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                          <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{event.title}</p>
                            <p className="text-xs text-gray-500">
                              📅 {new Date(event.start_date).toLocaleDateString()} • 📍 {event.location?.venue || 'TBD'}
                            </p>
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            Active
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
                      <p className="text-sm text-gray-600">Payment activity overview</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {transactions.slice(0, 4).length === 0 ? (
                    <div className="text-center py-8">
                      <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No transactions yet</p>
                      <p className="text-sm text-gray-400">Transactions will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {transactions.slice(0, 4).map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                              transaction.status === 'completed' ? 'bg-green-500' :
                              transaction.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}></div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                ${transaction.amount} {transaction.currency}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(transaction.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
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

      case 'about':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">About Page</h2>
              {!editingAbout ? (
                <button
                  onClick={() => setEditingAbout(true)}
                  className="px-3 py-1 border border-gray-300 hover:border-gray-400 transition-colors"
                >
                  Edit
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveAbout}
                    className="px-3 py-1 bg-green-500 text-white hover:bg-green-600 transition-colors flex items-center space-x-1"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={() => setEditingAbout(false)}
                    className="px-3 py-1 border border-gray-300 hover:border-gray-400 transition-colors flex items-center space-x-1"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 focus:border-gray-400 focus:outline-none"
                    value={aboutData?.title || ''}
                    onChange={(e) => setAboutData({ ...aboutData, title: e.target.value })}
                    disabled={!editingAbout}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mission</label>
                  <textarea
                    className="w-full p-2 border border-gray-300 focus:border-gray-400 focus:outline-none"
                    rows={3}
                    value={aboutData?.mission || ''}
                    onChange={(e) => setAboutData({ ...aboutData, mission: e.target.value })}
                    disabled={!editingAbout}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vision</label>
                  <textarea
                    className="w-full p-2 border border-gray-300 focus:border-gray-400 focus:outline-none"
                    rows={3}
                    value={aboutData?.vision || ''}
                    onChange={(e) => setAboutData({ ...aboutData, vision: e.target.value })}
                    disabled={!editingAbout}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    className="w-full p-2 border border-gray-300 focus:border-gray-400 focus:outline-none"
                    rows={5}
                    value={aboutData?.content || ''}
                    onChange={(e) => setAboutData({ ...aboutData, content: e.target.value })}
                    disabled={!editingAbout}
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 'events':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Events</h2>
              <button
                onClick={() => setShowEventForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
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
              <div className="text-center py-8">Loading events...</div>
            ) : events.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No events found</div>
            ) : (
              <div className="space-y-2">
                {events.map((event) => (
                  <div key={event.id} className="flex justify-between items-center p-3 border border-gray-200">
                    <div>
                      <div className="font-medium text-gray-900">{event.title}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(event.start_date).toLocaleDateString()} • {event.location?.venue || 'TBD'}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="text-gray-400 hover:text-gray-600">Edit</button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'transactions':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Transaction Management</h2>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
              </div>
              {loading ? (
                <div className="p-6 text-center">Loading transactions...</div>
              ) : transactions.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No transactions found</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {transaction.amount} {transaction.currency}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {transaction.payment_method || 'Unknown method'} • {new Date(transaction.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
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

            {/* Transaction Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="text-2xl font-bold text-green-600">
                  {transactions.filter(t => t.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="text-2xl font-bold text-yellow-600">
                  {transactions.filter(t => t.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="text-2xl font-bold text-blue-600">
                  {transactions.reduce((sum, t) => sum + (t.status === 'completed' ? parseFloat(t.amount) : 0), 0).toFixed(2)} ETB
                </div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
            </div>
          </div>
        );

      case 'souq':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Souq Management</h2>
              <button className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Products</h3>
              </div>
              <div className="divide-y divide-gray-100">
                <div className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=60&h=60&fit=crop" alt="Product" className="w-12 h-12 rounded-lg object-cover" />
                      <div>
                        <h4 className="font-medium text-gray-900">Traditional Coffee Set</h4>
                        <p className="text-sm text-gray-600">$45.00 • 12 in stock</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-gray-400 hover:text-amber-500">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Radio Management</h2>
              <button
                onClick={() => setShowRadioForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Track</span>
              </button>
            </div>

            <Modal
              isOpen={showRadioForm}
              onClose={() => setShowRadioForm(false)}
              title="Add New Radio Track"
            >
              <form onSubmit={(e) => { e.preventDefault(); handleCreateRadioTrack(radioFormData); setShowRadioForm(false); }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      required
                      value={radioFormData.title}
                      onChange={(e) => setRadioFormData({ ...radioFormData, title: e.target.value })}
                      className="w-full p-2 border border-gray-300 focus:border-gray-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Artist</label>
                    <input
                      type="text"
                      value={radioFormData.artist}
                      onChange={(e) => setRadioFormData({ ...radioFormData, artist: e.target.value })}
                      className="w-full p-2 border border-gray-300 focus:border-gray-400 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Audio URL</label>
                  <input
                    type="url"
                    required
                    value={radioFormData.audio_url}
                    onChange={(e) => setRadioFormData({ ...radioFormData, audio_url: e.target.value })}
                    className="w-full p-2 border border-gray-300 focus:border-gray-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={radioFormData.category}
                    onChange={(e) => setRadioFormData({ ...radioFormData, category: e.target.value })}
                    className="w-full p-2 border border-gray-300 focus:border-gray-400 focus:outline-none"
                  >
                    <option value="music">Music</option>
                    <option value="interview">Interview</option>
                    <option value="cultural">Cultural</option>
                    <option value="educational">Educational</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-500 text-white hover:bg-green-600 transition-colors"
                  >
                    Add Track
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowRadioForm(false); setRadioFormData({ title: '', artist: '', audio_url: '', category: 'music' }); }}
                    className="px-4 py-2 border border-gray-300 hover:border-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </Modal>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Current Playlist</h3>
              </div>
              {loading ? (
                <div className="p-6 text-center">Loading tracks...</div>
              ) : radioTracks.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No tracks found</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {radioTracks.map((track) => (
                    <div key={track.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                            <Radio className="w-6 h-6 text-amber-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{track.title}</h4>
                            <p className="text-sm text-gray-600">
                              {track.artist || 'Unknown Artist'} • {track.duration || '0:00'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {track.is_featured && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Featured</span>
                          )}
                          <button className="p-1 text-gray-400 hover:text-amber-500">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRadioTrack(track.id)}
                            className="p-1 text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'media':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Media Gallery Management</h2>
              <button
                onClick={() => setShowVideoForm(true)}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Upload Video</span>
              </button>
            </div>

            <Modal
              isOpen={showVideoForm}
              onClose={() => setShowVideoForm(false)}
              title="Add New Video"
            >
              <form onSubmit={(e) => { e.preventDefault(); handleCreateVideo(videoFormData); setShowVideoForm(false); }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      required
                      value={videoFormData.title}
                      onChange={(e) => setVideoFormData({ ...videoFormData, title: e.target.value })}
                      className="w-full p-2 border border-gray-300 focus:border-gray-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={videoFormData.category}
                      onChange={(e) => setVideoFormData({ ...videoFormData, category: e.target.value })}
                      className="w-full p-2 border border-gray-300 focus:border-gray-400 focus:outline-none"
                    >
                      <option value="music">Music</option>
                      <option value="interview">Interview</option>
                      <option value="documentary">Documentary</option>
                      <option value="performance">Performance</option>
                      <option value="educational">Educational</option>
                      <option value="cultural">Cultural</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">YouTube Video ID</label>
                  <input
                    type="text"
                    required
                    value={videoFormData.youtube_id}
                    onChange={(e) => setVideoFormData({ ...videoFormData, youtube_id: e.target.value })}
                    className="w-full p-2 border border-gray-300 focus:border-gray-400 focus:outline-none"
                    placeholder="e.g., dQw4w9WgXcQ"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    required
                    value={videoFormData.description}
                    onChange={(e) => setVideoFormData({ ...videoFormData, description: e.target.value })}
                    className="w-full p-2 border border-gray-300 focus:border-gray-400 focus:outline-none"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-500 text-white hover:bg-green-600 transition-colors"
                  >
                    Add Video
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowVideoForm(false); setVideoFormData({ title: '', description: '', youtube_id: '', category: 'cultural' }); }}
                    className="px-4 py-2 border border-gray-300 hover:border-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </Modal>

            {loading ? (
              <div className="text-center py-8">Loading videos...</div>
            ) : videos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No videos found</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video) => (
                  <div key={video.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <img
                      src={video.thumbnail?.url || 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=200&fit=crop'}
                      alt={video.title}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <h4 className="font-medium text-gray-900 mb-1">{video.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      {video.category} • {new Date(video.published_at).toLocaleDateString()}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {video.statistics?.viewCount || 0} views
                      </span>
                      <div className="flex space-x-2">
                        <button className="p-1 text-gray-400 hover:text-amber-500">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteVideo(video.id)}
                          className="p-1 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Settings</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site Title</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 focus:border-gray-400 focus:outline-none"
                  defaultValue="Kebele Zero"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site Description</label>
                <textarea
                  className="w-full p-2 border border-gray-300 focus:border-gray-400 focus:outline-none"
                  rows={2}
                  defaultValue="Empowering Ethiopian communities through culture, commerce, and connection"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="maintenance" />
                <label htmlFor="maintenance" className="text-sm text-gray-700">Maintenance Mode</label>
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-red-600">Access denied. Please log in.</p>
          <button
            onClick={() => navigate('/admin/login')}
            className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex" style={{ zIndex: 9999, position: 'relative' }}>
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[10000] bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          style={{ zIndex: 10000 }}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-[10001] w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`} style={{ zIndex: 10001 }}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Kebele</h2>
                <p className="text-sm text-gray-500">Admin Panel</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-4 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border-r-4 border-amber-500 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-amber-600' : 'text-gray-400'}`} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.email}
                </p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Top Navigation Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-[9998]" style={{ zIndex: 9998 }}>
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">
                  {tabs.find(tab => tab.id === activeTab)?.label}
                </h1>
                <p className="text-sm text-gray-500">Manage your content and settings</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                title="Back to main site"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Site</span>
              </button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Content */}
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;