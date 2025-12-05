 import React, { useState, useEffect } from 'react';
import { Users, Award, MapPin, Mail, Phone, Globe, Heart, Target, Eye, Star, Zap, Shield } from 'lucide-react';

interface AboutData {
  title: string;
  content: string;
  summary: string;
  mission: string;
  vision: string;
  values: string[];
  history: string;
  team: Array<{
    name: string;
    role: string;
    bio: string;
    image: string;
    socialLinks: {
      linkedin?: string;
      twitter?: string;
      instagram?: string;
      website?: string;
    };
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
  title: "About Kebele",
  summary: "Empowering Ethiopian communities through culture, commerce, and connection",
  mission: "To preserve and promote Ethiopian cultural heritage while fostering economic growth and community development through innovative digital platforms.",
  vision: "To become the leading digital hub connecting Ethiopians worldwide, celebrating our rich culture, supporting local businesses, and building stronger communities.",
  values: ["Cultural Preservation", "Community Empowerment", "Innovation", "Excellence", "Unity"],
  history: "Founded in 2020, Kebele emerged from a vision to bridge the gap between traditional Ethiopian culture and modern digital platforms. What started as a small community project has grown into a comprehensive ecosystem serving millions across the diaspora.",
  content: "Kebele represents the heart of Ethiopian community - the traditional neighborhood unit that forms the foundation of our social structure. Our platform brings this concept to the digital age, creating spaces where culture thrives, businesses flourish, and communities connect.",
  team: [
    {
      name: "Alemayehu Tadesse",
      role: "Founder & CEO",
      bio: "Visionary leader with 15+ years in tech and cultural preservation",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      socialLinks: {
        linkedin: "https://linkedin.com/in/alemayehu",
        twitter: "@alemayehu"
      }
    },
    {
      name: "Meseret Haile",
      role: "Cultural Director",
      bio: "Ethnomusicologist and cultural heritage expert",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
      socialLinks: {
        instagram: "@meseret_culture"
      }
    },
    {
      name: "Dawit Bekele",
      role: "Tech Lead",
      bio: "Full-stack developer passionate about cultural tech solutions",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      socialLinks: {
        linkedin: "https://linkedin.com/in/dawitbekele",
        website: "https://dawit.dev"
      }
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
    // Simulate API loading
    const loadAboutData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAboutData(mockAboutData);
      setLoading(false);
    };
    loadAboutData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <div className="text-white font-bold text-lg">Loading...</div>
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Simple header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About <span className="text-amber-600">Kebele</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {aboutData.summary}
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <Target className="w-6 h-6 text-amber-600" />
              <h2 className="text-xl font-semibold text-gray-900">Our Mission</h2>
            </div>
            <p className="text-gray-700">
              {aboutData.mission}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <Eye className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Our Vision</h2>
            </div>
            <p className="text-gray-700">
              {aboutData.vision}
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {aboutData.values.map((value, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{value}</h3>
                <p className="text-gray-600 text-sm">
                  {value === "Cultural Preservation" && "Honoring and safeguarding Ethiopia's rich cultural heritage for future generations."}
                  {value === "Community Empowerment" && "Building stronger communities through collaboration and shared prosperity."}
                  {value === "Innovation" && "Embracing technology to enhance traditional practices and create new opportunities."}
                  {value === "Excellence" && "Striving for the highest quality in everything we do."}
                  {value === "Unity" && "Fostering connections among Ethiopians worldwide."}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white p-8 rounded-lg shadow-sm mb-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">By the Numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {aboutData.stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold text-amber-600 mb-1">{stat.value}</div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* History & Team */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* History */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h2>
            <p className="text-gray-700 mb-4">
              {aboutData.history}
            </p>
          </div>

          {/* Team */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <div className="space-y-4">
              {aboutData.team.map((member, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-amber-600 text-sm">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Get In Touch</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-amber-600" />
                <div>
                  <div className="font-medium text-gray-900">Email</div>
                  <div className="text-gray-600">{aboutData.contact.email}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-amber-600" />
                <div>
                  <div className="font-medium text-gray-900">Phone</div>
                  <div className="text-gray-600">{aboutData.contact.phone}</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-amber-600 mt-1" />
                <div>
                  <div className="font-medium text-gray-900">Address</div>
                  <div className="text-gray-600 text-sm">
                    {aboutData.contact.address.street}<br />
                    {aboutData.contact.address.city}, {aboutData.contact.address.country}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Follow Us</h3>
              <div className="flex flex-wrap gap-3">
                {Object.entries(aboutData.contact.socialMedia).map(([platform, url]) => (
                  url && (
                    <a
                      key={platform}
                      href={url}
                      className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-amber-100 transition-colors"
                    >
                      <span className="text-gray-600 font-medium text-sm capitalize">{platform[0]}</span>
                    </a>
                  )
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutKebele;