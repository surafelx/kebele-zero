import React, { useState } from 'react';
import ImageUpload from './ImageUpload';

const TeamForm: React.FC<{ onSubmit: (data: any) => void; onCancel: () => void; editingItem?: any }> = ({ onSubmit, onCancel, editingItem }) => {
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-semibold retro-text">Name *</label>
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
          <label className="block text-sm font-semibold retro-text">Role *</label>
          <input
            type="text"
            required
            placeholder="Job title"
            className="retro-input w-full"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold retro-text">Bio</label>
        <textarea
          rows={1}
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

      <div className="space-y-3">
        <label className="block text-sm font-semibold retro-text">Social Links</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="url"
            placeholder="LinkedIn URL"
            className="retro-input w-full"
            value={formData.linkedin_url}
            onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
          />
          <input
            type="text"
            placeholder="@twitter_handle"
            className="retro-input w-full"
            value={formData.twitter_url}
            onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
          />
          <input
            type="text"
            placeholder="@instagram_handle"
            className="retro-input w-full"
            value={formData.instagram_url}
            onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
          />
          <input
            type="url"
            placeholder="Website URL"
            className="retro-input w-full"
            value={formData.website_url}
            onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
        <button
          type="submit"
          className="flex-1 retro-btn-success py-2 px-4 text-sm"
        >
          👥 {editingItem ? 'Update' : 'Add Member'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="retro-btn-secondary py-2 px-4 text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default TeamForm;