import React, { useState, useEffect } from 'react';
import { X, Plus, Edit3, Trash2, Globe, Mail, Github, Linkedin, Twitter, Instagram, Youtube, Facebook, Twitch } from 'lucide-react';
import { supabase } from '../services/supabase';

interface SocialLink {
  id: string;
  platform: string;
  label: string;
  url: string;
  icon: string;
  display_order: number;
  is_active: boolean;
}

interface SocialLinksFormProps {
  onClose: () => void;
  onSave: () => void;
}

const platformOptions = [
  { value: 'github', label: 'GitHub', icon: 'github' },
  { value: 'linkedin', label: 'LinkedIn', icon: 'linkedin' },
  { value: 'twitter', label: 'Twitter', icon: 'twitter' },
  { value: 'instagram', label: 'Instagram', icon: 'instagram' },
  { value: 'youtube', label: 'YouTube', icon: 'youtube' },
  { value: 'discord', label: 'Discord', icon: 'discord' },
  { value: 'website', label: 'Website', icon: 'globe' },
  { value: 'mail', label: 'Email', icon: 'mail' },
  { value: 'twitch', label: 'Twitch', icon: 'twitch' },
  { value: 'facebook', label: 'Facebook', icon: 'facebook' },
];

const SocialLinksForm: React.FC<SocialLinksFormProps> = ({ onClose, onSave }) => {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    platform: 'website',
    label: '',
    url: '',
    icon: 'globe',
    display_order: 0,
    is_active: true
  });

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('social_links')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching social links:', error);
      } else if (data) {
        setLinks(data);
      }
    } catch (error) {
      console.error('Error fetching social links:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        const { error } = await supabase
          .from('social_links')
          .update(formData)
          .eq('id', editingId);
        
        if (error) {
          console.error('Error updating social link:', error);
          alert('Error updating social link');
          return;
        }
      } else {
        const { error } = await supabase
          .from('social_links')
          .insert([formData]);
        
        if (error) {
          console.error('Error creating social link:', error);
          alert('Error creating social link');
          return;
        }
      }

      fetchLinks();
      resetForm();
      onSave();
    } catch (error) {
      console.error('Error saving social link:', error);
      alert('Error saving social link');
    }
  };

  const handleEdit = (link: SocialLink) => {
    setEditingId(link.id);
    setFormData({
      platform: link.platform,
      label: link.label,
      url: link.url,
      icon: link.icon || 'globe',
      display_order: link.display_order,
      is_active: link.is_active
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this social link?')) return;
    
    try {
      const { error } = await supabase
        .from('social_links')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting social link:', error);
        alert('Error deleting social link');
        return;
      }

      fetchLinks();
      onSave();
    } catch (error) {
      console.error('Error deleting social link:', error);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      platform: 'website',
      label: '',
      url: '',
      icon: 'globe',
      display_order: links.length,
      is_active: true
    });
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'github': return <Github className="w-4 h-4" />;
      case 'linkedin': return <Linkedin className="w-4 h-4" />;
      case 'twitter': return <Twitter className="w-4 h-4" />;
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'youtube': return <Youtube className="w-4 h-4" />;
      case 'discord': return <Globe className="w-4 h-4" />;
      case 'website': return <Globe className="w-4 h-4" />;
      case 'mail': return <Mail className="w-4 h-4" />;
      case 'twitch': return <Twitch className="w-4 h-4" />;
      case 'facebook': return <Facebook className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b-4 border-black bg-gradient-to-r from-purple-600 to-pink-600">
          <h2 className="text-lg font-black text-white uppercase tracking-wide">
            {editingId ? 'Edit Social Link' : 'Add Social Link'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 bg-white border-2 border-black rounded-full hover:bg-gray-100"
          >
            <X className="w-4 h-4 text-black" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Platform</label>
              <select
                value={formData.platform}
                onChange={(e) => {
                  const platform = e.target.value;
                  const option = platformOptions.find(p => p.value === platform);
                  setFormData({ 
                    ...formData, 
                    platform, 
                    icon: option?.icon || 'globe',
                    label: option?.label || ''
                  });
                }}
                className="retro-input w-full"
              >
                {platformOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Label</label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="retro-input w-full"
                placeholder="Display name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">URL</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="retro-input w-full"
              placeholder={formData.platform === 'mail' ? 'mailto:email@example.com' : 'https://...'}
              required
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Order</label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                className="retro-input w-24"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Active</label>
              <select
                value={formData.is_active ? 'true' : 'false'}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                className="retro-input w-32"
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-4 pt-4">
            <button type="submit" className="retro-btn flex-1 py-2">
              {editingId ? 'UPDATE' : 'ADD'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="retro-btn px-4 py-2">
                CANCEL
              </button>
            )}
          </div>
        </form>

        {/* Existing Links */}
        <div className="px-6 pb-6">
          <h3 className="font-bold text-gray-800 uppercase tracking-wide mb-3">Existing Links</h3>
          {loading ? (
            <p className="retro-text">Loading...</p>
          ) : links.length === 0 ? (
            <p className="retro-text text-gray-500">No social links yet</p>
          ) : (
            <div className="space-y-2">
              {links.map((link) => (
                <div key={link.id} className="flex items-center justify-between bg-gray-50 border-2 border-black p-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${link.platform === 'instagram' ? 'bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737]' : link.platform === 'youtube' ? 'bg-[#FF0000]' : link.platform === 'twitter' ? 'bg-[#1DA1F2]' : link.platform === 'linkedin' ? 'bg-[#0A66C2]' : 'bg-gray-800'} text-white`}>
                      {getPlatformIcon(link.platform)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{link.label}</p>
                      <p className="text-xs text-gray-500 truncate max-w-xs">{link.url}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEdit(link)}
                      className="p-2 bg-white border-2 border-black hover:bg-gray-100"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(link.id)}
                      className="p-2 bg-white border-2 border-black hover:bg-red-100"
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </button>
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

export default SocialLinksForm;
