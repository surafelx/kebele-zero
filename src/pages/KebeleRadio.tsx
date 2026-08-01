 import React, { useState, useEffect } from 'react';
import { Play, Radio, Search } from 'lucide-react';
import { mediaAPI, radioAPI, videosAPI } from '../services/content';
import ModalLoader from '../components/ModalLoader';

interface Video {
  id: string;
  title: string;
  description: string;
  youtube_id: string;
  youtube_url: string;
  source: string;
  soundcloudUrl: string;
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


const KebeleRadio: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  // Only the clicked video loads its iframe — avoids 16 simultaneous YouTube players
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  useEffect(() => {
    loadVideos();
    loadCategories();
  }, []);

  const loadVideos = async () => {
    try {
      const [stationData, videoData] = await Promise.all([
        radioAPI.getStations(),
        videosAPI.getAdminVideos().catch(() => []),
      ]);
      const stationVideos: Video[] = (stationData || []).map((station: any) => ({
        id: station._id || station.id,
        title: station.name || station.title,
        description: station.description || '',
        youtube_id: station.streamUrl || station.youtube_id || '',
        youtube_url: station.streamUrl || station.youtube_url || '',
        source: station.source || 'youtube',
        soundcloudUrl: station.soundcloudUrl || '',
        category: station.genre || station.category || 'music',
        tags: station.tags || [],
        duration: station.duration || '0:00',
        published_at: station.createdAt || station.published_at || new Date().toISOString(),
        statistics: station.statistics || { view_count: 0, like_count: 0, comment_count: 0 },
        is_active: station.isActive !== false,
        is_featured: station.is_featured || false
      }));
      const mediaVideos: Video[] = (videoData || []).map((vid: any) => ({
        id: vid._id || vid.id,
        title: vid.title || 'Untitled',
        description: vid.description || '',
        youtube_id: vid.youtubeId || '',
        youtube_url: vid.youtubeId ? `https://www.youtube.com/watch?v=${vid.youtubeId}` : '',
        source: 'youtube',
        soundcloudUrl: '',
        category: vid.category || 'music',
        tags: [],
        duration: '0:00',
        published_at: vid.publishedAt || vid.createdAt || new Date().toISOString(),
        statistics: { view_count: 0, like_count: 0, comment_count: 0 },
        is_active: vid.isPublic !== false,
        is_featured: false
      }));
      const seen = new Set<string>();
      const merged: Video[] = [];
      for (const v of [...stationVideos, ...mediaVideos]) {
        const key = v.youtube_id || v.title;
        if (!seen.has(key)) {
          seen.add(key);
          merged.push(v);
        }
      }
      setVideos(merged);
    } catch (error) {
      console.error('Error loading videos:', error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const [stationData, videoData] = await Promise.all([
        radioAPI.getStations(),
        videosAPI.getAdminVideos().catch(() => []),
      ]);
      const cats = [...new Set([
        ...(stationData || []).map((s: any) => s.genre || s.category),
        ...(videoData || []).map((v: any) => v.category),
      ].filter(Boolean))] as string[];
      setCategories(cats);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    }
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Client-side search + category filter
  const filteredVideos = videos.filter(v => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = !q ||
      v.title.toLowerCase().includes(q) ||
      v.description.toLowerCase().includes(q) ||
      (v.tags && v.tags.some(t => t.toLowerCase().includes(q)));
    const matchesCategory = !selectedCategory || v.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <ModalLoader label="Loading Radio..." fullHeight />;

  return (
    <div className="min-h-screen retro-bg retro-bg-enhanced">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section - Smaller */}
        <div className="retro-window mb-8">
          <div className="retro-titlebar retro-titlebar-emerald">
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
          {filteredVideos.length === 0 ? (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((video) => (
                <div key={video.id} className="retro-window retro-floating overflow-hidden flex flex-col">
                  {/* Thumbnail with lazy play — iframe only loads on click */}
                  <div className="aspect-video bg-black relative overflow-hidden group">
                    {activeVideoId === video.id ? (
                      video.source === 'soundcloud' && video.soundcloudUrl ? (
                        <iframe
                          src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(video.soundcloudUrl)}&auto_play=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=false`}
                          title={video.title}
                          className="w-full h-full"
                          frameBorder="0"
                          allow="autoplay"
                        ></iframe>
                      ) : video.youtube_id ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${video.youtube_id}?autoplay=1`}
                          title={video.title}
                          className="w-full h-full"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-900">
                          <Play className="w-12 h-12 text-gray-500" />
                        </div>
                      )
                    ) : (
                      <button
                        onClick={() => setActiveVideoId(video.id)}
                        className="absolute inset-0 w-full h-full"
                        title={`Play ${video.title}`}
                      >
                        {video.source === 'soundcloud' && video.soundcloudUrl ? (
                          <div className="w-full h-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
                            <svg className="w-16 h-16 text-white" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M1 18V11h1v7H1zm2.5 0V9h1v9h-1zm2.5 0V10h1v8H6zm2.5 0V7h1v11h-1zm2.5 0V9h1v9h-1zm2.5 0V6h1v12h-1zm2.5 0V8h1v10h-1zm2.5 0V4h1v14h-1z"/>
                            </svg>
                          </div>
                        ) : (
                          <>
                            <img
                              src={`https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`}
                              alt={video.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                              <div className="w-14 h-14 bg-coral-red rounded-full flex items-center justify-center border-2 border-white shadow-xl group-hover:scale-110 transition-transform">
                                <Play className="w-6 h-6 text-white ml-1" fill="white" />
                              </div>
                            </div>
                          </>
                        )}
                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-mustard text-charcoal rounded retro-title text-xs font-bold uppercase border-2 border-charcoal">
                          {video.category}
                        </span>
                        {/* Source badge */}
                        <span className={`absolute top-2 right-2 px-2 py-0.5 rounded retro-title text-xs font-bold uppercase border-2 border-white ${
                          video.source === 'soundcloud' ? 'bg-orange-500 text-white' : 'bg-red-600 text-white'
                        }`}>
                          {video.source === 'soundcloud' ? '♪ SC' : '▶ YT'}
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Video Content */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="retro-title text-base font-bold mb-2 leading-tight uppercase line-clamp-2">
                      {video.title}
                    </h3>

                    {/* Tags */}
                    {video.tags && video.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {video.tags.slice(0, 4).map((tag, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-teal-100 text-teal-700 border border-teal-300 rounded retro-text text-[10px] font-bold uppercase">
                            {tag}
                          </span>
                        ))}
                        {video.tags.length > 4 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 border border-gray-300 rounded retro-text text-[10px] font-bold">
                            +{video.tags.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    {video.description && (
                      <p className="retro-text text-xs mb-3 leading-relaxed opacity-80 line-clamp-2 flex-1">
                        {video.description}
                      </p>
                    )}

                    {/* Source links */}
                    <div className="flex items-center gap-2 pt-2 border-t-2 border-charcoal/10 mt-auto">
                      {video.source === 'soundcloud' && video.soundcloudUrl ? (
                        <a
                          href={video.soundcloudUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded retro-text text-[10px] font-bold uppercase hover:opacity-90 transition-opacity"
                        >
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M1 18V11h1v7H1zm2.5 0V9h1v9h-1zm2.5 0V10h1v8H6zm2.5 0V7h1v11h-1zm2.5 0V9h1v9h-1zm2.5 0V6h1v12h-1zm2.5 0V8h1v10h-1zm2.5 0V4h1v14h-1z"/>
                          </svg>
                          <span>SoundCloud</span>
                        </a>
                      ) : null}
                      {video.youtube_id ? (
                        <a
                          href={`https://www.youtube.com/watch?v=${video.youtube_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-red-600 text-white rounded retro-text text-[10px] font-bold uppercase hover:bg-red-700 transition-colors"
                        >
                          <Play className="w-3 h-3" fill="white" />
                          <span>YouTube</span>
                        </a>
                      ) : null}
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
              <button className="retro-btn-secondary text-lg py-4 px-8 font-bold uppercase">
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