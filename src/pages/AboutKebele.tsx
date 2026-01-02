 import React, { useState, useEffect } from 'react';
 import { Users, Award, MapPin, Mail, Phone, Globe, Heart, Target, Eye, Star, Zap, Shield, Trophy, BookOpen, Calendar, ShoppingBag, Radio } from 'lucide-react';
 import { useAuth } from '../contexts/AuthContext';
 import { pointsAPI } from '../services/points';
 import { supabase } from '../services/supabase';

interface AboutData {
   title: string;
   hero_section_title: string;
   content: string;
   summary: string;
   mission: string;
   vision: string;
   mission_title: string;
   vision_title: string;
   story_title: string;
   impact_title: string;
   values: string[];
   history: string;
   team: Array<{
     id: string;
     name: string;
     role: string;
     bio: string;
     image_url: string;
     linkedin_url?: string;
     twitter_url?: string;
     instagram_url?: string;
     website_url?: string;
   }>;
   contact: {
     email: string;
     phone: string;
     address: {
       street: string;
       city: string;
       state: string;
       zipCode: string;
       country: string;
     };
     socialMedia: {
       facebook?: string;
       twitter?: string;
       instagram?: string;
       youtube?: string;
       linkedin?: string;
     };
   };
   images: Array<{
     url: string;
     alt: string;
     caption: string;
     isHero: boolean;
   }>;
   stats: Array<{
     label: string;
     value: string;
     icon: string;
   }>;
 }

// Mock data for About Kebele
const mockAboutData: AboutData = {
  title: "Empowering Ethiopian Communities Through Culture & Innovation",
  hero_section_title: "WELCOME TO KEBELE",
  summary: "Empowering Ethiopian communities through culture, commerce, and connection",
  mission_title: "OUR MISSION",
  vision_title: "OUR VISION",
  story_title: "OUR STORY",
  impact_title: "OUR IMPACT",
  mission: "To preserve and promote Ethiopian cultural heritage while fostering economic growth and community development through innovative digital platforms.",
  vision: "To become the leading digital hub connecting Ethiopians worldwide, celebrating our rich culture, supporting local businesses, and building stronger communities.",
  values: ["Cultural Preservation", "Community Empowerment", "Innovation", "Excellence", "Unity"],
  history: "Founded in 2020, Kebele emerged from a vision to bridge the gap between traditional Ethiopian culture and modern digital platforms. What started as a small community project has grown into a comprehensive ecosystem serving millions across the diaspora.",
  content: "Kebele represents the heart of Ethiopian community - the traditional neighborhood unit that forms the foundation of our social structure. Our platform brings this concept to the digital age, creating spaces where culture thrives, businesses flourish, and communities connect.",
  team: [
    {
      id: "1",
      name: "Alemayehu Tadesse",
      role: "Founder & CEO",
      bio: "Visionary leader with 15+ years in tech and cultural preservation",
      image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      linkedin_url: "https://linkedin.com/in/alemayehu",
      twitter_url: "@alemayehu"
    },
    {
      id: "2",
      name: "Meseret Haile",
      role: "Cultural Director",
      bio: "Ethnomusicologist and cultural heritage expert",
      image_url: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
      instagram_url: "@meseret_culture"
    },
    {
      id: "3",
      name: "Dawit Bekele",
      role: "Tech Lead",
      bio: "Full-stack developer passionate about cultural tech solutions",
      image_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      linkedin_url: "https://linkedin.com/in/dawitbekele",
      website_url: "https://dawit.dev"
    }
  ],
  contact: {
    email: "hello@kebele.com",
    phone: "+251 911 123 456",
    address: {
      street: "123 Addis Ababa Street",
      city: "Addis Ababa",
      state: "Addis Ababa",
      zipCode: "1000",
      country: "Ethiopia"
    },
    socialMedia: {
      facebook: "https://facebook.com/kebele",
      twitter: "https://twitter.com/kebele",
      instagram: "https://instagram.com/kebele",
      youtube: "https://youtube.com/kebele",
      linkedin: "https://linkedin.com/company/kebele"
    }
  },
  images: [
    {
      url: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=800&fit=crop",
      alt: "Ethiopian landscape with traditional houses",
      caption: "The heart of Ethiopian culture",
      isHero: true
    },
    {
      url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
      alt: "Traditional Ethiopian coffee ceremony",
      caption: "Preserving cultural traditions",
      isHero: false
    },
    {
      url: "https://images.unsplash.com/photo-1551818255-e9353de8d1b0?w=800&h=600&fit=crop",
      alt: "Modern Ethiopian art",
      caption: "Blending tradition with innovation",
      isHero: false
    }
  ],
  stats: [
    { label: "Active Users", value: "500K+", icon: "users" },
    { label: "Events Hosted", value: "2,500+", icon: "calendar" },
    { label: "Products Sold", value: "50K+", icon: "shopping" },
    { label: "Videos Shared", value: "10K+", icon: "play" }
  ]
};

