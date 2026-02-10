 import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Heart, Share2, ThumbsUp, Music, Film, Coffee, Mic, Radio, Headphones, Star, Search } from 'lucide-react';
import { videosAPI, radioAPI } from '../services/content';

interface Video {
  id: string;
  title: string;
  description: string;
  youtube_id: string;
  youtube_url: string;
  category: string;
  tags: string[];
  duration: string;
  published_at: string;
  statistics: {
    view_count: number;
    like_count: number;
    comment_count: number;
  };
  is_active: boolean;
  is_featured: boolean;
}

// Mock videos data - Fallback when no Supabase data
const mockVideos: Video[] = [
  {
    id: "1",
    title: "Traditional Ethiopian Music: Azmari Performance",
    description: "Experience the soulful sounds of traditional Ethiopian azmari music performed by master musicians in Addis Ababa.",
    youtube_id: "dQw4w9WgXcQ",
    youtube_url: "https://youtube.com/watch?v=dQw4w9WgXcQ",
    category: "Music",
    tags: ["azmari", "traditional", "ethiopian music", "live performance"],
    duration: "12:34",
    published_at: "2024-11-15T10:00:00Z",
    statistics: {
      view_count: 15420,
      like_count: 892,
      comment_count: 45
    },
    is_active: true,
    is_featured: true
  },
  {
    id: "2",
    title: "Ethiopian Coffee Ceremony Documentary",
    description: "A deep dive into the cultural significance and ritual of the traditional Ethiopian coffee ceremony.",
    youtube_id: "dQw4w9WgXcQ",
    youtube_url: "https://youtube.com/watch?v=dQw4w9WgXcQ",
    category: "Culture",
    tags: ["coffee", "ceremony", "culture", "documentary"],
    duration: "18:45",
    published_at: "2024-11-10T14:30:00Z",
    statistics: {
      view_count: 28340,
      like_count: 1245,
      comment_count: 78
    },
    is_active: true,
    is_featured: true
  },
  {
    id: "3",
    title: "Modern Ethiopian Hip Hop: New Generation",
    description: "Exploring the fusion of traditional Ethiopian sounds with contemporary hip hop from Addis Ababa's underground scene.",
    youtube_id: "dQw4w9WgXcQ",
    youtube_url: "https://youtube.com/watch?v=dQw4w9WgXcQ",
    category: "Music",
    tags: ["hip hop", "modern", "fusion", "addis ababa"],
    duration: "8:22",
    published_at: "2024-11-08T16:15:00Z",
    statistics: {
      view_count: 9876,
      like_count: 567,
      comment_count: 23
    },
    is_active: true,
    is_featured: false
  },
  {
    id: "4",
    title: "Ethiopian Orthodox Church Chants",
    description: "Sacred chants from the Ethiopian Orthodox Church, performed during traditional ceremonies and holidays.",
    youtube_id: "dQw4w9WgXcQ",
    youtube_url: "https://youtube.com/watch?v=dQw4w9WgXcQ",
    category: "Religious",
    tags: ["orthodox", "chants", "religious", "sacred"],
    duration: "15:12",
    published_at: "2024-11-05T09:45:00Z",
    statistics: {
      view_count: 19234,
      like_count: 756,
      comment_count: 34
    },
    is_active: true,
    is_featured: true
  },
  {
    id: "5",
    title: "Ethiopian Storytelling: Oral Traditions",
    description: "Traditional Ethiopian storytelling and oral traditions passed down through generations.",
    youtube_id: "dQw4w9WgXcQ",
    youtube_url: "https://youtube.com/watch?v=dQw4w9WgXcQ",
    category: "Culture",
    tags: ["storytelling", "oral", "traditions", "folklore"],
    duration: "22:18",
    published_at: "2024-11-03T11:20:00Z",
    statistics: {
      view_count: 7654,
      like_count: 432,
      comment_count: 18
    },
    is_active: true,
    is_featured: false
  }
];

const mockCategories = ["Music", "Culture", "Religious", "Documentary", "Entertainment", "Education"];

