import React, { useState, useEffect } from 'react';
import { Users, Award, MapPin, Mail, Phone, Globe, Heart, Target, Eye, Star, Zap, Shield, Trophy, BookOpen, Calendar, ShoppingBag, Radio, Facebook, Twitter, Instagram, Youtube, Linkedin, Github, Globe2, ExternalLink, Video, Play, MessageCircle, Heart as HeartIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { aboutAPI } from '../services/content';
import { socialLinksAPI } from '../services/admin';
import { mediaAPI } from '../services/content';
import ModalLoader from '../components/ModalLoader';

// Fallback when a hero/section image is missing or fails to load.
const ABOUT_PLACEHOLDER =
  'https://placehold.co/600x400/ecfdf5/10b981?text=Kebele+Zero';

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

// Default mock data for fallback
const defaultAboutData: AboutData = {
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
  team: [],
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
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [videoItems, setVideoItems] = useState<any[]>([]);
  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const { user } = useAuth();

  // Social media icon helper
  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook':
        return <Facebook className="w-5 h-5 text-white" />;
      case 'twitter':
        return <Twitter className="w-5 h-5 text-white" />;
      case 'instagram':
        return <Instagram className="w-5 h-5 text-white" />;
      case 'youtube':
        return <Youtube className="w-5 h-5 text-white" />;
      case 'linkedin':
        return <Linkedin className="w-5 h-5 text-white" />;
      case 'github':
        return <Github className="w-5 h-5 text-white" />;
      case 'website':
        return <Globe2 className="w-5 h-5 text-white" />;
      default:
        return <ExternalLink className="w-5 h-5 text-white" />;
    }
  };

  // Social media color helper
  const getSocialIconColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook':
        return 'bg-[#1877F2] hover:bg-[#166FE5]';
      case 'twitter':
        return 'bg-[#1DA1F2] hover:bg-[#1A91DA]';
      case 'instagram':
        return 'bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90';
      case 'youtube':
        return 'bg-[#FF0000] hover:bg-[#CC0000]';
      case 'linkedin':
        return 'bg-[#0A66C2] hover:bg-[#004182]';
      case 'github':
        return 'bg-[#333333] hover:bg-[#24292F]';
      case 'website':
        return 'bg-emerald-500 hover:bg-emerald-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  useEffect(() => {
    const loadAboutData = async () => {
      try {
        const [aboutResult, mediaResult, socialResult] = await Promise.all([
          aboutAPI.getAbout().catch(() => null),
          mediaAPI.getMedia().catch(() => []),
          socialLinksAPI.getLinks().catch(() => [])
        ]);

        if (socialResult && socialResult.length > 0) {
          setSocialLinks(socialResult);
        }
        if (mediaResult && mediaResult.length > 0) {
          setMediaItems(mediaResult.slice(0, 4));
        }

        if (aboutResult && (aboutResult.sections?.length > 0 || aboutResult.title)) {
          // Map Express response to component structure
          const sections: any[] = aboutResult.sections || [];
          const findSection = (key: string) => sections.find((s: any) => s.section === key || s.key === key);
          const transformedData: AboutData = {
            ...defaultAboutData,
            title: aboutResult.title || findSection('title')?.content || defaultAboutData.title,
            hero_section_title: aboutResult.heroTitle || findSection('hero')?.title || defaultAboutData.hero_section_title,
            summary: aboutResult.summary || findSection('hero')?.content || defaultAboutData.summary,
            mission: aboutResult.mission || findSection('mission')?.content || defaultAboutData.mission,
            vision: aboutResult.vision || findSection('vision')?.content || defaultAboutData.vision,
            history: aboutResult.history || findSection('story')?.content || defaultAboutData.history,
            team: aboutResult.team || defaultAboutData.team,
            stats: aboutResult.stats || defaultAboutData.stats,
          };
          setAboutData(transformedData);
        } else {
          setAboutData(defaultAboutData);
        }
      } catch (error) {
        console.error('Error loading about data:', error);
        setAboutData(defaultAboutData);
      } finally {
        setLoading(false);
      }
    };
    loadAboutData();
  }, []);

  if (loading) return <ModalLoader label="Loading About..." fullHeight />;

  if (!aboutData) {
    return null;
  }

  return (
    <div className="retro-bg retro-bg-enhanced">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section with Image */}
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-12">
          <div className="flex items-center justify-center px-4 py-3 border-b-4 border-black bg-gradient-to-r from-emerald-600 to-teal-600">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center border-2 border-black">
                <span className="text-black font-bold text-xs">K</span>
              </div>
              <span className="text-sm font-black text-white uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{aboutData.hero_section_title}</span>
            </div>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="text-center lg:text-left">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight uppercase tracking-tight">
                  {aboutData.title}
                </h1>
                <p className="text-lg md:text-xl leading-relaxed">
                  {aboutData.summary}
                </p>
              </div>
              <div className="flex justify-center lg:justify-end">
                <div className="relative">
                  <img
                    src={aboutData.images.find(img => img.isHero)?.url || aboutData.images[0]?.url || ABOUT_PLACEHOLDER}
                    alt={aboutData.images.find(img => img.isHero)?.alt || aboutData.images[0]?.alt || 'Kebele'}
                    className="w-full max-w-md h-64 object-cover rounded-lg border-4 border-white shadow-2xl bg-gray-100"
                    onError={(e) => { (e.target as HTMLImageElement).src = ABOUT_PLACEHOLDER; }}
                  />
                  <div className="absolute -bottom-4 -right-4 bg-mustard text-charcoal px-4 py-2 rounded-lg border-2 border-charcoal text-sm font-bold">
                    {aboutData.images.find(img => img.isHero)?.caption || aboutData.images[0]?.caption}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mission & Vision - Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
          {/* Mission */}
          <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-center px-4 py-3 border-b-4 border-black bg-gradient-to-r from-sky-500 to-blue-500">
              <div className="flex items-center space-x-3">
                <Target className="w-5 h-5 text-white" />
                <span className="text-sm font-black text-white uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{aboutData.mission_title}</span>
              </div>
            </div>
            <div className="p-6">
              <p className="text-base leading-relaxed">
                {aboutData.mission}
              </p>
            </div>
          </div>

          {/* Vision */}
          <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-center px-4 py-3 border-b-4 border-black bg-gradient-to-r from-teal-500 to-emerald-500">
              <div className="flex items-center space-x-3">
                <Eye className="w-5 h-5 text-white" />
                <span className="text-sm font-black text-white uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{aboutData.vision_title}</span>
              </div>
            </div>
            <div className="p-6">
              <p className="text-base leading-relaxed">
                {aboutData.vision}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-12">
          <div className="flex items-center justify-center px-4 py-3 border-b-4 border-black bg-gradient-to-r from-emerald-600 to-teal-600">
            <div className="flex items-center space-x-3">
              <Trophy className="w-5 h-5 text-white" />
              <span className="text-sm font-black text-white uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>OUR IMPACT</span>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {aboutData.stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-black text-emerald-600 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Section */}
        {aboutData.team && aboutData.team.length > 0 && (
          <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-12">
            <div className="flex items-center justify-center px-4 py-3 border-b-4 border-black bg-gradient-to-r from-purple-600 to-pink-600">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-white" />
                <span className="text-sm font-black text-white uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>OUR TEAM</span>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {aboutData.team.slice(0, 4).map((member, index) => (
                  <div key={member.id || index} className="bg-gray-50 border-2 border-black p-4 text-center hover:shadow-lg transition-shadow">
                    <div className="relative inline-block mb-3">
                      <img
                        src={member.image_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'}
                        alt={member.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-black"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face';
                        }}
                      />
                    </div>
                    <h3 className="font-black text-gray-900 uppercase tracking-wide text-lg mb-1" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{member.name}</h3>
                    <p className="font-bold text-emerald-600 uppercase tracking-wide text-base mb-2" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{member.role}</p>
                    <p className="font-medium text-gray-700 text-base line-clamp-3" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{member.bio}</p>
                    {/* Team member social links */}
                    <div className="flex justify-center space-x-2 mt-3">
                      {member.linkedin_url && (
                        <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" className="w-6 h-6 bg-[#0A66C2] rounded-full flex items-center justify-center">
                          <Linkedin className="w-3 h-3 text-white" />
                        </a>
                      )}
                      {member.twitter_url && (
                        <a href={member.twitter_url} target="_blank" rel="noopener noreferrer" className="w-6 h-6 bg-[#1DA1F2] rounded-full flex items-center justify-center">
                          <Twitter className="w-3 h-3 text-white" />
                        </a>
                      )}
                      {member.instagram_url && (
                        <a href={member.instagram_url} target="_blank" rel="noopener noreferrer" className="w-6 h-6 bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] rounded-full flex items-center justify-center">
                          <Instagram className="w-3 h-3 text-white" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {aboutData.team.length > 4 && (
                <div className="text-center mt-6">
                  <button
                    onClick={() => (window as any).openKebeleModal('team')}
                    className="retro-btn px-6 py-2"
                  >
                    VIEW ALL TEAM
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Activity Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Recent Media */}
          <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-center px-4 py-3 border-b-4 border-black bg-gradient-to-r from-pink-600 to-rose-600">
              <div className="flex items-center space-x-3">
                <Video className="w-5 h-5 text-white" />
                <span className="text-xs font-black text-white uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>MEDIA</span>
              </div>
            </div>
            <div className="p-4">
              {videoItems.length > 0 ? (
                <>
                  <img 
                    src={videoItems[0]?.thumbnail?.url || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop'}
                    alt={videoItems[0]?.title}
                    className="w-full h-32 object-cover rounded-lg border-2 border-black mb-3"
                  />
                  <h3 className="font-black text-gray-800 text-base mb-2 line-clamp-2" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{videoItems[0]?.title || 'Featured Video'}</h3>
                </>
              ) : (
                <img 
                  src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop"
                  alt="Media"
                  className="w-full h-32 object-cover rounded-lg border-2 border-black mb-3"
                />
              )}
              <p className="font-medium text-gray-600 text-sm mb-3 opacity-90" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{videoItems.length > 0 ? `${videoItems.length} featured videos` : 'No videos yet'}</p>
              <button
                onClick={() => (window as any).openKebeleModal('media')}
                className="w-full retro-btn text-xs py-2 px-3"
              >
                VIEW ALL
              </button>
            </div>
          </div>

          {/* Recent Events */}
          <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-center px-4 py-3 border-b-4 border-black bg-gradient-to-r from-orange-500 to-red-500">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-white" />
                <span className="text-xs font-black text-white uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>EVENTS</span>
              </div>
            </div>
            <div className="p-4">
              <img 
                src="https://images.unsplash.com/photo-1551818255-e9353de8d1b0?w=400&h=225&fit=crop"
                alt="Events"
                className="w-full h-32 object-cover rounded-lg border-2 border-black mb-3"
              />
              <h3 className="font-black text-gray-800 text-base mb-2" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Upcoming Events</h3>
              <p className="font-medium text-gray-600 text-sm mb-3 opacity-90" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Join cultural celebrations</p>
              <button
                onClick={() => (window as any).openKebeleModal('events')}
                className="w-full retro-btn text-xs py-2 px-3"
              >
                VIEW ALL
              </button>
            </div>
          </div>

          {/* Recent Merch */}
          <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-center px-4 py-3 border-b-4 border-black bg-gradient-to-r from-sky-500 to-blue-500">
              <div className="flex items-center space-x-3">
                <ShoppingBag className="w-5 h-5 text-white" />
                <span className="text-xs font-black text-white uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>MERCH</span>
              </div>
            </div>
            <div className="p-4">
              {mediaItems.length > 0 ? (
                <img 
                  src={mediaItems[0]?.media_url || 'https://images.unsplash.com/photo-1551818255-e9353de8d1b0?w=400&h=225&fit=crop'}
                  alt={mediaItems[0]?.title}
                  className="w-full h-32 object-cover rounded-lg border-2 border-black mb-3"
                />
              ) : (
                <img 
                  src="https://images.unsplash.com/photo-1551818255-e9353de8d1b0?w=400&h=225&fit=crop"
                  alt="Merchandise"
                  className="w-full h-32 object-cover rounded-lg border-2 border-black mb-3"
                />
              )}
              <h3 className="font-black text-gray-800 text-base mb-2" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>New Arrivals</h3>
              <p className="font-medium text-gray-600 text-sm mb-3 opacity-90" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Support local artisans</p>
              <button
                onClick={() => (window as any).openKebeleModal('souq')}
                className="w-full retro-btn text-xs py-2 px-3"
              >
                SHOP NOW
              </button>
            </div>
          </div>

          {/* Radio */}
          <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-center px-4 py-3 border-b-4 border-black bg-gradient-to-r from-teal-500 to-emerald-500">
              <div className="flex items-center space-x-3">
                <Radio className="w-5 h-5 text-white" />
                <span className="text-xs font-black text-white uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>RADIO</span>
              </div>
            </div>
            <div className="p-4">
              <div className="w-full h-32 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-lg border-2 border-black mb-3 flex items-center justify-center">
                <Radio className="w-12 h-12 text-white animate-pulse" />
              </div>
              <h3 className="font-black text-gray-800 text-base mb-2" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Live Now</h3>
              <p className="font-medium text-gray-600 text-sm mb-3 opacity-90" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Ethiopian music & culture</p>
              <button
                onClick={() => (window as any).openKebeleModal('radio')}
                className="w-full retro-btn text-xs py-2 px-3"
              >
                LISTEN LIVE
              </button>
            </div>
          </div>
        </div>

        {/* Quick Contact */}
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-center px-4 py-3 border-b-4 border-black bg-gradient-to-r from-amber-600 to-yellow-600">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-white" />
              <span className="text-sm font-black text-white uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>CONNECT WITH US</span>
            </div>
          </div>
          <div className="p-6">
            {/* Contact Info */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-charcoal" />
                <span className="text-sm">{aboutData.contact.email}</span>
              </div>
              <div className="hidden sm:block text-charcoal">•</div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-charcoal" />
                <span className="text-sm">{aboutData.contact.phone}</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex justify-center space-x-3">
              {socialLinks.length > 0 ? (
                socialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 border-black transition-transform hover:scale-110 ${getSocialIconColor(link.platform)}`}
                    title={link.label}
                  >
                    {getSocialIcon(link.platform)}
                  </a>
                ))
              ) : (
                Object.entries(aboutData.contact.socialMedia).map(([platform, url]) => (
                  url && (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 border-black transition-transform hover:scale-110 ${getSocialIconColor(platform)}`}
                    >
                      {getSocialIcon(platform)}
                    </a>
                  )
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutKebele;
