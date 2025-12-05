import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Heart, Share2, ThumbsUp, Music, Film, Coffee, Mic, Radio, Headphones, Star } from 'lucide-react';

interface Video {
  _id: string;
  title: string;
  description: string;
  youtubeId: string;
  youtubeUrl: string;
  category: string;
  tags: string[];
  thumbnail: {
    url: string;
    width: number;
    height: number;
  };
  duration: string;
  publishedAt: string;
  statistics: {
    viewCount: number;
    likeCount: number;
    commentCount: number;
  };
  isActive: boolean;
  isFeatured: boolean;
  formattedDuration: string;
  formattedViewCount: string;
}

// Mock videos data
const mockVideos: Video[] = [
  {
    _id: "1",
    title: "Traditional Ethiopian Music: Azmari Performance",
    description: "Experience the soulful sounds of traditional Ethiopian azmari music performed by master musicians in Addis Ababa.",
    youtubeId: "dQw4w9WgXcQ",
    youtubeUrl: "https://youtube.com/watch?v=dQw4w9WgXcQ",
    category: "Music",
    tags: ["azmari", "traditional", "ethiopian music", "live performance"],
    thumbnail: {
      url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=480&h=360&fit=crop",
      width: 480,
      height: 360
    },
    duration: "12:34",
    publishedAt: "2024-11-15T10:00:00Z",
    statistics: {
      viewCount: 15420,
      likeCount: 892,
      commentCount: 45
    },
    isActive: true,
    isFeatured: true,
    formattedDuration: "12:34",
    formattedViewCount: "15K"
  },
  {
    _id: "2",
    title: "Ethiopian Coffee Ceremony Documentary",
    description: "A deep dive into the cultural significance and ritual of the traditional Ethiopian coffee ceremony.",
    youtubeId: "dQw4w9WgXcQ",
    youtubeUrl: "https://youtube.com/watch?v=dQw4w9WgXcQ",
    category: "Culture",
    tags: ["coffee", "ceremony", "culture", "documentary"],
    thumbnail: {
      url: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=480&h=360&fit=crop",
      width: 480,
      height: 360
    },
    duration: "18:45",
    publishedAt: "2024-11-10T14:30:00Z",
    statistics: {
      viewCount: 28340,
      likeCount: 1245,
      commentCount: 78
    },
    isActive: true,
    isFeatured: true,
    formattedDuration: "18:45",
    formattedViewCount: "28K"
  },
  {
    _id: "3",
    title: "Modern Ethiopian Hip Hop: New Generation",
    description: "Exploring the fusion of traditional Ethiopian sounds with contemporary hip hop from Addis Ababa's underground scene.",
    youtubeId: "dQw4w9WgXcQ",
    youtubeUrl: "https://youtube.com/watch?v=dQw4w9WgXcQ",
    category: "Music",
    tags: ["hip hop", "modern", "fusion", "addis ababa"],
    thumbnail: {
      url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=480&h=360&fit=crop",
      width: 480,
      height: 360
    },
    duration: "8:22",
    publishedAt: "2024-11-08T16:15:00Z",
    statistics: {
      viewCount: 9876,
      likeCount: 567,
      commentCount: 23
    },
    isActive: true,
    isFeatured: false,
    formattedDuration: "8:22",
    formattedViewCount: "9.8K"
  },
  {
    _id: "4",
    title: "Ethiopian Orthodox Church Chants",
    description: "Sacred chants from the Ethiopian Orthodox Church, performed during traditional ceremonies and holidays.",
    youtubeId: "dQw4w9WgXcQ",
    youtubeUrl: "https://youtube.com/watch?v=dQw4w9WgXcQ",
    category: "Religious",
    tags: ["orthodox", "chants", "religious", "sacred"],
    thumbnail: {
      url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=480&h=360&fit=crop",
      width: 480,
      height: 360
    },
    duration: "15:12",
    publishedAt: "2024-11-05T09:45:00Z",
    statistics: {
      viewCount: 19234,
      likeCount: 756,
      commentCount: 34
    },
    isActive: true,
    isFeatured: true,
    formattedDuration: "15:12",
    formattedViewCount: "19K"
  },
  {
    _id: "5",
    title: "Ethiopian Storytelling: Oral Traditions",
    description: "Traditional Ethiopian storytelling and oral traditions passed down through generations.",
    youtubeId: "dQw4w9WgXcQ",
    youtubeUrl: "https://youtube.com/watch?v=dQw4w9WgXcQ",
    category: "Culture",
    tags: ["storytelling", "oral", "traditions", "folklore"],
    thumbnail: {
      url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=480&h=360&fit=crop",
      width: 480,
      height: 360
    },
    duration: "22:18",
    publishedAt: "2024-11-03T11:20:00Z",
    statistics: {
      viewCount: 7654,
      likeCount: 432,
      commentCount: 18
    },
    isActive: true,
    isFeatured: false,
    formattedDuration: "22:18",
    formattedViewCount: "7.6K"
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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

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
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setCategories(mockCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-400 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <div className="text-white font-bold text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Simple header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Kebele <span className="text-pink-600">Radio</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover Ethiopian music, culture, and stories through our curated radio experience.
          </p>
        </div>

        {/* Search and Filters - Minimal */}
        <div className="mb-12">
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                />
              </div>
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
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
            <div className="text-center py-12">
              <Radio className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No videos found</h3>
              <p className="text-gray-600">Try adjusting your search criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <div key={video._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  {/* Video Thumbnail */}
                  <div className="aspect-video overflow-hidden relative">
                    <img
                      src={video.thumbnail?.url}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-black/80 text-white rounded px-2 py-1 text-xs">
                      {video.formattedDuration}
                    </div>
                    {video.isFeatured && (
                      <div className="absolute top-4 right-4">
                        <span className="px-2 py-1 bg-pink-500 text-white rounded text-xs font-medium">
                          Featured
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Video Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {video.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {video.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="px-2 py-1 bg-pink-100 text-pink-800 rounded-full text-xs">
                        {video.category}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Play className="w-4 h-4" />
                        <span>{video.formattedViewCount}</span>
                      </div>
                    </div>
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

export default KebeleRadio;