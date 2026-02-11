import React, { useState, useEffect } from 'react';
import { Info, Edit3, Save, X, Plus, Trash2, Mail, Phone, MapPin, Globe, Linkedin, Twitter, Instagram, Globe2, Eye, ExternalLink, Trophy, Users, Calendar, ShoppingBag, Play, Link } from 'lucide-react';
import { supabase } from '../services/supabase';
import ImageUpload from '../components/ImageUpload';
import TeamForm from '../components/TeamForm';
import SocialLinksForm from '../components/SocialLinksForm';
import Modal from '../components/Modal';
import AboutKebele from './AboutKebele';

// Mock data for fallback
const mockAboutData = {
  title: 'Empowering Ethiopian Communities Through Culture & Innovation',
  hero_section_title: 'WELCOME TO KEBELE',
  content: 'Kebele represents the heart of Ethiopian community - the traditional neighborhood unit that forms the foundation of our social structure.',
  summary: 'Empowering Ethiopian communities through culture, commerce, and connection',
  mission: 'To preserve and promote Ethiopian cultural heritage while fostering economic growth and community development through innovative digital platforms.',
  vision: 'To become the leading digital hub connecting Ethiopians worldwide, celebrating our rich culture, supporting local businesses, and building stronger communities.',
  mission_title: 'OUR MISSION',
  vision_title: 'OUR VISION',
  story_title: 'OUR STORY',
  impact_title: 'OUR IMPACT',
  history: 'Founded in 2020, Kebele emerged from a vision to bridge the gap between traditional Ethiopian culture and modern digital platforms.',
  hero_image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=800&fit=crop',
  contact_email: 'hello@kebele.com',
  contact_phone: '+251 911 123 456',
  contact_address: '123 Addis Ababa Street, Addis Ababa, Ethiopia'
};

// Default stats
const defaultStats = [
  { label: 'Active Users', value: '500K+', icon: 'users' },
  { label: 'Events Hosted', value: '2,500+', icon: 'calendar' },
  { label: 'Products Sold', value: '50K+', icon: 'shopping' },
  { label: 'Videos Shared', value: '10K+', icon: 'play' }
];

