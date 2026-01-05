import React, { useState, useEffect } from 'react';
import { Image, Plus, Edit3, Trash2, Search, Filter, Eye, Grid, List, X } from 'lucide-react';
import { supabase } from '../services/supabase';
import Modal from '../components/Modal';

const AdminGallery = () => {
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  // View states
  const [viewMode, setViewMode] = useState<'gallery' | 'list'>('gallery');
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [showMediaDetails, setShowMediaDetails] = useState(false);

  useEffect(() => {
    fetchMediaItems();
  }, []);

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const fetchMediaItems = async () => {
    setLoading(true);
    try {
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
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (id: string) => {
    if (!confirm('Delete this image?')) return;

    try {
      const { error } = await supabase
        .from('media')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMediaItems(mediaItems.filter(item => item.id !== id));
      alert('Image deleted successfully!');
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Error deleting image');
    }
  };

  const handleSaveImage = async (formData: any) => {
    try {
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
      fetchMediaItems();
    } catch (error) {
      console.error('Error saving image:', error);
      alert('Error saving image to database');
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white border-b-4 border-charcoal px-4 py-3 flex justify-between items-center shadow-sm">
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

      {/* Media Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <div className="retro-card retro-hover">
          <div className="p-3 text-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md border-2 border-blue-400 retro-icon mx-auto mb-2">
              <Image className="w-4 h-4 text-white" />
            </div>
            <p className="text-lg font-bold text-blue-900 retro-title">{mediaItems.length}</p>
            <p className="text-xs text-blue-700 uppercase tracking-wide retro-text">Total Images</p>
          </div>
        </div>

        <div className="retro-card retro-hover">
          <div className="p-3 text-center">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md border-2 border-green-400 retro-icon mx-auto mb-2">
              <Eye className="w-4 h-4 text-white" />
            </div>
            <p className="text-lg font-bold text-green-900 retro-title">
              {mediaItems.filter(m => m.status === 'published').length}
            </p>
            <p className="text-xs text-green-700 uppercase tracking-wide retro-text">Published</p>
          </div>
        </div>

        <div className="retro-card retro-hover">
          <div className="p-3 text-center">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-md border-2 border-yellow-400 retro-icon mx-auto mb-2">
              <Edit3 className="w-4 h-4 text-white" />
            </div>
            <p className="text-lg font-bold text-yellow-900 retro-title">
              {mediaItems.filter(m => m.status === 'draft').length}
            </p>
            <p className="text-xs text-yellow-700 uppercase tracking-wide retro-text">Drafts</p>
          </div>
        </div>

        <div className="retro-card retro-hover">
          <div className="p-3 text-center">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md border-2 border-purple-400 retro-icon mx-auto mb-2">
              <Filter className="w-4 h-4 text-white" />
            </div>
            <p className="text-lg font-bold text-purple-900 retro-title">
              {[...new Set(mediaItems.map(m => m.category).filter(Boolean))].length}
            </p>
            <p className="text-xs text-purple-700 uppercase tracking-wide retro-text">Categories</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="retro-window">
        <div className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold retro-text mb-2">Search Images</label>
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
              <label className="block text-sm font-semibold retro-text mb-2">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 bg-white retro-input"
              >
                <option value="">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="retro-window">
        <div className="p-6">
          {(() => {
            const filteredItems = mediaItems.filter(item =>
              (searchTerm === '' ||
               item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
               item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               item.alt_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               (item.tags && item.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())))) &&
              (filterStatus === '' || item.status === filterStatus)
            )

            const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
            const startIndex = (currentPage - 1) * itemsPerPage;
            const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

            return (
              <>
                {/* View Toggle and Count */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setViewMode('gallery')}
                      className={`retro-btn-secondary p-2 ${viewMode === 'gallery' ? 'bg-yellow-500 text-white' : ''}`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`retro-btn-secondary p-2 ${viewMode === 'list' ? 'bg-yellow-500 text-white' : ''}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-sm retro-text">
                    {filteredItems.length} items
                  </div>
                </div>

                {viewMode === 'gallery' ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {paginatedItems.map((image) => (
                      <div key={image.id} className="retro-window retro-hover cursor-pointer" onClick={() => { setSelectedMedia(image); setShowMediaDetails(true); }}>
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
                                onClick={(e) => { e.stopPropagation(); setEditingItem(image); setShowImageUploadModal(true); }}
                                className="retro-btn-secondary p-1"
                              >
                                <Edit3 className="w-3 h-3 retro-icon" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteImage(image.id); }}
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
                ) : (
                  <div className="space-y-2">
                    {paginatedItems.map((image) => (
                      <div key={image.id} className="retro-window retro-hover cursor-pointer" onClick={() => { setSelectedMedia(image); setShowMediaDetails(true); }}>
                        <div className="flex items-center space-x-4 p-4">
                          <img
                            src={image.media_url}
                            alt={image.alt_text}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h4 className="retro-title text-sm font-bold">{image.title}</h4>
                            <p className="retro-text text-xs opacity-70">{image.alt_text}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`retro-badge px-2 py-1 text-xs ${
                                image.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {image.status || 'Draft'}
                              </span>
                              <span className="retro-text text-xs opacity-50">
                                {new Date(image.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); setEditingItem(image); setShowImageUploadModal(true); }}
                              className="retro-btn-secondary p-1"
                            >
                              <Edit3 className="w-3 h-3 retro-icon" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteImage(image.id); }}
                              className="retro-btn-secondary p-1"
                            >
                              <Trash2 className="w-3 h-3 retro-icon" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {filteredItems.length === 0 && (
                  <div className="text-center py-8">
                    <Image className="w-16 h-16 text-gray-300 mx-auto mb-4 retro-icon" />
                    <p className="retro-text text-lg">No images found</p>
                    <p className="retro-text text-sm opacity-70">
                      {searchTerm || filterStatus ? 'Try adjusting your search or filter criteria' : 'Upload your first image to get started'}
                    </p>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-6">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="retro-btn-secondary px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ← Previous
                    </button>

                    <div className="flex space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 rounded retro-btn-secondary ${
                            currentPage === pageNum ? 'bg-yellow-500 text-white' : ''
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="retro-btn-secondary px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>

      {/* Media Details Modal */}
      <Modal
        isOpen={showMediaDetails}
        onClose={() => { setShowMediaDetails(false); setSelectedMedia(null); }}
        title="Media Details"
        size="lg"
      >
        {selectedMedia && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <img
                src={selectedMedia.media_url}
                alt={selectedMedia.alt_text}
                className="max-w-full max-h-96 object-contain rounded-lg"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-sm font-semibold retro-text">Title</label>
                <p className="retro-text">{selectedMedia.title}</p>
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-semibold retro-text">Status</label>
                <span className={`retro-badge px-2 py-1 text-xs ${
                  selectedMedia.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedMedia.status || 'Draft'}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-semibold retro-text">Description</label>
              <p className="retro-text">{selectedMedia.description || 'No description'}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-sm font-semibold retro-text">Alt Text</label>
                <p className="retro-text">{selectedMedia.alt_text}</p>
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-semibold retro-text">Caption</label>
                <p className="retro-text">{selectedMedia.caption || 'No caption'}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-sm font-semibold retro-text">Category</label>
                <p className="retro-text">{selectedMedia.category || 'general'}</p>
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-semibold retro-text">Created</label>
                <p className="retro-text">{new Date(selectedMedia.created_at).toLocaleString()}</p>
              </div>
            </div>
            {selectedMedia.tags && selectedMedia.tags.length > 0 && (
              <div className="space-y-3">
                <label className="block text-sm font-semibold retro-text">Tags</label>
                <div className="flex flex-wrap gap-1">
                  {selectedMedia.tags.map((tag: string, index: number) => (
                    <span key={index} className="retro-badge px-2 py-1 text-xs bg-blue-100 text-blue-800">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-2 pt-4 border-t-4 border-mustard">
              <button
                onClick={() => { setEditingItem(selectedMedia); setShowImageUploadModal(true); setShowMediaDetails(false); }}
                className="retro-btn px-4 py-2"
              >
                Edit
              </button>
              <button
                onClick={() => { setShowMediaDetails(false); setSelectedMedia(null); }}
                className="retro-btn-secondary px-4 py-2"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Image Upload Modal */}
      <Modal
        isOpen={showImageUploadModal}
        onClose={() => {
          setShowImageUploadModal(false);
          setEditingItem(null);
        }}
        title={editingItem ? "Edit Image" : "Upload New Image"}
        size="lg"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleSaveImage({
          title: '',
          description: '',
          alt_text: '',
          caption: '',
          status: 'draft',
          category: '',
          tags: [],
          media_url: ''
        }); }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-sm font-semibold retro-text">Title *</label>
              <input
                type="text"
                required
                className="retro-input w-full"
                placeholder="Image title"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-semibold retro-text">Status</label>
              <select className="retro-input w-full bg-white">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold retro-text">Description</label>
            <textarea
              rows={2}
              className="retro-input w-full resize-none"
              placeholder="Image description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-sm font-semibold retro-text">Alt Text</label>
              <input
                type="text"
                className="retro-input w-full"
                placeholder="Alt text for accessibility"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-semibold retro-text">Caption</label>
              <input
                type="text"
                className="retro-input w-full"
                placeholder="Image caption"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold retro-text">Category</label>
            <input
              type="text"
              className="retro-input w-full"
              placeholder="e.g., about, events, team, general"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold retro-text">Tags</label>
            <input
              type="text"
              className="retro-input w-full"
              placeholder="Comma-separated tags"
            />
          </div>

          {/* Image Upload component would go here */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold retro-text">Image File</label>
            <input
              type="file"
              accept="image/*"
              className="retro-input w-full"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t-4 border-mustard">
            <button
              type="submit"
              className="flex-1 retro-btn-success py-3 px-6"
            >
              📸 {editingItem ? 'Update' : 'Upload'} Image
            </button>
            <button
              type="button"
              onClick={() => {
                setShowImageUploadModal(false);
                setEditingItem(null);
              }}
              className="retro-btn-secondary py-3 px-6"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminGallery;