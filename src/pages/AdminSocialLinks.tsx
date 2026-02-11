import React, { useState, useEffect } from 'react';
import { Link, Github, Linkedin, Twitter, Instagram, Youtube, Globe, Mail, Edit2, Trash2, ExternalLink, Plus } from 'lucide-react';
import { supabase } from '../services/supabase';
import Modal from '../components/Modal';

interface SocialLink {
  id: string;
  platform: string;
  label: string;
  url: string;
  icon: string;
  is_active: boolean;
  display_order: number;
}

const platformIcons: Record<string, React.ReactNode> = {
  github: <Github className="w-5 h-5" />,
  linkedin: <Linkedin className="w-5 h-5" />,
  twitter: <Twitter className="w-5 h-5" />,
  instagram: <Instagram className="w-5 h-5" />,
  youtube: <Youtube className="w-5 h-5" />,
  discord: <Globe className="w-5 h-5" />,
  website: <Globe className="w-5 h-5" />,
  mail: <Mail className="w-5 h-5" />,
  twitch: <Globe className="w-5 h-5" />,
  facebook: <Globe className="w-5 h-5" />
};

const AdminSocialLinks = () => {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null);
  const [formData, setFormData] = useState({
    platform: 'github',
    label: '',
    url: '',
    icon: 'link',
    is_active: true,
    display_order: 0
  });

  useEffect(() => {
    fetchSocialLinks();
  }, []);

  const fetchSocialLinks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('social_links')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setSocialLinks(data || []);
    } catch (error) {
      console.error('Error fetching social links:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingLink) {
        const { error } = await supabase
          .from('social_links')
          .update(formData)
          .eq('id', editingLink.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('social_links')
          .insert([formData]);
        
        if (error) throw error;
      }
      
      fetchSocialLinks();
      closeForm();
    } catch (error) {
      console.error('Error saving social link:', error);
      alert('Error saving social link');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this social link?')) return;

    try {
      const { error } = await supabase
        .from('social_links')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSocialLinks(socialLinks.filter(link => link.id !== id));
    } catch (error) {
      console.error('Error deleting social link:', error);
      alert('Error deleting social link');
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('social_links')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;
      fetchSocialLinks();
    } catch (error) {
      console.error('Error toggling social link:', error);
    }
  };

  const openEditForm = (link: SocialLink) => {
    setEditingLink(link);
    setFormData({
      platform: link.platform,
      label: link.label,
      url: link.url,
      icon: link.icon,
      is_active: link.is_active,
      display_order: link.display_order
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingLink(null);
    setFormData({
      platform: 'github',
      label: '',
      url: '',
      icon: 'link',
      is_active: true,
      display_order: socialLinks.length + 1
    });
  };

  const activeLinks = socialLinks.filter(link => link.is_active);
  const inactiveLinks = socialLinks.filter(link => !link.is_active);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Retro Style */}
      <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center">
              <Link className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-wide">Social Links</h2>
              <p className="text-xs text-white/80 uppercase tracking-wide">Manage your social media links</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="retro-btn px-3 py-1.5 text-sm"
          >
            <Plus className="w-4 h-4 inline mr-1" />
            Add Link
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="retro-text text-xs uppercase tracking-wide">Total Links</p>
              <p className="text-2xl retro-title">{socialLinks.length}</p>
            </div>
            <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center">
              <Link className="w-5 h-5 text-black" />
            </div>
          </div>
        </div>
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="retro-text text-xs uppercase tracking-wide">Active</p>
              <p className="text-2xl retro-title">{activeLinks.length}</p>
            </div>
            <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center">
              <ExternalLink className="w-5 h-5 text-black" />
            </div>
          </div>
        </div>
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="retro-text text-xs uppercase tracking-wide">Inactive</p>
              <p className="text-2xl retro-title">{inactiveLinks.length}</p>
            </div>
            <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center">
              <Link className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="retro-text text-xs uppercase tracking-wide">Platforms</p>
              <p className="text-2xl retro-title">{new Set(socialLinks.map(l => l.platform)).size}</p>
            </div>
            <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center">
              <Globe className="w-5 h-5 text-black" />
            </div>
          </div>
        </div>
      </div>

      {/* Social Links Grid */}
      {socialLinks.length === 0 ? (
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-12 text-center">
          <Link className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="retro-title text-xl">No social links yet</p>
          <p className="retro-text text-sm mt-1">Add your first social link to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {socialLinks.map((link) => (
            <div 
              key={link.id} 
              className={`bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden transition-all ${
                !link.is_active ? 'opacity-60' : 'hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b-4 border-black bg-gradient-to-r from-gray-800 to-gray-900">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white border-2 border-black rounded-lg flex items-center justify-center">
                    {platformIcons[link.platform] || <Link className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-white uppercase tracking-wide">{link.label}</h3>
                    <p className="text-xs text-white/80">{link.platform}</p>
                  </div>
                </div>
                <div className={`w-4 h-4 border-2 border-black ${link.is_active ? 'bg-green-400' : 'bg-gray-400'}`}></div>
              </div>
              
              {/* Card Body */}
              <div className="p-4">
                <p className="retro-text text-sm mb-4 truncate">{link.url}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs retro-text text-gray-500">
                    Order: {link.display_order}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditForm(link)}
                      className="retro-btn-secondary p-2"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggle(link.id, link.is_active)}
                      className={`retro-btn-secondary p-2 ${
                        link.is_active ? '' : 'bg-green-100'
                      }`}
                    >
                      {link.is_active ? (
                        <Link className="w-4 h-4" />
                      ) : (
                        <ExternalLink className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(link.id)}
                      className="retro-btn-secondary p-2"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal - Retro Style */}
      <Modal
        isOpen={showForm}
        onClose={closeForm}
        title={editingLink ? 'Edit Social Link' : 'Add Social Link'}
        size="md"
        icon={<Link className="w-5 h-5 text-black" />}
        titleColor="from-blue-500 to-indigo-500"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Platform</label>
              <select
                value={formData.platform}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, platform: e.target.value })}
                className="retro-input w-full bg-white"
              >
                <option value="github">GitHub</option>
                <option value="linkedin">LinkedIn</option>
                <option value="twitter">Twitter</option>
                <option value="instagram">Instagram</option>
                <option value="youtube">YouTube</option>
                <option value="discord">Discord</option>
                <option value="website">Website</option>
                <option value="mail">Email</option>
                <option value="twitch">Twitch</option>
                <option value="facebook">Facebook</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Display Order</label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                className="retro-input w-full"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Label</label>
            <input
              type="text"
              required
              value={formData.label}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, label: e.target.value })}
              className="retro-input w-full"
              placeholder="e.g., Follow us on Twitter"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">URL</label>
            <input
              type="url"
              required
              value={formData.url}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, url: e.target.value })}
              className="retro-input w-full"
              placeholder="https://..."
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-5 h-5 border-4 border-black rounded"
            />
            <label htmlFor="is_active" className="retro-text font-bold">Active</label>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 retro-btn bg-blue-500 border-blue-600"
            >
              {editingLink ? 'Update Link' : 'Add Link'}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="retro-btn-secondary px-5"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminSocialLinks;