const KebeleRadio: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    loadVideos();
    loadCategories();
  }, [searchTerm, selectedCategory]);

  const loadVideos = async () => {
    try {
      // Fetch from Supabase
      const data = await videosAPI.getVideos({
        category: selectedCategory || undefined
      });
      
      // Transform Supabase data to match component format
      if (data && data.length > 0) {
        const transformedVideos: Video[] = data.map(video => ({
          id: video.id,
          title: video.title,
          description: video.description,
          youtube_id: video.youtube_id,
          youtube_url: video.youtube_url,
          category: video.category,
          tags: video.tags || [],
          duration: video.duration || '0:00',
          published_at: video.published_at,
          statistics: video.statistics || { view_count: 0, like_count: 0, comment_count: 0 },
          is_active: video.is_active,
          is_featured: video.is_featured
        }));
        setVideos(transformedVideos);
      } else {
        // Fallback to mock data
        let filteredVideos = mockVideos;
        if (searchTerm) {
          filteredVideos = filteredVideos.filter(video =>
            video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            video.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
          );
        }
        if (selectedCategory) {
          filteredVideos = filteredVideos.filter(video => video.category === selectedCategory);
        }
        setVideos(filteredVideos);
      }
    } catch (error) {
      console.error('Error loading videos:', error);
      // Fallback to mock data on error
      let filteredVideos = mockVideos;
      if (searchTerm) {
        filteredVideos = filteredVideos.filter(video =>
          video.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      if (selectedCategory) {
        filteredVideos = filteredVideos.filter(video => video.category === selectedCategory);
      }
      setVideos(filteredVideos);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      // Fetch categories from Supabase
      const data = await videosAPI.getCategories();
      if (data && data.length > 0) {
        setCategories(data);
      } else {
        setCategories(mockCategories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories(mockCategories);
    }
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center">
        <div className="retro-window retro-floating text-center p-8 max-w-sm w-full">
          <div className="retro-titlebar retro-titlebar-teal mb-4">
            <div className="flex items-center justify-center">
              <Radio className="w-5 h-5 retro-icon" />
            </div>
            <div className="retro-window-controls">
              <div className="retro-window-dot"></div>
              <div className="retro-window-dot"></div>
              <div className="retro-window-dot"></div>
            </div>
          </div>
          <div className="retro-spinner w-16 h-16 mx-auto mb-6"></div>
          <div className="retro-title text-lg font-bold uppercase tracking-wider">Loading Radio...</div>
          <p className="retro-text text-sm mt-4 opacity-80">Discovering amazing Ethiopian content</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen retro-bg retro-bg-enhanced">
      {/* Modal Header */}
      <div className="bg-white border-b-4 border-black py-4 px-6 sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl retro-title text-gray-800 uppercase tracking-tight font-bold">RADIO MODAL</h1>
            <p className="retro-text text-gray-600 uppercase tracking-wide text-sm">Ethiopian music, culture & stories</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center border-2 border-black shadow-md">
              <Radio className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section - Smaller */}
        <div className="retro-window mb-8">
          <div className="retro-titlebar retro-titlebar-teal">
            <div className="flex items-center space-x-3">
              <Radio className="w-4 h-4 retro-icon" />
              <span className="retro-title text-xs font-bold uppercase">KEBELE RADIO</span>
            </div>
            <div className="retro-window-controls">
              <div className="retro-window-dot"></div>
              <div className="retro-window-dot"></div>
              <div className="retro-window-dot"></div>
            </div>
          </div>
          <div className="p-4 text-center">
            <h1 className="text-xl md:text-2xl retro-title mb-3 leading-tight uppercase tracking-tight">
              ETHIOPIAN CULTURE & MUSIC
            </h1>
            <p className="text-xs md:text-sm retro-text max-w-2xl mx-auto leading-relaxed">
              Discover Ethiopian music, culture, and stories through our curated collection of videos and audio content.
            </p>
          </div>
        </div>

        {/* Search and Filters - Minimal */}
        <div className="retro-window mb-8">
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-charcoal w-4 h-4 retro-icon" />
                  <input
                    type="text"
                    placeholder="Search videos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 retro-input text-xs"
                  />
                </div>
              </div>
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 retro-input bg-paper text-xs"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Videos Grid */}
        <div className="mb-8">
          {videos.length === 0 ? (
            <div className="retro-window retro-floating text-center p-12">
              <div className="retro-titlebar retro-titlebar-teal mb-6">
                <div className="flex items-center space-x-3">
                  <Radio className="w-5 h-5 retro-icon" />
                  <span className="retro-title text-sm font-bold uppercase">NO CONTENT FOUND</span>
                </div>
                <div className="retro-window-controls">
                  <div className="retro-window-dot"></div>
                  <div className="retro-window-dot"></div>
                  <div className="retro-window-dot"></div>
                </div>
              </div>
              <div className="w-16 h-16 bg-mustard rounded-lg flex items-center justify-center mx-auto mb-6 border-2 border-charcoal">
                <Radio className="w-8 h-8 text-charcoal retro-icon" />
              </div>
              <h3 className="retro-title text-xl font-bold mb-4 uppercase tracking-wide">No Content Found</h3>
              <p className="retro-text text-base">Try adjusting your search criteria or check back later for new content.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map((video) => (
                <div key={video.id} className="retro-window retro-floating overflow-hidden">
                  {/* Embedded YouTube Video */}
                  <div className="aspect-video bg-black rounded-t-lg overflow-hidden">
                    <iframe
                      src={`https://www.youtube.com/embed/${video.youtube_id}`}
                      title={video.title}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>

                  {/* Video Content */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-3 py-1 bg-mustard text-charcoal rounded-lg retro-title text-sm font-bold uppercase border-2 border-charcoal">
                        {video.category}
                      </span>
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="flex items-center space-x-1 retro-text text-charcoal">
                          <Play className="w-4 h-4 retro-icon" />
                          <span className="retro-title text-sm font-bold">{video.statistics.view_count.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <h3 className="retro-title text-lg font-bold mb-2 leading-tight uppercase">
                      {video.title}
                    </h3>

                    <p className="retro-text text-sm mb-4 leading-relaxed opacity-90">
                      {video.description.length > 100 ? `${video.description.substring(0, 100)}...` : video.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <Heart className="w-4 h-4 text-coral-red retro-icon" />
                          <span className="retro-text text-sm font-bold">{video.statistics.like_count}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ThumbsUp className="w-4 h-4 text-sky-blue retro-icon" />
                          <span className="retro-text text-sm font-bold">{video.statistics.comment_count}</span>
                        </div>
                      </div>
                      <button className="retro-btn text-sm py-2 px-4 font-bold uppercase">
                        FULLSCREEN
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="retro-window retro-floating text-center">
          <div className="retro-titlebar retro-titlebar-teal">
            <div className="flex items-center space-x-3">
              <Radio className="w-5 h-5 retro-icon" />
              <span className="retro-title text-sm font-bold uppercase">EXPERIENCE ETHIOPIAN CULTURE</span>
            </div>
            <div className="retro-window-controls">
              <div className="retro-window-dot"></div>
              <div className="retro-window-dot"></div>
              <div className="retro-window-dot"></div>
            </div>
          </div>
          <div className="p-8">
            <h2 className="retro-title text-2xl font-bold mb-4 uppercase tracking-wide">VISUAL STORYTELLING</h2>
            <p className="retro-text text-base mb-6 max-w-2xl mx-auto leading-relaxed">
              Immerse yourself in the rich sounds and stories of Ethiopia through our carefully curated media collection.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="retro-btn text-lg py-4 px-8 font-bold uppercase">
                BROWSE ALL CONTENT
              </button>
              <button className="bg-paper text-charcoal px-8 py-4 rounded-lg retro-title text-lg font-bold uppercase border-2 border-charcoal hover:bg-mustard hover:text-charcoal transition-colors">
                SUBMIT CONTENT
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KebeleRadio;