import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  Globe, 
  Bell, 
  Shield, 
  Palette, 
  Mail, 
  Check,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../services/supabase';

interface SiteSettings {
  id?: string;
  site_name: string;
  site_description: string;
  contact_email: string;
  maintenance_mode: boolean;
  allow_registration: boolean;
  enable_notifications: boolean;
  primary_color: string;
  logo_url: string | null;
  favicon_url: string | null;
  social_links: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    telegram?: string;
  };
  created_at?: string;
  updated_at?: string;
}

const defaultSettings: SiteSettings = {
  site_name: 'Kebele Zero',
  site_description: 'Empowering Ethiopian communities through culture, commerce, and connection',
  contact_email: 'contact@kebelezero.com',
  maintenance_mode: false,
  allow_registration: true,
  enable_notifications: true,
  primary_color: '#7c3aed',
  logo_url: null,
  favicon_url: null,
  social_links: {}
};

const AdminSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching settings:', error);
      } else if (data) {
        setSettings({ ...defaultSettings, ...data });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert([{
          ...settings,
          updated_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;

      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (platform: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      social_links: { ...prev.social_links, [platform]: value }
    }));
  };

  // Simple loading spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Message - Retro Style */}
      {message && (
        <div className={`flex items-center space-x-3 p-4 border-4 border-black ${message.type === 'success' ? 'bg-emerald-100' : 'bg-red-100'}`}>
          {message.type === 'success' ? (
            <Check className="w-5 h-5 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600" />
          )}
          <span className="retro-text font-bold">{message.text}</span>
        </div>
      )}

      {/* Tabs Container - Retro Style */}
      <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        {/* Retro Title Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b-4 border-black bg-gradient-to-r from-emerald-600 to-teal-600">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border-2 border-black shadow-lg">
              <Settings className="w-6 h-6 text-black" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Settings</h2>
              <p className="text-sm text-emerald-100 font-bold uppercase">Configure your platform settings</p>
            </div>
          </div>
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="retro-btn px-4 py-2 bg-white"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 inline animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 inline mr-2" />
            )}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
        
        {/* Tabs Navigation */}
        <div className="flex overflow-x-auto border-b-4 border-black bg-gray-100">
          {[
            { id: 'general', label: 'General', icon: Globe },
            { id: 'appearance', label: 'Appearance', icon: Palette },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'contact', label: 'Contact', icon: Mail },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 text-sm font-bold uppercase tracking-wide transition-all border-b-4 ${
                  activeTab === tab.id
                    ? 'bg-white border-black text-emerald-700'
                    : 'border-transparent text-gray-600 hover:bg-gray-50'
                }`}
                style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Site Name</label>
                  <input
                    type="text"
                    value={settings.site_name}
                    onChange={(e) => handleInputChange('site_name', e.target.value)}
                    className="retro-input"
                    placeholder="Enter site name"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Contact Email</label>
                  <input
                    type="email"
                    value={settings.contact_email}
                    onChange={(e) => handleInputChange('contact_email', e.target.value)}
                    className="retro-input"
                    placeholder="contact@example.com"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Site Description</label>
                <textarea
                  value={settings.site_description}
                  onChange={(e) => handleInputChange('site_description', e.target.value)}
                  rows={4}
                  className="retro-input resize-none"
                  placeholder="Enter site description"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Social Links</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-blue-600 font-bold w-20 uppercase text-sm">Facebook</span>
                    <input
                      type="url"
                      value={settings.social_links.facebook || ''}
                      onChange={(e) => handleSocialChange('facebook', e.target.value)}
                      className="retro-input flex-1"
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sky-400 font-bold w-20 uppercase text-sm">Twitter</span>
                    <input
                      type="url"
                      value={settings.social_links.twitter || ''}
                      onChange={(e) => handleSocialChange('twitter', e.target.value)}
                      className="retro-input flex-1"
                      placeholder="https://twitter.com/..."
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-pink-600 font-bold w-20 uppercase text-sm">Instagram</span>
                    <input
                      type="url"
                      value={settings.social_links.instagram || ''}
                      onChange={(e) => handleSocialChange('instagram', e.target.value)}
                      className="retro-input flex-1"
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-blue-500 font-bold w-20 uppercase text-sm">Telegram</span>
                    <input
                      type="url"
                      value={settings.social_links.telegram || ''}
                      onChange={(e) => handleSocialChange('telegram', e.target.value)}
                      className="retro-input flex-1"
                      placeholder="https://t.me/..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Primary Color</label>
                <div className="flex items-center space-x-4">
                  <input
                    type="color"
                    value={settings.primary_color}
                    onChange={(e) => handleInputChange('primary_color', e.target.value)}
                    className="w-16 h-12 border-4 border-black cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.primary_color}
                    onChange={(e) => handleInputChange('primary_color', e.target.value)}
                    className="retro-input flex-1"
                    placeholder="#7c3aed"
                  />
                </div>
              </div>

              <div className="p-4 bg-gray-100 border-4 border-black">
                <p className="retro-text text-sm font-bold uppercase mb-3">Preview</p>
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-12 h-12 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    style={{ backgroundColor: settings.primary_color }}
                  ></div>
                  <button 
                    className="px-6 py-3 font-bold uppercase tracking-wide text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    style={{ backgroundColor: settings.primary_color }}
                  >
                    Button Preview
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-100 border-4 border-black">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center">
                      <Bell className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 uppercase tracking-wide">Enable Notifications</h4>
                      <p className="retro-text text-sm">Allow the system to send notifications to users</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enable_notifications}
                      onChange={(e) => handleInputChange('enable_notifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none border-2 border-black peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-100 border-4 border-black">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center">
                      <Mail className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 uppercase tracking-wide">Email Notifications</h4>
                      <p className="retro-text text-sm">Send email notifications for important events</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={true} onChange={() => {}} className="sr-only peer" />
                    <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none border-2 border-black peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-100 border-4 border-black">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 uppercase tracking-wide">Maintenance Mode</h4>
                    <p className="retro-text text-sm">Temporarily disable public access to the site</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.maintenance_mode}
                    onChange={(e) => handleInputChange('maintenance_mode', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none border-2 border-black peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-orange-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-100 border-4 border-black">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 uppercase tracking-wide">Allow User Registration</h4>
                    <p className="retro-text text-sm">Allow new users to register on the platform</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.allow_registration}
                    onChange={(e) => handleInputChange('allow_registration', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none border-2 border-black peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              <div className="p-4 bg-red-100 border-4 border-black">
                <h4 className="font-bold text-red-800 uppercase tracking-wide mb-2">Danger Zone</h4>
                <p className="retro-text text-sm text-red-600 mb-4">
                  These actions are irreversible. Please proceed with caution.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button className="retro-btn px-4 py-2 bg-red-500 border-red-600">
                    Clear All Cache
                  </button>
                  <button className="retro-btn px-4 py-2 bg-red-500 border-red-600">
                    Reset All Settings
                  </button>
                  <button className="retro-btn px-4 py-2">
                    Export Data
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Contact Settings */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className="p-4 bg-purple-100 border-4 border-black">
                <h4 className="font-bold text-purple-800 uppercase tracking-wide mb-4 flex items-center space-x-2">
                  <Mail className="w-5 h-5" />
                  <span>Contact Information</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Contact Email</label>
                    <input
                      type="email"
                      value={settings.contact_email}
                      onChange={(e) => handleInputChange('contact_email', e.target.value)}
                      className="retro-input"
                      placeholder="contact@example.com"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Support Email</label>
                    <input
                      type="email"
                      defaultValue="support@kebelezero.com"
                      className="retro-input"
                      placeholder="support@example.com"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Phone Number</label>
                    <input
                      type="tel"
                      defaultValue="+251 123 456 789"
                      className="retro-input"
                      placeholder="+251 123 456 789"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Address</label>
                    <input
                      type="text"
                      defaultValue="Addis Ababa, Ethiopia"
                      className="retro-input"
                      placeholder="Enter address"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
