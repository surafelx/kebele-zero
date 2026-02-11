import React, { useState } from 'react';
import { X, User, Linkedin, Twitter, Instagram, Globe } from 'lucide-react';
import ImageUpload from './ImageUpload';

interface TeamFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  editingItem?: any;
}

const TeamForm: React.FC<TeamFormProps> = ({ onSubmit, onCancel, editingItem }) => {
  const [formData, setFormData] = useState({
    name: editingItem?.name || '',
    role: editingItem?.role || '',
    bio: editingItem?.bio || '',
    image_url: editingItem?.image_url || '',
    linkedin_url: editingItem?.linkedin_url || '',
    twitter_url: editingItem?.twitter_url || '',
    instagram_url: editingItem?.instagram_url || '',
    website_url: editingItem?.website_url || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-lg w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b-4 border-black bg-gradient-to-r from-purple-600 to-pink-600">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border-2 border-black">
              <User className="w-4 h-4 text-black" />
            </div>
            <h2 className="text-lg font-black text-white uppercase tracking-wide">
              {editingItem ? 'Edit Team Member' : 'Add Team Member'}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="p-1 bg-white border-2 border-black rounded-full hover:bg-gray-100"
          >
            <X className="w-4 h-4 text-black" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Name *</label>
            <input
              type="text"
              required
              placeholder="Full name"
              className="retro-input w-full"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Role *</label>
            <input
              type="text"
              required
              placeholder="Job title"
              className="retro-input w-full"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Bio</label>
            <textarea
              rows={3}
              placeholder="Brief biography"
              className="retro-input w-full resize-none"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
          </div>

          <ImageUpload
            label="Profile Image"
            value={formData.image_url}
            onChange={(url) => setFormData({ ...formData, image_url: url })}
            placeholder="Drag & drop image or click to browse"
          />

          {/* Social Links */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Social Links</label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#0A66C2] rounded-lg flex items-center justify-center">
                  <Linkedin className="w-4 h-4 text-white" />
                </div>
                <input
                  type="url"
                  placeholder="LinkedIn URL"
                  className="retro-input flex-1"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#1DA1F2] rounded-lg flex items-center justify-center">
                  <Twitter className="w-4 h-4 text-white" />
                </div>
                <input
                  type="url"
                  placeholder="https://twitter.com/username"
                  className="retro-input flex-1"
                  value={formData.twitter_url}
                  onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] rounded-lg flex items-center justify-center">
                  <Instagram className="w-4 h-4 text-white" />
                </div>
                <input
                  type="url"
                  placeholder="https://instagram.com/username"
                  className="retro-input flex-1"
                  value={formData.instagram_url}
                  onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <Globe className="w-4 h-4 text-white" />
                </div>
                <input
                  type="url"
                  placeholder="Website URL"
                  className="retro-input flex-1"
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4 border-t-4 border-black">
            <button
              type="submit"
              className="retro-btn flex-1 py-3"
            >
              {editingItem ? 'UPDATE' : 'ADD MEMBER'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="retro-btn px-6 py-3"
            >
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamForm;
