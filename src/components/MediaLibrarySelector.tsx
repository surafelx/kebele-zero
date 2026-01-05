import React, { useState, useEffect } from 'react';
import { Image, Search, X } from 'lucide-react';
import { supabase } from '../services/supabase';
import Modal from './Modal';

interface MediaItem {
  id: string;
  title: string;
  media_url: string;
  alt_text?: string;
  description?: string;
}

interface MediaLibrarySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: MediaItem) => void;
}

const MediaLibrarySelector: React.FC<MediaLibrarySelectorProps> = ({
  isOpen,
  onClose,
  onSelect
}) => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen]);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const { data: mediaData, error: mediaError } = await supabase
        .from('media')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (mediaError) {
        console.error('Error fetching media:', mediaError);
      } else {
        setMedia(mediaData || []);
      }
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMedia = media.filter(item =>
    searchTerm === '' ||
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (item: MediaItem) => {
    onSelect(item);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select from Media Library"
    >
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search media..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 retro-input"
          />
        </div>

        {/* Media Grid */}
        {loading ? (
          <div className="text-center py-8">
            <div className="retro-spinner w-8 h-8 mx-auto mb-4"></div>
            <p className="retro-text">Loading media...</p>
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="text-center py-8">
            <Image className="w-12 h-12 text-gray-300 mx-auto mb-4 retro-icon" />
            <p className="retro-text text-lg">No media found</p>
            <p className="retro-text text-sm opacity-70">Upload some images first</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item)}
                className="relative group cursor-pointer border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-500 transition-colors"
              >
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  <img
                    src={item.media_url}
                    alt={item.alt_text || item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/150?text=No+Image';
                    }}
                  />
                </div>
                <div className="p-2 bg-white">
                  <p className="text-xs font-medium text-gray-900 truncate">{item.title}</p>
                  {item.description && (
                    <p className="text-xs text-gray-500 truncate">{item.description}</p>
                  )}
                </div>
                <div className="absolute inset-0 bg-blue-500 bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                  <div className="bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-blue-600 font-medium text-sm">Select</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default MediaLibrarySelector;