import React, { useState, useEffect } from 'react';
import { Info, Edit3, Save, X, Plus, Trash2, Mail, Phone, MapPin, Globe, Linkedin, Twitter, Instagram, Globe2 } from 'lucide-react';
import { supabase } from '../services/supabase';
import ImageUpload from '../components/ImageUpload';
import TeamForm from '../components/TeamForm';

const AdminAbout = () => {
  const [aboutData, setAboutData] = useState<any>({
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
    our_story: '',
    our_impact: '',
    contact_email: 'hello@kebele.com',
    contact_phone: '+251 911 123 456',
    contact_address: '123 Addis Ababa Street, Addis Ababa, Ethiopia'
  });
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingAbout, setEditingAbout] = useState(false);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState<any>(null);

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
        .order('display_order', { ascending: true });

      if (teamData && !teamError) {
        setTeamMembers(teamData);
      }
    } catch (error) {
      console.error('Error fetching about data:', error);
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
        { section: 'contact', title: 'Contact', content: `Email: ${aboutData.contact_email}\nPhone: ${aboutData.contact_phone}\nAddress: ${aboutData.contact_address}`, is_active: true }
      ];

      for (const section of sections) {
        await supabase.from('about_content').upsert(section, { onConflict: 'section' });
      }

      setEditingAbout(false);
      alert('About page updated successfully!');
    } catch (error) {
      console.error('Error saving about:', error);
      alert('Error saving about page');
    }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">About Page Management</h2>
          <p className="text-gray-500 mt-1">Edit the content displayed on the about page</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setEditingAbout(!editingAbout)}
            className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-medium transition-colors ${
              editingAbout 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {editingAbout ? <X className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
            <span>{editingAbout ? 'Cancel' : 'Edit'}</span>
          </button>
          {editingAbout && (
            <button
              onClick={handleSaveAbout}
              className="inline-flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
            >
              <Save className="w-5 h-5" />
              <span>Save All</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Hero Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Hero Section</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Main Title</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={aboutData.title}
                    onChange={(e) => setAboutData({ ...aboutData, title: e.target.value })}
                    disabled={!editingAbout}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Hero Title</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={aboutData.hero_section_title}
                    onChange={(e) => setAboutData({ ...aboutData, hero_section_title: e.target.value })}
                    disabled={!editingAbout}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Summary</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  value={aboutData.summary}
                  onChange={(e) => setAboutData({ ...aboutData, summary: e.target.value })}
                  disabled={!editingAbout}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Hero Image</label>
                <ImageUpload
                  label=""
                  value={aboutData.hero_image}
                  onChange={(url) => setAboutData({ ...aboutData, hero_image: url })}
                  placeholder="Drag & drop hero image"
                  saveToMedia={true}
                  onMediaUpdate={() => {}}
                  disabled={!editingAbout}
                />
              </div>
            </div>
          </div>

          {/* Mission & Vision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">Mission</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={aboutData.mission_title}
                    onChange={(e) => setAboutData({ ...aboutData, mission_title: e.target.value })}
                    disabled={!editingAbout}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Content</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    value={aboutData.mission}
                    onChange={(e) => setAboutData({ ...aboutData, mission: e.target.value })}
                    disabled={!editingAbout}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">Vision</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={aboutData.vision_title}
                    onChange={(e) => setAboutData({ ...aboutData, vision_title: e.target.value })}
                    disabled={!editingAbout}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Content</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    value={aboutData.vision}
                    onChange={(e) => setAboutData({ ...aboutData, vision: e.target.value })}
                    disabled={!editingAbout}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Contact Information</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={aboutData.contact_email}
                      onChange={(e) => setAboutData({ ...aboutData, contact_email: e.target.value })}
                      disabled={!editingAbout}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={aboutData.contact_phone}
                      onChange={(e) => setAboutData({ ...aboutData, contact_phone: e.target.value })}
                      disabled={!editingAbout}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={aboutData.contact_address}
                      onChange={(e) => setAboutData({ ...aboutData, contact_address: e.target.value })}
                      disabled={!editingAbout}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Team */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Team Members</h3>
              <button
                onClick={() => { setEditingTeamMember(null); setShowTeamForm(true); }}
                className="inline-flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Member</span>
              </button>
            </div>
            <div className="p-6">
              {teamMembers.length === 0 ? (
                <div className="text-center py-8">
                  <Info className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500">No team members yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="bg-gray-50 rounded-xl p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <img
                            src={member.image_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'}
                            alt={member.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <h4 className="font-semibold text-gray-800">{member.name}</h4>
                            <p className="text-sm text-gray-500">{member.role}</p>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => { setEditingTeamMember(member); setShowTeamForm(true); }}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4 text-gray-500" />
                          </button>
                          <button
                            onClick={() => handleDeleteTeamMember(member.id)}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
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
        </div>
      )}
    </div>
  );
};

export default AdminAbout;
