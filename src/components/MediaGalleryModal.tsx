import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import Modal from './Modal';

const MediaGalleryModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
}> = ({ isOpen, onClose, onSelectImage }) => {
  const [mediaItems, setMediaItems] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchMediaItems();
    }
  }, [isOpen]);

  const fetchMediaItems = async () => {
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
        { id: '1', title: 'Hero Image 1', media_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop' },
        { id: '2', title: 'Hero Image 2', media_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop' },
        { id: '3', title: 'Hero Image 3', media_url: 'https://images.unsplash.com/photo-1551818255-e9353de8d1b0?w=800&h=600&fit=crop' }
      ]);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Image from Gallery" size="xl">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {mediaItems.map((item) => (
          <div
            key={item.id}
            className="retro-window cursor-pointer hover:scale-105 transition-transform"
            onClick={() => {
              onSelectImage(item.media_url);
              onClose();
            }}
          >
            <div className="aspect-square overflow-hidden">
              <img
                src={item.media_url}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-2">
              <p className="retro-text text-xs truncate">{item.title}</p>
            </div>
          </div>
        ))}
        {mediaItems.length === 0 && (
          <div className="col-span-full text-center py-8">
            <p className="retro-text">No images in gallery yet.</p>
            <p className="retro-text text-sm opacity-70">Upload some images first!</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default MediaGalleryModal;