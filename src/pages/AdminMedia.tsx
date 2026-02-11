import React, { useState, useEffect } from 'react';
import { Image, Plus, Trash2, Search, Play, Eye, Folder, Edit3 } from 'lucide-react';
import { supabase } from '../services/supabase';
import Modal from '../components/Modal';

const AdminMedia = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
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

  const filteredVideos = videos.filter(video => {
    const matchesSearch = !searchTerm || 
      video.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || video.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredVideos.length / itemsPerPage);
  const paginatedVideos = filteredVideos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory]);

  const categories = ['music', 'interview', 'documentary', 'performance', 'educational', 'cultural', 'other'];

  const getYouTubeThumbnail = (id: string) => `https://img.youtube.com/vi/${id}/mqdefault.jpg`;

  // Simple loading spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between px-6 py-4 border-b-4 border-black bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-2 border-black shadow-lg">
              <Image className="w-7 h-7 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Video Management</h1>
              <p className="text-sm text-blue-100 font-bold uppercase">Upload and manage videos</p>
            </div>
          </div>
          <button
            onClick={() => setShowVideoForm(true)}
            className="retro-btn px-4 py-2 bg-white text-black"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Upload Video
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-5 text-center">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-4 border-black mx-auto mb-3">
              <Play className="w-6 h-6 text-black" />
            </div>
            <p className="text-3xl font-black text-gray-900 retro-title">{videos.length}</p>
            <p className="text-sm font-bold text-gray-700 uppercase tracking-wide retro-text">Total Videos</p>
          </div>
        </div>
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-5 text-center">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-4 border-black mx-auto mb-3">
              <Play className="w-6 h-6 text-black" />
            </div>
            <p className="text-3xl font-black text-gray-900 retro-title">
              {videos.filter(v => v.published_at && new Date(v.published_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
            </p>
            <p className="text-sm font-bold text-gray-700 uppercase tracking-wide retro-text">This Week</p>
          </div>
        </div>
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-5 text-center">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-4 border-black mx-auto mb-3">
              <Eye className="w-6 h-6 text-black" />
            </div>
            <p className="text-3xl font-black text-gray-900 retro-title">
              {videos.reduce((sum, v) => sum + (v.statistics?.viewCount || 0), 0)}
            </p>
            <p className="text-sm font-bold text-gray-700 uppercase tracking-wide retro-text">Total Views</p>
          </div>
        </div>
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-5 text-center">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-4 border-black mx-auto mb-3">
              <Folder className="w-6 h-6 text-black" />
            </div>
            <p className="text-3xl font-black text-gray-900 retro-title">{categories.length}</p>
            <p className="text-sm font-bold text-gray-700 uppercase tracking-wide retro-text">Categories</p>
          </div>
        </div>
      </div>

      {/* Search & Filter - Retro Card */}
      <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="retro-input pl-10"
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

      {/* Videos Grid */}
      {filteredVideos.length === 0 ? (
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-12 text-center">
          <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="retro-title text-xl">No videos found</p>
          <p className="retro-text text-sm mt-1">Upload your first video to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {paginatedVideos.map((video) => (
            <div key={video.id} className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-shadow">
              {/* Video Thumbnail */}
              <div className="relative h-48 bg-gray-900">
                <img
                  src={video.thumbnail?.url || (video.youtube_id ? getYouTubeThumbnail(video.youtube_id) : '')}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="w-16 h-16 bg-white border-4 border-black flex items-center justify-center">
                    <Play className="w-8 h-8 text-gray-800 ml-1" />
                  </div>
                </div>
                <div className="absolute top-3 right-3 flex space-x-2">
                  <button className="p-2 bg-white border-2 border-black hover:bg-gray-100 transition-colors">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteVideo(video.id)}
                    className="p-2 bg-white border-2 border-black hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
              
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-gray-800 text-lg flex-1 pr-4 uppercase tracking-wide">{video.title}</h3>
                  <span className="inline-flex items-center px-2.5 py-1 bg-blue-100 border-2 border-black text-xs font-bold uppercase shrink-0">
                    {video.category || 'Other'}
                  </span>
                </div>
                
                <p className="retro-text text-sm mb-4">{video.description}</p>
                
                <div className="flex items-center justify-between text-sm retro-text">
                  <span>{video.published_at ? new Date(video.published_at).toLocaleDateString() : ''}</span>
                  <span className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{video.statistics?.viewCount || 0} views</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal - Retro Style */}
      <Modal
        isOpen={showVideoForm}
        onClose={() => setShowVideoForm(false)}
        title="Add New Video"
        size="md"
        icon={<Image className="w-5 h-5 text-blue-500" />}
        titleColor="from-blue-500 to-indigo-500"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleCreateVideo(videoFormData); setShowVideoForm(false); }} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Title</label>
              <input
                type="text"
                required
                value={videoFormData.title}
                onChange={(e) => setVideoFormData({ ...videoFormData, title: e.target.value })}
                className="retro-input"
                placeholder="Enter video title"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Category</label>
              <select
                value={videoFormData.category}
                onChange={(e) => setVideoFormData({ ...videoFormData, category: e.target.value })}
                className="retro-input"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">YouTube Video ID</label>
            <input
              type="text"
              required
              value={videoFormData.youtube_id}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVideoFormData({ ...videoFormData, youtube_id: e.target.value })}
              className="retro-input"
              placeholder="e.g., dQw4w9WgXcQ"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Description</label>
            <textarea
              rows={3}
              required
              value={videoFormData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setVideoFormData({ ...videoFormData, description: e.target.value })}
              className="retro-input resize-none"
              placeholder="Describe your video"
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 retro-btn bg-blue-500 border-blue-600"
            >
              Add Video
            </button>
            <button
              type="button"
              onClick={() => { setShowVideoForm(false); setVideoFormData({ title: '', description: '', youtube_id: '', category: 'cultural' }); }}
              className="px-5 py-3 retro-btn"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminMedia;
