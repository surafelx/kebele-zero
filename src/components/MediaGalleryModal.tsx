import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Upload, Search } from 'lucide-react';
import { supabase } from '../services/supabase';

interface MediaGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
}

const MediaGalleryModal: React.FC<MediaGalleryModalProps> = ({ isOpen, onClose, onSelectImage }) => {
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

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
        { id: '1', title: 'Hero Image 1', media_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop', category: 'hero' },
        { id: '2', title: 'Hero Image 2', media_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop', category: 'hero' },
        { id: '3', title: 'Hero Image 3', media_url: 'https://images.unsplash.com/photo-1551818255-e9353de8d1b0?w=800&h=600&fit=crop', category: 'hero' },
        { id: '4', title: 'Nature 1', media_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop', category: 'nature' },
        { id: '5', title: 'Nature 2', media_url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=600&fit=crop', category: 'nature' },
        { id: '6', title: 'City 1', media_url: 'https://images.unsplash.com/photo-1449824913929-651196d28772?w=800&h=600&fit=crop', category: 'city' },
        { id: '7', title: 'Abstract 1', media_url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800&h=600&fit=crop', category: 'abstract' },
        { id: '8', title: 'People 1', media_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=800&h=600&fit=crop', category: 'people' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = mediaItems.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(mediaItems.map(item => item.category).filter(Boolean))];

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Retro Window Card */}
      <div 
        className="max-w-5xl w-full bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Retro Title Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b-4 border-black bg-gradient-to-r from-purple-600 to-pink-600">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
              <ImageIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-wide drop-shadow-lg" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                Media Gallery
              </h3>
              <p className="text-xs text-purple-100 font-bold uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                {filteredItems.length} images available
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white border-2 border-black rounded-lg shadow-lg hover:bg-red-500 hover:text-white hover:border-red-500 transition-all active:translate-y-0.5"
          >
            <X className="w-4 h-4 text-black" />
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 bg-gray-100 border-b-4 border-black">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search images..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border-2 border-gray-300 focus:border-purple-500 focus:outline-none transition-all font-medium"
                style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
              />
            </div>
            
            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border-2 border-black ${
                    selectedCategory === category
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                  style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="group relative bg-gray-50 rounded-xl overflow-hidden cursor-pointer border-2 border-black hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                  onClick={() => {
                    onSelectImage(item.media_url);
                    onClose();
                  }}
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={item.media_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                    <p className="font-bold text-sm truncate" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{item.title}</p>
                    {item.category && (
                      <p className="text-xs opacity-80 capitalize font-medium" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{item.category}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-black">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-bold text-gray-800 mb-2 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>No images found</h4>
              <p className="text-gray-500 mb-4 font-medium" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Try adjusting your search or filter criteria</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-bold border-2 border-black hover:bg-purple-200 transition-colors"
                style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t-4 border-black bg-gray-100">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 font-bold uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
              Click on an image to select it
            </p>
            <button
              onClick={() => {
                // TODO: Implement upload functionality
                alert('Upload functionality coming soon!');
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold border-2 border-black hover:from-purple-700 hover:to-pink-700 transition-colors"
              style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
            >
              <Upload className="w-4 h-4" />
              <span>Upload New</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaGalleryModal;
