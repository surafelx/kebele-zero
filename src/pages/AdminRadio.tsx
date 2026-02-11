import React, { useState, useEffect } from 'react';
import { Radio, Plus, Edit3, Trash2, Search, Play, Star, Music, Mic } from 'lucide-react';
import { supabase } from '../services/supabase';
import Modal from '../components/Modal';

const AdminRadio = () => {
  const [radioTracks, setRadioTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showRadioForm, setShowRadioForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [radioFormData, setRadioFormData] = useState({
    title: '',
    description: '',
    youtube_id: '',
    category: 'music',
    tags: '',
    is_featured: false
  });

  useEffect(() => {
    fetchRadioTracks();
  }, []);

  const fetchRadioTracks = async () => {
    setLoading(true);
    try {
      const { data: radioData, error: radioError } = await supabase
        .from('radio')
        .select('*')
        .order('created_at', { ascending: false });

      if (radioError) {
        console.error('Error fetching radio:', radioError);
      } else {
        setRadioTracks(radioData || []);
      }
    } catch (error) {
      console.error('Error fetching radio tracks:', error);
    } finally {
      setLoading(false);
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
      fetchRadioTracks();
    } catch (error) {
      console.error('Error creating track:', error);
      alert('Error adding track');
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

  const filteredTracks = radioTracks.filter(track => {
    const matchesSearch = !searchTerm || 
      track.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || track.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredTracks.length / itemsPerPage);
  const paginatedTracks = filteredTracks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory]);

  const categories = ['music', 'culture', 'religious', 'documentary', 'entertainment', 'education', 'other'];

  // Simple loading spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between px-6 py-4 border-b-4 border-black bg-gradient-to-r from-amber-600 to-orange-600">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-2 border-black shadow-lg">
              <Radio className="w-7 h-7 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Radio Management</h1>
              <p className="text-sm text-amber-100 font-bold uppercase">Manage your radio tracks and playlist</p>
            </div>
          </div>
          <button
            onClick={() => setShowRadioForm(true)}
            className="retro-btn px-4 py-2 bg-white text-black"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Add Track
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-5 text-center">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-4 border-black mx-auto mb-3">
              <Radio className="w-6 h-6 text-black" />
            </div>
            <p className="text-3xl font-black text-gray-900 retro-title">{radioTracks.length}</p>
            <p className="text-sm font-bold text-gray-700 uppercase tracking-wide retro-text">Total Tracks</p>
          </div>
        </div>
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-5 text-center">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-4 border-black mx-auto mb-3">
              <Star className="w-6 h-6 text-black" />
            </div>
            <p className="text-3xl font-black text-gray-900 retro-title">{radioTracks.filter(t => t.is_featured).length}</p>
            <p className="text-sm font-bold text-gray-700 uppercase tracking-wide retro-text">Featured</p>
          </div>
        </div>
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-5 text-center">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-4 border-black mx-auto mb-3">
              <Music className="w-6 h-6 text-black" />
            </div>
            <p className="text-3xl font-black text-gray-900 retro-title">{radioTracks.filter(t => t.category === 'music').length}</p>
            <p className="text-sm font-bold text-gray-700 uppercase tracking-wide retro-text">Music</p>
          </div>
        </div>
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-5 text-center">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-4 border-black mx-auto mb-3">
              <Mic className="w-6 h-6 text-black" />
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
              placeholder="Search tracks..."
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

      {/* Tracks List ->

      {/* Tracks Retro Card */}
      {filteredTracks.length === 0 ? (
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-12 text-center">
          <Radio className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="retro-title text-xl">No tracks found</p>
          <p className="retro-text text-sm mt-1">Add your first track to get started</p>
        </div>
      ) : (
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <div className="p-4 border-b-4 border-black bg-gradient-to-r from-amber-500 to-orange-500">
            <h3 className="font-black text-white uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Playlist</h3>
          </div>
          <div className="divide-y-2 divide-black">
            {paginatedTracks.map((track) => (
              <div key={track.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-black flex items-center justify-center flex-shrink-0">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-gray-800 uppercase tracking-wide">{track.title}</h4>
                        {track.is_featured && (
                          <span className="px-2 py-0.5 bg-yellow-100 border-2 border-black text-xs font-bold uppercase">
                            Featured
                          </span>
                        )}
                      </div>
                      <p className="retro-text text-sm">{track.category} • {track.youtube_id}</p>
                      {track.description && (
                        <p className="retro-text text-sm opacity-70 line-clamp-1">{track.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 bg-white border-2 border-black hover:bg-gray-100 transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRadioTrack(track.id)}
                      className="p-2 bg-white border-2 border-black hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal - Retro Style */}
      <Modal
        isOpen={showRadioForm}
        onClose={() => setShowRadioForm(false)}
        title="Add New YouTube Video"
        size="md"
        icon={<Radio className="w-5 h-5 text-amber-500" />}
        titleColor="from-amber-500 to-orange-500"
      >
        <form onSubmit={(e) => { 
          e.preventDefault(); 
          handleCreateRadioTrack(radioFormData); 
          setShowRadioForm(false); 
        }} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Title</label>
              <input
                type="text"
                required
                value={radioFormData.title}
                onChange={(e) => setRadioFormData({ ...radioFormData, title: e.target.value })}
                className="retro-input"
                placeholder="Enter video title"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Category</label>
              <select
                value={radioFormData.category}
                onChange={(e) => setRadioFormData({ ...radioFormData, category: e.target.value })}
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
              value={radioFormData.youtube_id}
              onChange={(e) => setRadioFormData({ ...radioFormData, youtube_id: e.target.value })}
              className="retro-input"
              placeholder="e.g., dQw4w9WgXcQ"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Description</label>
            <textarea
              rows={2}
              value={radioFormData.description}
              onChange={(e) => setRadioFormData({ ...radioFormData, description: e.target.value })}
              className="retro-input resize-none"
              placeholder="Describe the video content"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Tags (optional)</label>
            <input
              type="text"
              value={radioFormData.tags}
              onChange={(e) => setRadioFormData({ ...radioFormData, tags: e.target.value })}
              className="retro-input"
              placeholder="Comma-separated tags"
            />
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="is_featured"
              checked={radioFormData.is_featured}
              onChange={(e) => setRadioFormData({ ...radioFormData, is_featured: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="is_featured" className="retro-text font-bold uppercase text-sm">Mark as Featured</label>
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 retro-btn bg-amber-500 border-amber-600"
            >
              Add Video
            </button>
            <button
              type="button"
              onClick={() => { 
                setShowRadioForm(false); 
                setRadioFormData({ title: '', description: '', youtube_id: '', category: 'music', tags: '', is_featured: false }); 
              }}
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

export default AdminRadio;
