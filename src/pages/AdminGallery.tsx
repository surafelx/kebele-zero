import React, { useState, useEffect, useRef } from 'react';
import { Image, Plus, Edit3, Trash2, Search, Filter, Eye, Grid, List, X, Upload, CheckCircle } from 'lucide-react';
import { supabase } from '../services/supabase';
import Modal from '../components/Modal';

const AdminGallery = () => {
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    alt_text: '',
    caption: '',
    status: 'draft',
    category: '',
    tags: [] as string[],
    media_url: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Computed values
  const filteredItems = mediaItems.filter(item =>
    (searchTerm === '' ||
     item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     item.alt_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     (item.tags && item.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())))) &&
    (filterStatus === '' || item.status === filterStatus)
  );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const publishedCount = mediaItems.filter(m => m.status === 'published').length;
  const draftCount = mediaItems.filter(m => m.status === 'draft').length;
  const categoriesCount = [...new Set(mediaItems.map(m => m.category).filter(Boolean))].length;

  useEffect(() => {
    fetchMediaItems();
  }, []);

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setFormData({ ...formData, media_url: url });
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleSaveImage = async () => {
    if (!formData.title) {
      alert('Please enter a title');
      return;
    }

    if (!formData.media_url) {
      alert('Please upload an image');
      return;
    }

    setUploadProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev === null || prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);

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

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (error) throw error;

      console.log('Image saved to media table:', responseData);
      alert('Image uploaded and saved successfully!');
      
      resetForm();
      setShowImageUploadModal(false);
      setEditingItem(null);
      fetchMediaItems();
    } catch (error) {
      console.error('Error saving image:', error);
      alert('Error saving image to database');
      setUploadProgress(null);
    }
  };

  const resetForm = () => {
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
    setPreviewUrl(null);
    setUploadProgress(null);
  };

  return (
    <div className="space-y-6">
      {/* Header - Retro Style */}
      <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center">
              <Image className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-wide">Media Gallery</h2>
              <p className="text-xs text-white/80 uppercase tracking-wide">Upload and manage images</p>
            </div>
          </div>
          <button
            onClick={() => { resetForm(); setShowImageUploadModal(true); }}
            className="retro-btn px-3 py-1.5 text-sm"
          >
            <Plus className="w-4 h-4 inline mr-1" />
            Upload Image
          </button>
        </div>
      </div>

      {/* Media Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="retro-text text-xs uppercase tracking-wide">Total Images</p>
              <p className="text-2xl retro-title">{mediaItems.length}</p>
            </div>
            <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center">
              <Image className="w-5 h-5 text-black" />
            </div>
          </div>
        </div>

        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="retro-text text-xs uppercase tracking-wide">Published</p>
              <p className="text-2xl retro-title">{publishedCount}</p>
            </div>
            <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center">
              <Eye className="w-5 h-5 text-black" />
            </div>
          </div>
        </div>

        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="retro-text text-xs uppercase tracking-wide">Drafts</p>
              <p className="text-2xl retro-title">{draftCount}</p>
            </div>
            <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center">
              <Edit3 className="w-5 h-5 text-black" />
            </div>
          </div>
        </div>

        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="retro-text text-xs uppercase tracking-wide">Categories</p>
              <p className="text-2xl retro-title">{categoriesCount}</p>
            </div>
            <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center">
              <Filter className="w-5 h-5 text-black" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
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

      <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="p-6">
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

          {loading ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto mb-6"></div>
              <p className="retro-text">Loading images...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8">
              <Image className="w-16 h-16 text-gray-300 mx-auto mb-4 retro-icon" />
              <p className="retro-text text-lg">No images found</p>
              <p className="retro-text text-sm opacity-70">
                {searchTerm || filterStatus ? 'Try adjusting your search or filter criteria' : 'Upload your first image to get started'}
              </p>
            </div>
          ) : (
            <>
              {viewMode === 'gallery' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {paginatedItems.map((image) => (
                    <div key={image.id} className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden cursor-pointer hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all" onClick={() => { setSelectedMedia(image); setShowMediaDetails(true); }}>
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
                    <div key={image.id} className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 cursor-pointer hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all" onClick={() => { setSelectedMedia(image); setShowMediaDetails(true); }}>
                      <div className="flex items-center space-x-4">
                        <img
                          src={image.media_url}
                          alt={image.alt_text}
                          className="w-16 h-16 object-cover border-2 border-black"
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-6">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="retro-btn-secondary px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
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
                className="max-w-full max-h-96 object-contain border-4 border-black"
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

      {/* Image Upload Modal with Drag & Drop */}
      <Modal
        isOpen={showImageUploadModal}
        onClose={() => {
          setShowImageUploadModal(false);
          setEditingItem(null);
          resetForm();
        }}
        title={editingItem ? "Edit Image" : "Upload New Image"}
        size="lg"
      >
        <div className="space-y-6">
          {/* Drag & Drop Area */}
          <div
            className={`border-4 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
              isDragging 
                ? 'border-purple-500 bg-purple-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />
            
            {previewUrl ? (
              <div className="space-y-4">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full max-h-64 mx-auto object-contain border-4 border-black rounded-lg"
                />
                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <CheckCircle className="w-6 h-6" />
                  <span className="font-bold retro-text">Image selected - click to change</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center border-2 border-black">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <p className="retro-title text-lg font-bold">Drag & drop your image here</p>
                  <p className="retro-text text-sm opacity-70 mt-1">or click to browse files</p>
                </div>
                <p className="text-xs text-gray-400 retro-text">Supports JPG, PNG, GIF, WebP</p>
              </div>
            )}
          </div>

          {uploadProgress !== null && (
            <div className="space-y-2">
              <div className="flex justify-between retro-text text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 border-2 border-black">
                <div 
                  className="bg-green-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-sm font-semibold retro-text">Title *</label>
              <input
                type="text"
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

          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t-4 border-mustard">
            <button
              onClick={handleSaveImage}
              disabled={uploadProgress !== null}
              className="flex-1 retro-btn-success py-3 px-6 disabled:opacity-50"
            >
              📸 {editingItem ? 'Update' : 'Upload'} Image
            </button>
            <button
              type="button"
              onClick={() => {
                setShowImageUploadModal(false);
                setEditingItem(null);
                resetForm();
              }}
              className="retro-btn-secondary py-3 px-6"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminGallery;
