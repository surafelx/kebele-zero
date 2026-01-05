import React, { useState, useEffect } from 'react';
import { Image, Plus, Edit3, Trash2, Search, Filter } from 'lucide-react';
import { supabase } from '../services/supabase';
import Modal from '../components/Modal';

const AdminMedia = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [videoFormData, setVideoFormData] = useState({
    title: '',
    description: '',
    youtube_id: '',
    category: 'cultural'
  });

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (videosError) {
        console.error('Error fetching videos:', videosError);
      } else {
        setVideos(videosData || []);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
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
      fetchVideos();
    } catch (error) {
      console.error('Error creating video:', error);
      alert('Error adding video');
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

  return (
    <div className="space-y-8">
      <div className="bg-white border-b-4 border-charcoal px-4 py-3 flex justify-between items-center shadow-sm">
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

      {/* Media Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <div className="retro-card retro-hover">
          <div className="p-3 text-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md border-2 border-blue-400 retro-icon mx-auto mb-2">
              <Image className="w-4 h-4 text-white" />
            </div>
            <p className="text-lg font-bold text-blue-900 retro-title">{videos.length}</p>
            <p className="text-xs text-blue-700 uppercase tracking-wide retro-text">Total Videos</p>
          </div>
        </div>

        <div className="retro-card retro-hover">
          <div className="p-3 text-center">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md border-2 border-green-400 retro-icon mx-auto mb-2">
              <Image className="w-4 h-4 text-white" />
            </div>
            <p className="text-lg font-bold text-green-900 retro-title">
              {videos.filter(v => new Date(v.published_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
            </p>
            <p className="text-xs text-green-700 uppercase tracking-wide retro-text">This Week</p>
          </div>
        </div>

        <div className="retro-card retro-hover">
          <div className="p-3 text-center">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md border-2 border-purple-400 retro-icon mx-auto mb-2">
              <span className="text-white font-bold text-sm">👁️</span>
            </div>
            <p className="text-lg font-bold text-purple-900 retro-title">
              {videos.reduce((sum, v) => sum + (v.statistics?.viewCount || 0), 0)}
            </p>
            <p className="text-xs text-purple-700 uppercase tracking-wide retro-text">Total Views</p>
          </div>
        </div>

        <div className="retro-card retro-hover">
          <div className="p-3 text-center">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md border-2 border-orange-400 retro-icon mx-auto mb-2">
              <span className="text-white font-bold text-sm">📂</span>
            </div>
            <p className="text-lg font-bold text-orange-900 retro-title">
              {[...new Set(videos.map(v => v.category))].length}
            </p>
            <p className="text-xs text-orange-700 uppercase tracking-wide retro-text">Categories</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="retro-window">
        <div className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold retro-text mb-2">Search Videos</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by title, description, or category..."
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
        </div>
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

      {(() => {
        if (loading) {
          return (
            <div className="retro-window text-center py-16">
              <div className="retro-spinner w-16 h-16 mx-auto mb-6"></div>
              <p className="retro-text text-lg">Loading videos...</p>
            </div>
          );
        }

        const filteredVideos = videos.filter(video =>
          (searchTerm === '' ||
            video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            video.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
          (filterStatus === '' || video.category === filterStatus)
        );

        if (filteredVideos.length === 0) {
          return (
            <div className="retro-window text-center py-16">
              <Image className="w-20 h-20 text-gray-300 mx-auto mb-6 retro-icon" />
              <p className="retro-text text-xl">No videos found</p>
              <p className="retro-text text-base opacity-70 mt-3">Upload your first video to get started</p>
            </div>
          );
        }

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
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
        );
      })()}
    </div>
  );
};

export default AdminMedia;