const AboutKebele: React.FC = () => {
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAboutData = async () => {
      try {
        // Fetch about content and team members from database
        const [aboutContentResult, teamResult] = await Promise.all([
          supabase
            .from('about_content')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true }),
          supabase
            .from('team_members')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true })
        ]);

        const { data: aboutContent, error: aboutError } = aboutContentResult;
        const { data: teamMembers, error: teamError } = teamResult;

        if (aboutError) {
          console.error('Error fetching about content:', aboutError);
        }
        if (teamError) {
          console.error('Error fetching team members:', teamError);
        }

        if ((aboutContent && aboutContent.length > 0) || (teamMembers && teamMembers.length > 0)) {
          // Transform database content to match component structure
          const transformedData: AboutData = {
            title: aboutContent?.find(c => c.section === 'title')?.content || mockAboutData.title,
            hero_section_title: aboutContent?.find(c => c.section === 'hero')?.title || 'WELCOME TO KEBELE',
            summary: aboutContent?.find(c => c.section === 'hero')?.content || mockAboutData.summary,
            mission: aboutContent?.find(c => c.section === 'mission')?.content || mockAboutData.mission,
            vision: aboutContent?.find(c => c.section === 'vision')?.content || mockAboutData.vision,
            mission_title: aboutContent?.find(c => c.section === 'mission')?.title || 'OUR MISSION',
            vision_title: aboutContent?.find(c => c.section === 'vision')?.title || 'OUR VISION',
            story_title: aboutContent?.find(c => c.section === 'story')?.title || 'OUR STORY',
            impact_title: aboutContent?.find(c => c.section === 'impact')?.title || 'OUR IMPACT',
            values: mockAboutData.values, // Keep mock data for now
            history: aboutContent?.find(c => c.section === 'story')?.content || mockAboutData.history,
            content: aboutContent?.find(c => c.section === 'impact')?.content || mockAboutData.content,
            team: teamMembers && teamMembers.length > 0 ? teamMembers.map(member => ({
              id: member.id,
              name: member.name,
              role: member.role,
              bio: member.bio,
              image_url: member.image_url,
              linkedin_url: member.linkedin_url,
              twitter_url: member.twitter_url,
              instagram_url: member.instagram_url,
              website_url: member.website_url
            })) : mockAboutData.team,
            contact: mockAboutData.contact, // Keep mock data for now
            images: [
              {
                url: aboutContent?.find(c => c.section === 'hero')?.image_url || mockAboutData.images[0].url,
                alt: aboutContent?.find(c => c.section === 'hero')?.title || mockAboutData.images[0].alt,
                caption: aboutContent?.find(c => c.section === 'hero')?.subtitle || mockAboutData.images[0].caption,
                isHero: true
              },
              ...mockAboutData.images.slice(1) // Keep other mock images
            ],
            stats: mockAboutData.stats // Keep mock data for now
          };
          setAboutData(transformedData);
        } else {
          // No database content, use mock data
          setAboutData(mockAboutData);
        }
      } catch (error) {
        console.error('Error loading about data:', error);
        setAboutData(mockAboutData);
      } finally {
        setLoading(false);
      }
    };
    loadAboutData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen retro-bg flex items-center justify-center">
        <div className="retro-window retro-floating">
          <div className="retro-titlebar retro-titlebar-sky">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-white rounded border-2 border-black flex items-center justify-center text-xs font-bold">K</div>
              <span className="retro-title text-sm">Loading...</span>
            </div>
            <div className="retro-window-controls">
              <div className="retro-window-dot"></div>
              <div className="retro-window-dot"></div>
              <div className="retro-window-dot"></div>
            </div>
          </div>
          <div className="p-8 text-center">
            <div className="retro-spinner w-12 h-12 mx-auto mb-4"></div>
            <div className="retro-title text-lg">Loading About Page...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!aboutData) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Information not available.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen retro-bg retro-bg-enhanced">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section with Image - Now at the top */}
        <div className="retro-window retro-floating mb-12">
          <div className="retro-titlebar retro-titlebar-coral">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-white rounded border-2 border-black flex items-center justify-center text-xs font-bold retro-icon">K</div>
              <span className="retro-title text-sm font-bold uppercase">{aboutData.hero_section_title}</span>
            </div>
            <div className="retro-window-controls">
              <div className="retro-window-dot"></div>
              <div className="retro-window-dot"></div>
              <div className="retro-window-dot"></div>
            </div>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="text-center lg:text-left">
                <h1 className="text-3xl md:text-4xl lg:text-5xl retro-title mb-6 leading-tight uppercase tracking-tight">
                  {aboutData.title}
                </h1>
                <p className="text-lg md:text-xl retro-text leading-relaxed">
                  {aboutData.summary}
                </p>
              </div>
              <div className="flex justify-center lg:justify-end">
                <div className="relative">
                  <img
                    src={aboutData.images.find(img => img.isHero)?.url || aboutData.images[0]?.url}
                    alt={aboutData.images.find(img => img.isHero)?.alt || aboutData.images[0]?.alt}
                    className="w-full max-w-md h-64 object-cover rounded-lg border-4 border-white shadow-2xl retro-floating"
                  />
                  <div className="absolute -bottom-4 -right-4 bg-mustard text-charcoal px-4 py-2 rounded-lg border-2 border-charcoal retro-title text-sm font-bold">
                    {aboutData.images.find(img => img.isHero)?.caption || aboutData.images[0]?.caption}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mission & Vision - Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Mission */}
          <div className="retro-window retro-floating">
            <div className="retro-titlebar retro-titlebar-sky">
              <div className="flex items-center space-x-3">
                <Target className="w-5 h-5 retro-icon" />
                <span className="retro-title text-sm font-bold uppercase">{aboutData.mission_title}</span>
              </div>
              <div className="retro-window-controls">
                <div className="retro-window-dot"></div>
                <div className="retro-window-dot"></div>
                <div className="retro-window-dot"></div>
              </div>
            </div>
            <div className="p-6">
              <p className="retro-text text-base leading-relaxed">
                {aboutData.mission}
              </p>
            </div>
          </div>

          {/* Vision */}
          <div className="retro-window retro-floating">
            <div className="retro-titlebar retro-titlebar-teal">
              <div className="flex items-center space-x-3">
                <Eye className="w-5 h-5 retro-icon" />
                <span className="retro-title text-sm font-bold uppercase">{aboutData.vision_title}</span>
              </div>
              <div className="retro-window-controls">
                <div className="retro-window-dot"></div>
                <div className="retro-window-dot"></div>
                <div className="retro-window-dot"></div>
              </div>
            </div>
            <div className="p-6">
              <p className="retro-text text-base leading-relaxed">
                {aboutData.vision}
              </p>
            </div>
          </div>
        </div>

        {/* Our Story */}
        <div className="retro-window retro-floating mb-12">
          <div className="retro-titlebar retro-titlebar-mustard">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-5 h-5 retro-icon" />
              <span className="retro-title text-sm font-bold uppercase">{aboutData.story_title}</span>
            </div>
            <div className="retro-window-controls">
              <div className="retro-window-dot"></div>
              <div className="retro-window-dot"></div>
              <div className="retro-window-dot"></div>
            </div>
          </div>
          <div className="p-6">
            <h3 className="retro-title text-lg mb-4 uppercase tracking-wide">{aboutData.story_title}</h3>
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row gap-6 items-center">
                <div className="flex-1 retro-text text-sm leading-relaxed space-y-4">
                  <p>{aboutData.history}</p>
                  <p>{aboutData.content}</p>
                </div>
                <div className="flex-shrink-0">
                  <img
                    src={aboutData.images[1]?.url || aboutData.images[0]?.url}
                    alt={aboutData.images[1]?.alt || aboutData.images[0]?.alt}
                    className="w-full max-w-xs h-40 object-cover rounded-lg border-4 border-white shadow-lg retro-floating"
                  />
                  <p className="retro-text text-xs text-center mt-2 opacity-80">
                    {aboutData.images[1]?.caption || aboutData.images[0]?.caption}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats & Values - Better Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
          {/* Stats - Full Width on Large Screens */}
          <div className="xl:col-span-2 retro-window retro-floating">
            <div className="retro-titlebar">
              <div className="flex items-center space-x-3">
                <Trophy className="w-5 h-5 retro-icon" />
                <span className="retro-title text-sm">Our Impact</span>
              </div>
              <div className="retro-window-controls">
                <div className="retro-window-dot"></div>
                <div className="retro-window-dot"></div>
                <div className="retro-window-dot"></div>
              </div>
            </div>
            <div className="p-6">
              <h3 className="retro-title text-lg mb-8 uppercase tracking-wide text-center">{aboutData.impact_title}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {aboutData.stats.map((stat, index) => (
                  <div key={index} className="text-center p-4 bg-white/30 rounded-lg border border-black/10 hover:bg-white/40 transition-colors">
                    <div className="text-3xl md:text-4xl retro-title mb-2">{stat.value}</div>
                    <div className="retro-text text-xs uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Core Values */}
          <div className="retro-window retro-floating">
            <div className="retro-titlebar retro-titlebar-coral">
              <div className="flex items-center space-x-3">
                <Star className="w-5 h-5 retro-icon" />
                <span className="retro-title text-sm">Core Values</span>
              </div>
              <div className="retro-window-controls">
                <div className="retro-window-dot"></div>
                <div className="retro-window-dot"></div>
                <div className="retro-window-dot"></div>
              </div>
            </div>
            <div className="p-6">
              <h3 className="retro-title text-base mb-6 uppercase tracking-wide text-center">What Drives Us</h3>
              <div className="space-y-4">
                {aboutData.values.map((value, index) => (
                  <div key={index} className="p-4 bg-white/20 rounded-lg border border-black/10 hover:bg-white/30 transition-colors">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center border-2 border-black flex-shrink-0">
                        <span className="text-black font-bold text-xs">{value[0]}</span>
                      </div>
                      <h4 className="retro-title text-sm uppercase tracking-wide">{value}</h4>
                    </div>
                    <p className="retro-text text-xs opacity-90 leading-relaxed ml-11">
                      {value === "Cultural Preservation" && "Safeguarding Ethiopia's heritage"}
                      {value === "Community Empowerment" && "Building stronger communities"}
                      {value === "Innovation" && "Tech-enhanced traditions"}
                      {value === "Excellence" && "Highest quality standards"}
                      {value === "Unity" && "Global Ethiopian connections"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Team Section - Compact */}
        <div className="retro-window retro-floating mb-12">
          <div className="retro-titlebar retro-titlebar-teal">
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 retro-icon" />
              <span className="retro-title text-sm font-bold uppercase">OUR TEAM</span>
            </div>
            <div className="retro-window-controls">
              <div className="retro-window-dot"></div>
              <div className="retro-window-dot"></div>
              <div className="retro-window-dot"></div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {aboutData.team.map((member, index) => (
                <div key={member.id || index} className="flex items-center space-x-3 p-3 bg-white/20 rounded-lg border border-black/10 hover:bg-white/30 transition-colors">
                  <img
                    src={member.image_url}
                    alt={member.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="retro-title text-sm font-bold truncate">{member.name}</h3>
                    <p className="retro-text text-xs text-sky-blue truncate">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Recent Media */}
          <div className="retro-window retro-floating">
            <div className="retro-titlebar retro-titlebar-coral">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-white rounded border-2 border-black flex items-center justify-center text-xs font-bold retro-icon">📹</div>
                <span className="retro-title text-xs font-bold uppercase">MEDIA</span>
              </div>
              <div className="retro-window-controls">
                <div className="retro-window-dot"></div>
                <div className="retro-window-dot"></div>
                <div className="retro-window-dot"></div>
              </div>
            </div>
            <div className="p-4">
              <h3 className="retro-title text-sm mb-3 uppercase tracking-wide">Latest Videos</h3>
              <p className="retro-text text-xs mb-4 opacity-90">Fresh content from our community</p>
              <button
                onClick={() => (window as any).openKebeleModal('media')}
                className="w-full retro-btn text-xs py-2 px-3"
              >
                VIEW MEDIA
              </button>
            </div>
          </div>

          {/* Recent Events */}
          <div className="retro-window retro-floating">
            <div className="retro-titlebar retro-titlebar-mustard">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 retro-icon" />
                <span className="retro-title text-xs font-bold uppercase">EVENTS</span>
              </div>
              <div className="retro-window-controls">
                <div className="retro-window-dot"></div>
                <div className="retro-window-dot"></div>
                <div className="retro-window-dot"></div>
              </div>
            </div>
            <div className="p-4">
              <h3 className="retro-title text-sm mb-3 uppercase tracking-wide">Upcoming</h3>
              <p className="retro-text text-xs mb-4 opacity-90">Join cultural celebrations</p>
              <button
                onClick={() => (window as any).openKebeleModal('events')}
                className="w-full retro-btn text-xs py-2 px-3"
              >
                VIEW EVENTS
              </button>
            </div>
          </div>

          {/* Recent Merch */}
          <div className="retro-window retro-floating">
            <div className="retro-titlebar retro-titlebar-sky">
              <div className="flex items-center space-x-3">
                <ShoppingBag className="w-5 h-5 retro-icon" />
                <span className="retro-title text-xs font-bold uppercase">MERCH</span>
              </div>
              <div className="retro-window-controls">
                <div className="retro-window-dot"></div>
                <div className="retro-window-dot"></div>
                <div className="retro-window-dot"></div>
              </div>
            </div>
            <div className="p-4">
              <h3 className="retro-title text-sm mb-3 uppercase tracking-wide">New Arrivals</h3>
              <p className="retro-text text-xs mb-4 opacity-90">Support local artisans</p>
              <button
                onClick={() => (window as any).openKebeleModal('souq')}
                className="w-full retro-btn text-xs py-2 px-3"
              >
                SHOP NOW
              </button>
            </div>
          </div>

          {/* Radio */}
          <div className="retro-window retro-floating">
            <div className="retro-titlebar retro-titlebar-teal">
              <div className="flex items-center space-x-3">
                <Radio className="w-5 h-5 retro-icon" />
                <span className="retro-title text-xs font-bold uppercase">RADIO</span>
              </div>
              <div className="retro-window-controls">
                <div className="retro-window-dot"></div>
                <div className="retro-window-dot"></div>
                <div className="retro-window-dot"></div>
              </div>
            </div>
            <div className="p-4">
              <h3 className="retro-title text-sm mb-3 uppercase tracking-wide">Live Now</h3>
              <p className="retro-text text-xs mb-4 opacity-90">Ethiopian music & culture</p>
              <button
                onClick={() => (window as any).openKebeleModal('radio')}
                className="w-full retro-btn text-xs py-2 px-3"
              >
                LISTEN LIVE
              </button>
            </div>
          </div>
        </div>

        {/* Image Gallery Section */}
        <div className="retro-window retro-floating mb-12">
          <div className="retro-titlebar retro-titlebar-sky">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-white rounded border-2 border-black flex items-center justify-center text-xs font-bold retro-icon">📸</div>
              <span className="retro-title text-sm">Our World</span>
            </div>
            <div className="retro-window-controls">
              <div className="retro-window-dot"></div>
              <div className="retro-window-dot"></div>
              <div className="retro-window-dot"></div>
            </div>
          </div>
          <div className="p-8">
            <h2 className="retro-title text-xl mb-8 uppercase tracking-wide text-center">Capturing Ethiopian Culture & Community</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aboutData.images.map((image, index) => (
                <div key={index} className="group relative overflow-hidden rounded-lg border-4 border-white shadow-xl retro-floating hover:transform hover:scale-105 transition-all duration-300">
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                    <div className="p-4 text-white">
                      <p className="retro-title text-sm font-bold">{image.caption}</p>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 bg-mustard text-charcoal px-2 py-1 rounded border-2 border-charcoal retro-title text-xs font-bold opacity-90">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <p className="retro-text text-sm opacity-80">
                Explore the rich tapestry of Ethiopian culture, from traditional ceremonies to modern innovations
              </p>
            </div>
          </div>
        </div>

        {/* Quick Contact */}
        <div className="retro-window retro-floating">
          <div className="retro-titlebar retro-titlebar-mustard">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 retro-icon" />
              <span className="retro-title text-sm font-bold uppercase">CONNECT WITH US</span>
            </div>
            <div className="retro-window-controls">
              <div className="retro-window-dot"></div>
              <div className="retro-window-dot"></div>
              <div className="retro-window-dot"></div>
            </div>
          </div>
          <div className="p-6">
            <div className="text-center mb-6">
              <p className="retro-title text-2xl font-bold uppercase tracking-wider text-white drop-shadow-lg">JOIN OUR GROWING COMMUNITY</p>
            </div>

            {/* Newsletter Signup */}
            <div className="mb-6">
              <h3 className="retro-title text-lg font-bold mb-3 uppercase tracking-wide text-center text-white drop-shadow-md">SUBSCRIBE TO OUR NEWSLETTER</h3>
              <p className="retro-text text-sm text-center mb-4 opacity-90 font-semibold">Get the latest updates on Ethiopian culture & events</p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 retro-input text-sm"
                />
                <button className="retro-btn text-sm px-4 py-2 whitespace-nowrap">
                  SUBSCRIBE
                </button>
              </div>
            </div>

            {/* Contact Info */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-charcoal retro-icon" />
                <span className="retro-text text-sm">{aboutData.contact.email}</span>
              </div>
              <div className="hidden sm:block text-charcoal">•</div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-charcoal retro-icon" />
                <span className="retro-text text-sm">{aboutData.contact.phone}</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex justify-center space-x-3">
              {Object.entries(aboutData.contact.socialMedia).slice(0, 4).map(([platform, url]) => (
                url && (
                  <a
                    key={platform}
                    href={url}
                    className="w-10 h-10 bg-gradient-to-br from-sky-blue to-mustard rounded-lg flex items-center justify-center border-2 border-charcoal retro-hover shadow-md"
                  >
                    <span className="text-white retro-title text-sm font-bold capitalize">{platform[0]}</span>
                  </a>
                )
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutKebele;