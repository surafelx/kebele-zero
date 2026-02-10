import React, { useState, useEffect } from 'react';
import { Radio, Plus, Edit3, Trash2, Search, Filter, Play, Star, Music, Mic } from 'lucide-react';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Radio Management</h2>
          <p className="text-gray-500 mt-1">Manage your radio tracks and playlist</p>
        </div>
        <button
          onClick={() => setShowRadioForm(true)}
          className="inline-flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Track</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Tracks</p>
              <p className="text-2xl font-bold text-gray-800">{radioTracks.length}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Radio className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Featured</p>
              <p className="text-2xl font-bold text-gray-800">{radioTracks.filter(t => t.is_featured).length}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Music</p>
              <p className="text-2xl font-bold text-gray-800">{radioTracks.filter(t => t.category === 'music').length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Music className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Categories</p>
              <p className="text-2xl font-bold text-gray-800">{categories.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Mic className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tracks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tracks List */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading tracks...</p>
        </div>
      ) : filteredTracks.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <Radio className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-xl font-medium text-gray-800">No tracks found</p>
          <p className="text-gray-500 mt-1">Add your first track to get started</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Playlist</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {paginatedTracks.map((track) => (
              <div key={track.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-gray-800">{track.title}</h4>
                        {track.is_featured && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                            Featured
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{track.category} • {track.youtube_id}</p>
                      {track.description && (
                        <p className="text-sm text-gray-400 line-clamp-1">{track.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Edit3 className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleDeleteRadioTrack(track.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredTracks.length)} of {filteredTracks.length} tracks
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm bg-white border border-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm bg-white border border-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={showRadioForm}
        onClose={() => setShowRadioForm(false)}
        title="Add New YouTube Video"
      >
        <form onSubmit={(e) => { 
          e.preventDefault(); 
          handleCreateRadioTrack(radioFormData); 
          setShowRadioForm(false); 
        }} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                required
                value={radioFormData.title}
                onChange={(e) => setRadioFormData({ ...radioFormData, title: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Enter video title"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={radioFormData.category}
                onChange={(e) => setRadioFormData({ ...radioFormData, category: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">YouTube Video ID</label>
            <input
              type="text"
              required
              value={radioFormData.youtube_id}
              onChange={(e) => setRadioFormData({ ...radioFormData, youtube_id: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="e.g., dQw4w9WgXcQ"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              rows={2}
              value={radioFormData.description}
              onChange={(e) => setRadioFormData({ ...radioFormData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              placeholder="Describe the video content"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Tags (optional)</label>
            <input
              type="text"
              value={radioFormData.tags}
              onChange={(e) => setRadioFormData({ ...radioFormData, tags: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Comma-separated tags"
            />
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="is_featured"
              checked={radioFormData.is_featured}
              onChange={(e) => setRadioFormData({ ...radioFormData, is_featured: e.target.checked })}
              className="w-4 h-4 text-amber-500 bg-gray-100 border-gray-300 rounded focus:ring-amber-500"
            />
            <label htmlFor="is_featured" className="text-sm font-medium text-gray-700">Mark as Featured</label>
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 px-5 rounded-xl font-medium transition-colors"
            >
              Add Video
            </button>
            <button
              type="button"
              onClick={() => { 
                setShowRadioForm(false); 
                setRadioFormData({ title: '', description: '', youtube_id: '', category: 'music', tags: '', is_featured: false }); 
              }}
              className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
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
