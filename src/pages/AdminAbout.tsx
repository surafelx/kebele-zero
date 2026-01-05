import React, { useState, useEffect } from 'react';
import { Info, Edit3, Save, X } from 'lucide-react';
import { supabase } from '../services/supabase';
import ImageUpload from '../components/ImageUpload';
import TeamForm from '../components/TeamForm';

const AdminAbout = () => {
  const [aboutData, setAboutData] = useState<any>({
    title: 'Empowering Ethiopian Communities Through Culture & Innovation',
    hero_section_title: 'WELCOME TO KEBELE',
    content: 'Kebele represents the heart of Ethiopian community - the traditional neighborhood unit that forms the foundation of our social structure. Our platform brings this concept to the digital age, creating spaces where culture thrives, businesses flourish, and communities connect.',
    summary: 'Empowering Ethiopian communities through culture, commerce, and connection',
    mission: 'To preserve and promote Ethiopian cultural heritage while fostering economic growth and community development through innovative digital platforms.',
    vision: 'To become the leading digital hub connecting Ethiopians worldwide, celebrating our rich culture, supporting local businesses, and building stronger communities.',
    mission_title: 'OUR MISSION',
    vision_title: 'OUR VISION',
    story_title: 'OUR STORY',
    impact_title: 'OUR IMPACT',
    values: ["Cultural Preservation", "Community Empowerment", "Innovation", "Excellence", "Unity"],
    history: 'Founded in 2020, Kebele emerged from a vision to bridge the gap between traditional Ethiopian culture and modern digital platforms. What started as a small community project has grown into a comprehensive ecosystem serving millions across the diaspora.',
    team: [],
    contact: {
      email: 'hello@kebele.com',
      phone: '+251 911 123 456',
      address: {
        street: '123 Addis Ababa Street',
        city: 'Addis Ababa',
        state: 'Addis Ababa',
        zipCode: '1000',
        country: 'Ethiopia'
      },
      socialMedia: {
        facebook: 'https://facebook.com/kebele',
        twitter: 'https://twitter.com/kebele',
        instagram: 'https://instagram.com/kebele',
        youtube: 'https://youtube.com/kebele',
        linkedin: 'https://linkedin.com/company/kebele'
      }
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=800&fit=crop',
        alt: 'Ethiopian landscape with traditional houses',
        caption: 'The heart of Ethiopian culture',
        isHero: true
      }
    ],
    stats: [
      { label: "Active Users", value: "500K+", icon: "users" },
      { label: "Events Hosted", value: "2,500+", icon: "calendar" },
      { label: "Products Sold", value: "50K+", icon: "shopping" },
      { label: "Videos Shared", value: "10K+", icon: "play" }
    ],
    hero_image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=800&fit=crop',
    our_story: 'Founded in 2020, Kebele emerged from a vision to bridge the gap between traditional Ethiopian culture and modern digital platforms. What started as a small community project has grown into a comprehensive ecosystem serving millions across the diaspora.',
    our_impact: 'Kebele represents the heart of Ethiopian community - the traditional neighborhood unit that forms the foundation of our social structure. Our platform brings this concept to the digital age, creating spaces where culture thrives, businesses flourish, and communities connect.',
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
      // Fetch about content sections
      const { data: aboutContent, error: aboutContentError } = await supabase
        .from('about_content')
        .select('*')
        .eq('is_active', true);

      // Build about data with defaults, then override with database content if available
      const aboutData = {
        title: 'Empowering Ethiopian Communities Through Culture & Innovation',
        summary: 'Empowering Ethiopian communities through culture, commerce, and connection',
        mission: 'To preserve and promote Ethiopian cultural heritage while fostering economic growth and community development through innovative digital platforms.',
        vision: 'To become the leading digital hub connecting Ethiopians worldwide, celebrating our rich culture, supporting local businesses, and building stronger communities.',
        our_story: 'Founded in 2020, Kebele emerged from a vision to bridge the gap between traditional Ethiopian culture and modern digital platforms. What started as a small community project has grown into a comprehensive ecosystem serving millions across the diaspora.',
        our_impact: 'Kebele represents the heart of Ethiopian community - the traditional neighborhood unit that forms the foundation of our social structure. Our platform brings this concept to the digital age, creating spaces where culture thrives, businesses flourish, and communities connect.',
        hero_image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=800&fit=crop',
        mission_title: 'OUR MISSION',
        vision_title: 'OUR VISION',
        story_title: 'OUR STORY',
        impact_title: 'OUR IMPACT',
        hero_section_title: 'WELCOME TO KEBELE',
        contact_email: 'hello@kebele.com',
        contact_phone: '+251 911 123 456',
        contact_address: '123 Addis Ababa Street, Addis Ababa, Ethiopia'
      };

      if (!aboutContentError && aboutContent) {
        // Override with database content
        const titleContent = aboutContent.find(c => c.section === 'title')?.content;
        if (titleContent) aboutData.title = titleContent;

        const heroContent = aboutContent.find(c => c.section === 'hero');
        if (heroContent) {
          if (heroContent.content) aboutData.summary = heroContent.content;
          if (heroContent.image_url) aboutData.hero_image = heroContent.image_url;
          if (heroContent.title) aboutData.hero_section_title = heroContent.title;
        }

        const missionContent = aboutContent.find(c => c.section === 'mission');
        if (missionContent) {
          if (missionContent.content) aboutData.mission = missionContent.content;
          if (missionContent.title) aboutData.mission_title = missionContent.title;
        }

        const visionContent = aboutContent.find(c => c.section === 'vision');
        if (visionContent) {
          if (visionContent.content) aboutData.vision = visionContent.content;
          if (visionContent.title) aboutData.vision_title = visionContent.title;
        }

        const storyContent = aboutContent.find(c => c.section === 'story');
        if (storyContent) {
          if (storyContent.content) aboutData.our_story = storyContent.content;
          if (storyContent.title) aboutData.story_title = storyContent.title;
        }

        const impactContent = aboutContent.find(c => c.section === 'impact');
        if (impactContent) {
          if (impactContent.content) aboutData.our_impact = impactContent.content;
          if (impactContent.title) aboutData.impact_title = impactContent.title;
        }

        const contactContent = aboutContent.find(c => c.section === 'contact')?.content;
        if (contactContent) {
          const emailMatch = contactContent.match(/Email: ([^\n]+)/);
          if (emailMatch) aboutData.contact_email = emailMatch[1];

          const phoneMatch = contactContent.match(/Phone: ([^\n]+)/);
          if (phoneMatch) aboutData.contact_phone = phoneMatch[1];

          const addressMatch = contactContent.match(/Address: ([^\n]+)/);
          if (addressMatch) aboutData.contact_address = addressMatch[1];
        }
      }

      setAboutData(aboutData);

      // Fetch team members
      const { data: teamData, error: teamError } = await supabase
        .from('team_members')
        .select('*')
        .order('display_order', { ascending: true });

      if (teamError) {
        console.error('Error fetching team members:', teamError);
        // Set mock team members if error
        setTeamMembers([
          {
            id: '1',
            name: 'Alemayehu Tadesse',
            role: 'Founder & CEO',
            bio: 'Visionary leader with 15+ years in tech and cultural preservation',
            image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
            linkedin_url: 'https://linkedin.com/in/alemayehu',
            twitter_url: '@alemayehu'
          },
          {
            id: '2',
            name: 'Meseret Haile',
            role: 'Cultural Director',
            bio: 'Ethnomusicologist and cultural heritage expert',
            image_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
            instagram_url: '@meseret_culture'
          },
          {
            id: '3',
            name: 'Dawit Bekele',
            role: 'Tech Lead',
            bio: 'Full-stack developer passionate about cultural tech solutions',
            image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
            linkedin_url: 'https://linkedin.com/in/dawitbekele',
            website_url: 'https://dawit.dev'
          }
        ]);
      } else {
        setTeamMembers(teamData || []);
      }
    } catch (error) {
      console.error('Error fetching about data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAbout = async () => {
    if (!aboutData) return;

    try {
      // Save different sections to about_content table
      const sections = [
        {
          section: 'title',
          title: 'Main Title',
          content: aboutData.title,
          is_active: true
        },
        {
          section: 'hero',
          title: aboutData.hero_section_title || 'Welcome to Kebele',
          content: aboutData.summary,
          image_url: aboutData.hero_image,
          is_active: true
        },
        {
          section: 'mission',
          title: aboutData.mission_title || 'Our Mission',
          content: aboutData.mission,
          is_active: true
        },
        {
          section: 'vision',
          title: aboutData.vision_title || 'Our Vision',
          content: aboutData.vision,
          is_active: true
        },
        {
          section: 'story',
          title: aboutData.story_title || 'Our Story',
          content: aboutData.our_story,
          is_active: true
        },
        {
          section: 'impact',
          title: aboutData.impact_title || 'Our Impact',
          content: aboutData.our_impact,
          is_active: true
        },
        {
          section: 'contact',
          title: 'Contact Information',
          content: `Email: ${aboutData.contact_email}\nPhone: ${aboutData.contact_phone}\nAddress: ${aboutData.contact_address}`,
          is_active: true
        }
      ];

      // Upsert each section
      for (const section of sections) {
        const { error } = await supabase
          .from('about_content')
          .upsert(section, { onConflict: 'section' });

        if (error) throw error;
      }

      setEditingAbout(false);
      // Refresh data to show changes
      fetchAboutData();
      alert('About page updated successfully!');
    } catch (error) {
      console.error('Error saving about:', error);
      alert('Error saving about page');
    }
  };

  const handleCreateTeamMember = async (memberData: any) => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .insert([memberData])
        .select();

      if (error) throw error;

      setTeamMembers([...teamMembers, data[0]]);
      setShowTeamForm(false);
      fetchAboutData();
    } catch (error) {
      console.error('Error creating team member:', error);
      alert('Error adding team member');
    }
  };

  const handleUpdateTeamMember = async (memberData: any, memberId: string) => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .update(memberData)
        .eq('id', memberId)
        .select();

      if (error) throw error;

      setTeamMembers(teamMembers.map(m => m.id === memberId ? data[0] : m));
      setShowTeamForm(false);
      setEditingTeamMember(null);
      fetchAboutData();
    } catch (error) {
      console.error('Error updating team member:', error);
      alert('Error updating team member');
    }
  };

  const handleDeleteTeamMember = async (id: string) => {
    if (!confirm('Are you sure you want to delete this team member?')) return;

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTeamMembers(teamMembers.filter(member => member.id !== id));
      alert('Team member deleted successfully!');
    } catch (error) {
      console.error('Error deleting team member:', error);
      alert('Error deleting team member');
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border-b-4 border-charcoal px-4 py-3 flex justify-between items-center shadow-sm">
        <div>
          <h2 className="retro-title text-xl">About Page Management</h2>
          <p className="retro-text text-sm opacity-80">Edit the content displayed on the about page</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setEditingAbout(!editingAbout)}
            className={`retro-btn px-4 py-2 text-sm flex items-center space-x-2 ${
              editingAbout ? 'bg-red-500 hover:bg-red-600' : ''
            }`}
          >
            {editingAbout ? <X className="w-4 h-4 retro-icon" /> : <Edit3 className="w-4 h-4 retro-icon" />}
            <span>{editingAbout ? 'Cancel' : 'Edit'}</span>
          </button>
          {editingAbout && (
            <button
              onClick={handleSaveAbout}
              className="retro-btn-success px-4 py-2 text-sm flex items-center space-x-2"
            >
              <Save className="w-4 h-4 retro-icon" />
              <span>Save All</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="retro-window text-center py-8">
          <div className="retro-spinner w-12 h-12 mx-auto mb-4"></div>
          <p className="retro-text text-base">Loading about data...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Hero Section */}
          <div className="retro-window">
            <div className="retro-titlebar retro-titlebar-coral p-3">
              <h3 className="retro-title text-base">Hero Section</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold retro-text">Main Title</label>
                  <input
                    type="text"
                    className={`retro-input w-full text-sm py-2 ${!editingAbout ? 'bg-gray-50' : ''}`}
                    value={aboutData?.title || ''}
                    onChange={(e) => setAboutData({ ...aboutData, title: e.target.value })}
                    disabled={!editingAbout}
                    placeholder="Empowering Ethiopian Communities..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold retro-text">Hero Title</label>
                  <input
                    type="text"
                    className={`retro-input w-full text-sm py-2 ${!editingAbout ? 'bg-gray-50' : ''}`}
                    value={aboutData?.hero_section_title || 'WELCOME TO KEBELE'}
                    onChange={(e) => setAboutData({ ...aboutData, hero_section_title: e.target.value })}
                    disabled={!editingAbout}
                    placeholder="WELCOME TO KEBELE"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-semibold retro-text">Hero Content</label>
                <textarea
                  rows={1}
                  className={`retro-input w-full resize-none text-sm ${!editingAbout ? 'bg-gray-50' : ''}`}
                  value={aboutData?.summary || ''}
                  onChange={(e) => setAboutData({ ...aboutData, summary: e.target.value })}
                  disabled={!editingAbout}
                  placeholder="Empowering Ethiopian communities..."
                />
              </div>
              <div className="space-y-2">
                <ImageUpload
                  label="Hero Image"
                  value={aboutData?.hero_image || ''}
                  onChange={(url) => setAboutData({ ...aboutData, hero_image: url })}
                  placeholder="Drag & drop hero image"
                  saveToMedia={true}
                  onMediaUpdate={(item) => {/* handle media update */}}
                  disabled={!editingAbout}
                />
              </div>
            </div>
          </div>

          {/* Mission & Vision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="retro-window">
              <div className="retro-titlebar retro-titlebar-sky p-3">
                <h3 className="retro-title text-base">Mission</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold retro-text">Title</label>
                  <input
                    type="text"
                    className={`retro-input w-full text-sm py-2 ${!editingAbout ? 'bg-gray-50' : ''}`}
                    value={aboutData?.mission_title || 'OUR MISSION'}
                    onChange={(e) => setAboutData({ ...aboutData, mission_title: e.target.value })}
                    disabled={!editingAbout}
                    placeholder="OUR MISSION"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold retro-text">Content</label>
                  <textarea
                    rows={2}
                    className={`retro-input w-full resize-none text-sm ${!editingAbout ? 'bg-gray-50' : ''}`}
                    value={aboutData?.mission || ''}
                    onChange={(e) => setAboutData({ ...aboutData, mission: e.target.value })}
                    disabled={!editingAbout}
                    placeholder="Our mission statement..."
                  />
                </div>
              </div>
            </div>

            <div className="retro-window">
              <div className="retro-titlebar retro-titlebar-teal p-3">
                <h3 className="retro-title text-base">Vision</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold retro-text">Title</label>
                  <input
                    type="text"
                    className={`retro-input w-full text-sm py-2 ${!editingAbout ? 'bg-gray-50' : ''}`}
                    value={aboutData?.vision_title || 'OUR VISION'}
                    onChange={(e) => setAboutData({ ...aboutData, vision_title: e.target.value })}
                    disabled={!editingAbout}
                    placeholder="OUR VISION"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold retro-text">Content</label>
                  <textarea
                    rows={2}
                    className={`retro-input w-full resize-none text-sm ${!editingAbout ? 'bg-gray-50' : ''}`}
                    value={aboutData?.vision || ''}
                    onChange={(e) => setAboutData({ ...aboutData, vision: e.target.value })}
                    disabled={!editingAbout}
                    placeholder="Our vision statement..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Story & Impact */}
          <div className="retro-window">
            <div className="retro-titlebar retro-titlebar-mustard p-3">
              <h3 className="retro-title text-base">Our Story & Impact</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold retro-text">Story Title</label>
                  <input
                    type="text"
                    className={`retro-input w-full text-sm py-2 ${!editingAbout ? 'bg-gray-50' : ''}`}
                    value={aboutData?.story_title || 'OUR STORY'}
                    onChange={(e) => setAboutData({ ...aboutData, story_title: e.target.value })}
                    disabled={!editingAbout}
                    placeholder="OUR STORY"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold retro-text">Impact Title</label>
                  <input
                    type="text"
                    className={`retro-input w-full text-sm py-2 ${!editingAbout ? 'bg-gray-50' : ''}`}
                    value={aboutData?.impact_title || 'OUR IMPACT'}
                    onChange={(e) => setAboutData({ ...aboutData, impact_title: e.target.value })}
                    disabled={!editingAbout}
                    placeholder="OUR IMPACT"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold retro-text">Our Story</label>
                <textarea
                  rows={1}
                  className={`retro-input w-full resize-none text-sm ${!editingAbout ? 'bg-gray-50' : ''}`}
                  value={aboutData?.our_story || ''}
                  onChange={(e) => setAboutData({ ...aboutData, our_story: e.target.value })}
                  disabled={!editingAbout}
                  placeholder="Tell your story..."
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold retro-text">Our Impact</label>
                <textarea
                  rows={1}
                  className={`retro-input w-full resize-none text-sm ${!editingAbout ? 'bg-gray-50' : ''}`}
                  value={aboutData?.our_impact || ''}
                  onChange={(e) => setAboutData({ ...aboutData, our_impact: e.target.value })}
                  disabled={!editingAbout}
                  placeholder="Describe your impact..."
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="retro-window">
            <div className="retro-titlebar retro-titlebar-coral p-3">
              <h3 className="retro-title text-base">Contact Information</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold retro-text">Email</label>
                  <input
                    type="email"
                    className={`retro-input w-full text-sm py-2 ${!editingAbout ? 'bg-gray-50' : ''}`}
                    value={aboutData?.contact_email || ''}
                    onChange={(e) => setAboutData({ ...aboutData, contact_email: e.target.value })}
                    disabled={!editingAbout}
                    placeholder="contact@kebele.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold retro-text">Phone</label>
                  <input
                    type="tel"
                    className={`retro-input w-full text-sm py-2 ${!editingAbout ? 'bg-gray-50' : ''}`}
                    value={aboutData?.contact_phone || ''}
                    onChange={(e) => setAboutData({ ...aboutData, contact_phone: e.target.value })}
                    disabled={!editingAbout}
                    placeholder="+251 XXX XXX XXX"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold retro-text">Address</label>
                <textarea
                  rows={1}
                  className={`retro-input w-full resize-none text-sm ${!editingAbout ? 'bg-gray-50' : ''}`}
                  value={aboutData?.contact_address || ''}
                  onChange={(e) => setAboutData({ ...aboutData, contact_address: e.target.value })}
                  disabled={!editingAbout}
                  placeholder="Physical address"
                />
              </div>
            </div>
          </div>

          {/* Team Management */}
          <div className="retro-window">
            <div className="retro-titlebar retro-titlebar-teal p-4">
              <div className="flex items-center justify-between">
                <h3 className="retro-title text-lg">Team Members</h3>
                <button
                  onClick={() => setShowTeamForm(true)}
                  className="retro-btn px-4 py-2 flex items-center space-x-2"
                >
                  <Info className="w-4 h-4 retro-icon" />
                  <span>Add Member</span>
                </button>
              </div>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="retro-spinner w-8 h-8 mx-auto mb-4"></div>
                  <p className="retro-text">Loading team members...</p>
                </div>
              ) : teamMembers.length === 0 ? (
                <div className="text-center py-8">
                  <Info className="w-16 h-16 text-gray-300 mx-auto mb-4 retro-icon" />
                  <p className="retro-text text-lg">No team members yet</p>
                  <p className="retro-text text-sm opacity-70">Add your first team member</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="retro-window retro-hover p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <img
                            src={member.image_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'}
                            alt={member.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                          />
                          <div>
                            <h4 className="retro-title font-bold text-lg">{member.name}</h4>
                            <p className="retro-text text-sm opacity-80">{member.role}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditingTeamMember(member);
                              setShowTeamForm(true);
                            }}
                            className="retro-btn-secondary p-2"
                          >
                            <Edit3 className="w-4 h-4 retro-icon" />
                          </button>
                          <button
                            onClick={() => handleDeleteTeamMember(member.id)}
                            className="retro-btn-secondary p-2"
                          >
                            <Info className="w-4 h-4 retro-icon" />
                          </button>
                        </div>
                      </div>
                      <p className="retro-text text-sm opacity-90 line-clamp-2">{member.bio}</p>
                      <div className="flex items-center space-x-4 mt-3 text-xs retro-text opacity-70">
                        {member.linkedin_url && (
                          <span>LinkedIn: {member.linkedin_url}</span>
                        )}
                        {member.twitter_url && (
                          <span>Twitter: {member.twitter_url}</span>
                        )}
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