const AdminAbout = () => {
  const [aboutData, setAboutData] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>(defaultStats);
  const [loading, setLoading] = useState(true);
  const [editingAbout, setEditingAbout] = useState(false);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [editingStat, setEditingStat] = useState<number | null>(null);
  const [showSocialLinksForm, setShowSocialLinksForm] = useState(false);

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    setLoading(true);
    try {
      const { data: aboutContent, error: aboutContentError } = await supabase
        .from('about_content')
        .select('*')
        .eq('is_active', true);

      const { data: teamData, error: teamError } = await supabase
        .from('team_members')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      const { data: statsContent, error: statsError } = await supabase
        .from('about_content')
        .select('*')
        .eq('section', 'stats');

      if (aboutContentError) {
        console.error('Error fetching about content:', aboutContentError);
      }
      if (teamError) {
        console.error('Error fetching team members:', teamError);
      }
      if (statsError && statsError.code !== 'PGRST116') {
        // PGRST116 is expected when no stats exist
        console.error('Error fetching stats:', statsError);
      }

      if (aboutContent && aboutContent.length > 0) {
        const transformedData: any = { ...mockAboutData };
        
        aboutContent.forEach((item: any) => {
          if (item.section === 'title') {
            transformedData.title = item.content || mockAboutData.title;
          } else if (item.section === 'hero') {
            transformedData.hero_section_title = item.title || mockAboutData.hero_section_title;
            transformedData.summary = item.content || mockAboutData.summary;
            transformedData.hero_image = (item.image_url && item.image_url.startsWith('http')) ? item.image_url : mockAboutData.hero_image;
          } else if (item.section === 'mission') {
            transformedData.mission_title = item.title || mockAboutData.mission_title;
            transformedData.mission = item.content || mockAboutData.mission;
          } else if (item.section === 'vision') {
            transformedData.vision_title = item.title || mockAboutData.vision_title;
            transformedData.vision = item.content || mockAboutData.vision;
          } else if (item.section === 'story') {
            transformedData.story_title = item.title || mockAboutData.story_title;
            transformedData.history = item.content || mockAboutData.history;
          } else if (item.section === 'contact') {
            const lines = (item.content || '').split('\n');
            lines.forEach((line: string) => {
              if (line.startsWith('Email:')) {
                transformedData.contact_email = line.replace('Email:', '').trim();
              } else if (line.startsWith('Phone:')) {
                transformedData.contact_phone = line.replace('Phone:', '').trim();
              } else if (line.includes('Addis')) {
                transformedData.contact_address = line.trim();
              }
            });
          }
        });
        
        setAboutData(transformedData);
      } else {
        setAboutData(mockAboutData);
      }

      if (teamData && teamData.length > 0) {
        setTeamMembers(teamData);
      }

      // Load stats from database or use default
      const dbStats = statsContent && statsContent.length > 0 ? statsContent[0] : null;
      if (dbStats?.content) {
        try {
          setStats(JSON.parse(dbStats.content));
        } catch (e) {
          setStats(defaultStats);
        }
      } else {
        setStats(defaultStats);
      }
    } catch (error) {
      console.error('Error fetching about data:', error);
      setAboutData(mockAboutData);
      setStats(defaultStats);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAbout = async () => {
    try {
      const sections = [
        { section: 'title', title: 'Main Title', content: aboutData.title, is_active: true },
        { section: 'hero', title: aboutData.hero_section_title, content: aboutData.summary, image_url: aboutData.hero_image, is_active: true },
        { section: 'mission', title: aboutData.mission_title, content: aboutData.mission, is_active: true },
        { section: 'vision', title: aboutData.vision_title, content: aboutData.vision, is_active: true },
        { section: 'story', title: aboutData.story_title, content: aboutData.history, is_active: true },
        { section: 'contact', title: 'Contact', content: `Email: ${aboutData.contact_email}\nPhone: ${aboutData.contact_phone}\nAddress: ${aboutData.contact_address}`, is_active: true },
        { section: 'stats', title: 'Stats', content: JSON.stringify(stats), is_active: true }
      ];

      for (const section of sections) {
        await supabase.from('about_content').upsert(section, { onConflict: 'section' });
      }

      setEditingAbout(false);
      setEditingStat(null);
      alert('About page updated successfully!');
    } catch (error) {
      console.error('Error saving about:', error);
      alert('Error saving about page');
    }
  };

  const handleUpdateStat = (index: number, field: string, value: string) => {
    const newStats = [...stats];
    newStats[index] = { ...newStats[index], [field]: value };
    setStats(newStats);
  };

  const handleAddStat = () => {
    setStats([...stats, { label: 'New Stat', value: '0', icon: 'star' }]);
    setEditingStat(stats.length);
  };

  const handleDeleteStat = async (index: number) => {
    if (!confirm('Are you sure you want to delete this stat?')) return;
    const newStats = stats.filter((_, i) => i !== index);
    setStats(newStats);
  };

  const handleCreateTeamMember = async (memberData: any) => {
    try {
      const { data, error } = await supabase.from('team_members').insert([memberData]).select();
      if (!error && data) {
        setTeamMembers([...teamMembers, data[0]]);
        setShowTeamForm(false);
      }
    } catch (error) {
      console.error('Error creating team member:', error);
      alert('Error adding team member');
    }
  };

  const handleUpdateTeamMember = async (memberData: any, memberId: string) => {
    try {
      const { data, error } = await supabase.from('team_members').update(memberData).eq('id', memberId).select();
      if (!error && data) {
        setTeamMembers(teamMembers.map(m => m.id === memberId ? data[0] : m));
        setShowTeamForm(false);
        setEditingTeamMember(null);
      }
    } catch (error) {
      console.error('Error updating team member:', error);
      alert('Error updating team member');
    }
  };

  const handleDeleteTeamMember = async (id: string) => {
    if (!confirm('Are you sure you want to delete this team member?')) return;
    try {
      const { error } = await supabase.from('team_members').delete().eq('id', id);
      if (!error) {
        setTeamMembers(teamMembers.filter(m => m.id !== id));
      }
    } catch (error) {
      console.error('Error deleting team member:', error);
      alert('Error deleting team member');
    }
  };

  // Loading spinner
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-black rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-emerald-500 rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <span className="text-2xl">K</span>
          </div>
        </div>
        <p className="mt-4 text-lg font-bold text-gray-700 uppercase tracking-wide retro-title">Loading...</p>
      </div>
    );
  }

  if (!aboutData) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="retro-text">Failed to load data</p>
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
              <Info className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-wide">About Page Management</h2>
              <p className="text-xs text-white/80 uppercase tracking-wide">Edit the content displayed on the about page</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowPreview(true)}
              className="retro-btn px-3 py-1.5 text-sm"
            >
              <Eye className="w-4 h-4 inline mr-1" />
              Preview
            </button>
            <button
              onClick={() => window.open('/', '_blank')}
              className="retro-btn px-3 py-1.5 text-sm"
            >
              <ExternalLink className="w-4 h-4 inline mr-1" />
              Open Site
            </button>
            <button
              onClick={() => setEditingAbout(!editingAbout)}
              className={`retro-btn px-3 py-1.5 text-sm ${editingAbout ? 'bg-red-500 border-red-600' : ''}`}
            >
              {editingAbout ? <X className="w-4 h-4 inline mr-1" /> : <Edit3 className="w-4 h-4 inline mr-1" />}
              {editingAbout ? 'Cancel' : 'Edit'}
            </button>
            {editingAbout && (
              <button
                onClick={handleSaveAbout}
                className="retro-btn px-3 py-1.5 text-sm bg-emerald-500 border-emerald-600"
              >
                <Save className="w-4 h-4 inline mr-1" />
                Save All
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Hero Section - Retro Card */}
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between px-4 py-3 border-b-4 border-black bg-gradient-to-r from-emerald-600 to-teal-600">
            <h3 className="text-lg font-black text-white uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Hero Section</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Main Title</label>
              <input
                type="text"
                className="retro-input w-full"
                value={aboutData.title}
                onChange={(e) => setAboutData({ ...aboutData, title: e.target.value })}
                disabled={!editingAbout}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Hero Title</label>
              <input
                type="text"
                className="retro-input w-full"
                value={aboutData.hero_section_title}
                onChange={(e) => setAboutData({ ...aboutData, hero_section_title: e.target.value })}
                disabled={!editingAbout}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Summary</label>
              <textarea
                rows={4}
                className="retro-input w-full resize-none"
                value={aboutData.summary}
                onChange={(e) => setAboutData({ ...aboutData, summary: e.target.value })}
                disabled={!editingAbout}
              />
            </div>
            <div className="space-y-2">
              <ImageUpload
                value={aboutData.hero_image}
                onChange={(url) => setAboutData({ ...aboutData, hero_image: url })}
                label="Hero Image"
                placeholder="Enter image URL or drag & drop an image"
                disabled={!editingAbout}
                folder="about/hero"
                category="about"
              />
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between px-4 py-3 border-b-4 border-black bg-gradient-to-r from-sky-500 to-blue-500">
              <h3 className="text-lg font-black text-white uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Mission</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Title</label>
                <input
                  type="text"
                  className="retro-input w-full"
                  value={aboutData.mission_title}
                  onChange={(e) => setAboutData({ ...aboutData, mission_title: e.target.value })}
                  disabled={!editingAbout}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Content</label>
                <textarea
                  rows={5}
                  className="retro-input w-full resize-none"
                  value={aboutData.mission}
                  onChange={(e) => setAboutData({ ...aboutData, mission: e.target.value })}
                  disabled={!editingAbout}
                />
              </div>
            </div>
          </div>

          <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between px-4 py-3 border-b-4 border-black bg-gradient-to-r from-teal-500 to-emerald-500">
              <h3 className="text-lg font-black text-white uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Vision</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Title</label>
                <input
                  type="text"
                  className="retro-input w-full"
                  value={aboutData.vision_title}
                  onChange={(e) => setAboutData({ ...aboutData, vision_title: e.target.value })}
                  disabled={!editingAbout}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Content</label>
                <textarea
                  rows={5}
                  className="retro-input w-full resize-none"
                  value={aboutData.vision}
                  onChange={(e) => setAboutData({ ...aboutData, vision: e.target.value })}
                  disabled={!editingAbout}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Story/History */}
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between px-4 py-3 border-b-4 border-black bg-gradient-to-r from-purple-600 to-pink-600">
            <h3 className="text-lg font-black text-white uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Story / History</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Title</label>
              <input
                type="text"
                className="retro-input w-full"
                value={aboutData.story_title}
                onChange={(e) => setAboutData({ ...aboutData, story_title: e.target.value })}
                disabled={!editingAbout}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Content</label>
              <textarea
                rows={5}
                className="retro-input w-full resize-none"
                value={aboutData.history}
                onChange={(e) => setAboutData({ ...aboutData, history: e.target.value })}
                disabled={!editingAbout}
              />
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between px-4 py-3 border-b-4 border-black bg-gradient-to-r from-emerald-600 to-teal-600">
            <h3 className="text-lg font-black text-white uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Stats / Impact Numbers</h3>
            {editingAbout && (
              <button
                onClick={handleAddStat}
                className="retro-btn px-3 py-1 text-xs"
              >
                <Plus className="w-3 h-3 inline mr-1" />
                Add Stat
              </button>
            )}
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="bg-gray-50 border-2 border-black p-4">
                  <div className="flex items-start justify-between mb-3">
                    {editingAbout && editingStat === index ? (
                      <input
                        type="text"
                        className="retro-input w-full text-lg font-bold"
                        value={stat.label}
                        onChange={(e) => handleUpdateStat(index, 'label', e.target.value)}
                        placeholder="Label"
                      />
                    ) : (
                      <h4 className="font-bold text-gray-800">{stat.label}</h4>
                    )}
                    {editingAbout && (
                      <div className="flex space-x-1 ml-2">
                        <button
                          onClick={() => setEditingStat(editingStat === index ? null : index)}
                          className="p-1 bg-white border-2 border-black hover:bg-gray-100"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteStat(index)}
                          className="p-1 bg-white border-2 border-black hover:bg-red-100"
                        >
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    {editingAbout && editingStat === index ? (
                      <input
                        type="text"
                        className="retro-input w-full text-2xl font-black text-emerald-600 text-center"
                        value={stat.value}
                        onChange={(e) => handleUpdateStat(index, 'value', e.target.value)}
                        placeholder="Value"
                      />
                    ) : (
                      <div className="text-3xl font-black text-emerald-600 retro-title">
                        {stat.value}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between px-4 py-3 border-b-4 border-black bg-gradient-to-r from-amber-600 to-yellow-600">
            <h3 className="text-lg font-black text-white uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Contact Information</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Email</label>
                <input
                  type="email"
                  className="retro-input w-full"
                  value={aboutData.contact_email}
                  onChange={(e) => setAboutData({ ...aboutData, contact_email: e.target.value })}
                  disabled={!editingAbout}
                  placeholder="hello@kebele.com"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Phone</label>
                <input
                  type="tel"
                  className="retro-input w-full"
                  value={aboutData.contact_phone}
                  onChange={(e) => setAboutData({ ...aboutData, contact_phone: e.target.value })}
                  disabled={!editingAbout}
                  placeholder="+251 911 123 456"
                />
              </div>
              <div className="space-y-2 lg:col-span-1 md:col-span-2">
                <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Address</label>
                <input
                  type="text"
                  className="retro-input w-full"
                  value={aboutData.contact_address}
                  onChange={(e) => setAboutData({ ...aboutData, contact_address: e.target.value })}
                  disabled={!editingAbout}
                  placeholder="123 Addis Ababa Street, Addis Ababa, Ethiopia"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between px-4 py-3 border-b-4 border-black bg-gradient-to-r from-purple-600 to-pink-600">
            <h3 className="text-lg font-black text-white uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Team Members</h3>
            <button
              onClick={() => { setEditingTeamMember(null); setShowTeamForm(true); }}
              className="retro-btn px-4 py-2 text-sm"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Add Member
            </button>
          </div>
          <div className="p-6">
            {teamMembers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="retro-text">No team members yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teamMembers.map((member) => (
                  <div key={member.id} className="bg-gray-50 border-2 border-black p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <img
                          src={member.image_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'}
                          alt={member.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-black"
                        />
                        <div>
                          <h4 className="font-bold text-gray-800">{member.name}</h4>
                          <p className="text-sm text-gray-500">{member.role}</p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => { setEditingTeamMember(member); setShowTeamForm(true); }}
                          className="p-2 bg-white border-2 border-black hover:bg-gray-100 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTeamMember(member.id)}
                          className="p-2 bg-white border-2 border-black hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{member.bio}</p>
                    <div className="flex items-center space-x-3 mt-3 text-xs text-gray-400">
                      {member.linkedin_url && <Linkedin className="w-4 h-4" />}
                      {member.twitter_url && <Twitter className="w-4 h-4" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between px-4 py-3 border-b-4 border-black bg-gradient-to-r from-sky-500 to-blue-500">
            <h3 className="text-lg font-black text-white uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Social Links</h3>
            <button
              onClick={() => setShowSocialLinksForm(true)}
              className="retro-btn px-4 py-2 text-sm"
            >
              <Link className="w-4 h-4 inline mr-2" />
              Manage Links
            </button>
          </div>
          <div className="p-6">
            <p className="retro-text text-center">Social links are managed separately. Click "Manage Links" to add, edit, or delete social links.</p>
          </div>
        </div>
      </div>

      {/* Team Form Modal */}
      {showTeamForm && (
        <TeamForm
          onSubmit={(data) => {
            if (editingTeamMember) {
              handleUpdateTeamMember(data, editingTeamMember.id);
            } else {
              handleCreateTeamMember(data);
            }
          }}
          onCancel={() => { setShowTeamForm(false); setEditingTeamMember(null); }}
          editingItem={editingTeamMember}
        />
      )}

      {/* Social Links Form Modal */}
      {showSocialLinksForm && (
        <SocialLinksForm
          onClose={() => setShowSocialLinksForm(false)}
          onSave={() => {
            // Refresh data if needed
            fetchAboutData();
          }}
        />
      )}

      {/* Preview Modal */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="About Page Preview"
        size="xl"
        icon={<Eye className="w-5 h-5 text-sky-500" />}
        titleColor="from-sky-500 to-blue-500"
      >
        <div className="max-h-[70vh] overflow-y-auto">
          <AboutKebele />
        </div>
      </Modal>
    </div>
  );
};

export default AdminAbout;
