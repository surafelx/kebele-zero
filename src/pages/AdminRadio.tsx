import React, { useState, useEffect } from 'react';
import { Radio, Plus, Edit3, Trash2, Search, Filter } from 'lucide-react';
import { supabase } from '../services/supabase';
import Modal from '../components/Modal';

const AdminRadio = () => {
  const [radioTracks, setRadioTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showRadioForm, setShowRadioForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
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

  return (
    <div className="space-y-8">
      <div className="bg-white border-b-4 border-charcoal px-4 py-3 flex justify-between items-center shadow-sm">
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

      {/* Radio Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <div className="retro-card retro-hover">
          <div className="p-3 text-center">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center shadow-md border-2 border-amber-400 retro-icon mx-auto mb-2">
              <Radio className="w-4 h-4 text-white" />
            </div>
            <p className="text-lg font-bold text-amber-900 retro-title">{radioTracks.length}</p>
            <p className="text-xs text-amber-700 uppercase tracking-wide retro-text">Total Tracks</p>
          </div>
        </div>

        <div className="retro-card retro-hover">
          <div className="p-3 text-center">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md border-2 border-green-400 retro-icon mx-auto mb-2">
              <Radio className="w-4 h-4 text-white" />
            </div>
            <p className="text-lg font-bold text-green-900 retro-title">
              {radioTracks.filter(t => t.is_featured).length}
            </p>
            <p className="text-xs text-green-700 uppercase tracking-wide retro-text">Featured</p>
          </div>
        </div>

        <div className="retro-card retro-hover">
          <div className="p-3 text-center">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md border-2 border-purple-400 retro-icon mx-auto mb-2">
              <span className="text-white font-bold text-sm">🎵</span>
            </div>
            <p className="text-lg font-bold text-purple-900 retro-title">
              {radioTracks.filter(t => t.category === 'music').length}
            </p>
            <p className="text-xs text-purple-700 uppercase tracking-wide retro-text">Music Tracks</p>
          </div>
        </div>

        <div className="retro-card retro-hover">
          <div className="p-3 text-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md border-2 border-blue-400 retro-icon mx-auto mb-2">
              <span className="text-white font-bold text-sm">📂</span>
            </div>
            <p className="text-lg font-bold text-blue-900 retro-title">
              {[...new Set(radioTracks.map(t => t.category))].length}
            </p>
            <p className="text-xs text-blue-700 uppercase tracking-wide retro-text">Categories</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="retro-window">
        <div className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold retro-text mb-2">Search Tracks</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by title, description, or tags..."
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
                <option value="culture">🏛️ Culture</option>
                <option value="religious">⛪ Religious</option>
                <option value="documentary">🎥 Documentary</option>
                <option value="entertainment">🎭 Entertainment</option>
                <option value="education">📚 Education</option>
                <option value="other">📌 Other</option>
              </select>
            </div>
          </div>
        </div>
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
              {radioTracks.filter(track =>
                (searchTerm === '' ||
                  track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  track.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (track.tags && track.tags.toLowerCase().includes(searchTerm.toLowerCase()))) &&
                (filterStatus === '' || track.category === filterStatus)
              ).map((track) => (
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
};

export default AdminRadio;
