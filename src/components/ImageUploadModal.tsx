import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import ImageUpload from './ImageUpload';
import { cloudinaryService } from '../services/cloudinary';
import { Image, Upload } from 'lucide-react';

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
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={editingItem ? "Edit Image" : "Upload New Image"} 
      size="lg"
      icon={<Image className="w-5 h-5 text-emerald-500" />}
      titleColor="from-emerald-500 to-teal-500"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 focus:border-emerald-500 focus:outline-none transition-all font-medium placeholder-gray-400"
              placeholder="Image title"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 focus:border-emerald-500 focus:outline-none transition-all font-medium"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Description</label>
          <textarea
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 focus:border-emerald-500 focus:outline-none transition-all font-medium placeholder-gray-400 resize-none"
            placeholder="Image description"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Alt Text</label>
            <input
              type="text"
              value={formData.alt_text}
              onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 focus:border-emerald-500 focus:outline-none transition-all font-medium placeholder-gray-400"
              placeholder="Alt text for accessibility"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Caption</label>
            <input
              type="text"
              value={formData.caption}
              onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 focus:border-emerald-500 focus:outline-none transition-all font-medium placeholder-gray-400"
              placeholder="Image caption"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Category</label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 focus:border-emerald-500 focus:outline-none transition-all font-medium placeholder-gray-400"
            placeholder="e.g., about, events, team, general"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Tags</label>
          <input
            type="text"
            value={formData.tags.join(', ')}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) })}
            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 focus:border-emerald-500 focus:outline-none transition-all font-medium placeholder-gray-400"
            placeholder="Comma-separated tags"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Image File</label>
          <ImageUpload
            value={formData.media_url}
            onChange={(url) => setFormData({ ...formData, media_url: url })}
            placeholder="Upload or drag & drop image"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t-2 border-gray-200 mt-6">
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-3 px-6 font-bold uppercase tracking-wide transition-all duration-200 shadow-lg active:translate-y-0.5"
          >
            <span className="flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" />
              {editingItem ? 'Update Image' : 'Upload Image'}
            </span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold uppercase tracking-wide transition-colors border-2 border-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ImageUploadModal;