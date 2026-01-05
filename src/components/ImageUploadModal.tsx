import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import ImageUpload from './ImageUpload';
import { cloudinaryService } from '../services/cloudinary';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editingItem?: any;
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({ isOpen, onClose, onSubmit, editingItem }) => {
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    alt_text: string;
    caption: string;
    status: string;
    category: string;
    tags: string[];
    media_url: string;
  }>({
    title: '',
    description: '',
    alt_text: '',
    caption: '',
    status: 'draft',
    category: '',
    tags: [],
    media_url: ''
  });

  useEffect(() => {
    if (editingItem) {
      setFormData({
        title: editingItem.title || '',
        description: editingItem.description || '',
        alt_text: editingItem.alt_text || '',
        caption: editingItem.caption || '',
        status: editingItem.status || 'draft',
        category: editingItem.category || '',
        tags: editingItem.tags || [],
        media_url: editingItem.media_url || ''
      });
    } else {
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
    }
  }, [editingItem, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let mediaUrl = formData.media_url;

      // If media_url is a data URL or blob, upload to Cloudinary
      if (formData.media_url && (formData.media_url.startsWith('data:') || formData.media_url.startsWith('blob:'))) {
        const response = await fetch(formData.media_url);
        const blob = await response.blob();
        const file = new File([blob], 'upload.jpg', { type: 'image/jpeg' });

        const result = await cloudinaryService.uploadFile(file, {
          folder: 'kebele-media'
        });
        mediaUrl = result.secure_url;
      }

      onSubmit({
        ...formData,
        media_url: mediaUrl
      });
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed: ' + (error as Error).message);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingItem ? "Edit Image" : "Upload New Image"} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="block text-sm font-semibold retro-text">Title *</label>
            <input
              type="text"
              required
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

        <ImageUpload
          label="Image File"
          value={formData.media_url}
          onChange={(url) => setFormData({ ...formData, media_url: url })}
          placeholder="Upload or drag & drop image"
        />

        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t-4 border-mustard">
          <button
            type="submit"
            className="flex-1 retro-btn-success py-3 px-6"
          >
            📸 {editingItem ? 'Update' : 'Upload'} Image
          </button>
          <button
            type="button"
            onClick={onClose}
            className="retro-btn-secondary py-3 px-6"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ImageUploadModal;