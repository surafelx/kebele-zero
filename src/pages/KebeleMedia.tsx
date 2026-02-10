import React, { useState, useEffect } from 'react';
import { Image, X, Calendar, Tag, Search, Upload, Plus } from 'lucide-react';
import { supabase } from '../services/supabase';

interface MediaItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  date: string;
}

// Mock media data
const mockMedia: MediaItem[] = [
  {
    id: "1",
    title: "Traditional Ethiopian Wedding",
    description: "Beautiful celebration of love and culture in the highlands",
    imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop",
    category: "Culture",
    date: "2024-10-15"
  },
  {
    id: "2",
    title: "Coffee Ceremony in Action",
    description: "The ancient ritual of Ethiopian coffee preparation",
    imageUrl: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&h=400&fit=crop",
    category: "Tradition",
    date: "2024-09-22"
  },
  {
    id: "3",
    title: "Ethiopian Orthodox Church",
    description: "Sacred architecture and spiritual atmosphere",
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop",
    category: "Religion",
    date: "2024-08-30"
  },
  {
    id: "4",
    title: "Market Day in Addis Ababa",
    description: "Vibrant local markets showcasing Ethiopian craftsmanship",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop",
    category: "Commerce",
    date: "2024-07-18"
  },
  {
    id: "5",
    title: "Simien Mountains Landscape",
    description: "Breathtaking natural beauty of Ethiopia's highlands",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&h=400&fit=crop",
    category: "Nature",
    date: "2024-06-12"
  },
  {
    id: "6",
    title: "Traditional Music Performance",
    description: "Azmari musicians bringing ancient melodies to life",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop",
    category: "Music",
    date: "2024-05-28"
  },
  {
    id: "7",
    title: "Ethiopian Textile Art",
    description: "Intricate patterns and vibrant colors of traditional weaving",
    imageUrl: "https://images.unsplash.com/photo-1601762603332-db5e4b90cc5d?w=600&h=400&fit=crop",
    category: "Art",
    date: "2024-04-15"
  },
  {
    id: "8",
    title: "Children at Play",
    description: "Joyful moments of Ethiopian youth in traditional settings",
    imageUrl: "https://images.unsplash.com/photo-1524503033411-c9566986fc8d?w=600&h=400&fit=crop",
    category: "Community",
    date: "2024-03-20"
  }
];

const KebeleMedia: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchMediaItems();
  }, []);

  const fetchMediaItems = async () => {
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform database format to component format
      const transformedData = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        imageUrl: item.media_url,
        category: item.category || 'General',
        date: item.created_at
      }));

      setMediaItems(transformedData);
    } catch (error) {
      console.error('Error fetching media:', error);
      // Fallback to mock data if database fails
      setMediaItems(mockMedia);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File, title: string, description: string, category: string) => {
    setUploading(true);
    try {
      // Upload to Supabase Storage (assuming you have storage set up)
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `media/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      // Save to database
      const { error: dbError } = await supabase
        .from('media')
        .insert([{
          title,
          description,
          media_url: publicUrl,
          category,
          media_type: 'image',
          is_active: true
        }]);

      if (dbError) throw dbError;

      setShowUploadModal(false);
      fetchMediaItems(); // Refresh the list
    } catch (error) {
      console.error('Error uploading media:', error);
      alert('Error uploading media. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const filteredMedia = mediaItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(mediaItems.map(item => item.category))];

  // Upload Modal Component
  const UploadModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onUpload: (file: File, title: string, description: string, category: string) => void;
    uploading: boolean;
  }> = ({ isOpen, onClose, onUpload, uploading }) => {
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('General');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (file && title) {
        onUpload(file, title, description, category);
        setFile(null);
        setTitle('');
        setDescription('');
        setCategory('General');
      }
    };

    return (
      <div className="fixed inset-0 z-50 retro-modal flex items-center justify-center p-4">
        <div className="retro-modal-content max-w-md w-full max-h-[90vh] overflow-hidden retro-floating">
          <div className="retro-titlebar">
            <div className="flex items-center space-x-3">
              <Upload className="w-4 h-4 retro-icon" />
              <span className="retro-title text-sm">Upload Media</span>
            </div>
            <button
              onClick={onClose}
              className="retro-btn text-sm w-6 h-6 p-0 flex items-center justify-center"
            >
              ×
            </button>
          </div>
          <div className="p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold retro-text mb-2">Image File</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="retro-input w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold retro-text mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="retro-input w-full"
                  placeholder="Enter image title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold retro-text mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="retro-input w-full resize-none"
                  rows={3}
                  placeholder="Describe the image"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold retro-text mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="retro-input w-full bg-white"
                >
                  <option value="Culture">Culture</option>
                  <option value="Tradition">Tradition</option>
                  <option value="Nature">Nature</option>
                  <option value="Community">Community</option>
                  <option value="Art">Art</option>
                  <option value="Music">Music</option>
                  <option value="Religion">Religion</option>
                  <option value="General">General</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={uploading || !file || !title}
                  className="flex-1 retro-btn-success py-2 px-4 disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="retro-btn-secondary py-2 px-4"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen retro-bg retro-bg-enhanced">
      {/* Modal Header */}
      <div className="bg-white border-b-4 border-black py-4 px-6 sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl retro-title text-gray-800 uppercase tracking-tight font-bold">MEDIA MODAL</h1>
            <p className="retro-text text-gray-600 uppercase tracking-wide text-sm">Visual tapestry of Ethiopian culture</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center border-2 border-black shadow-md">
              <Image className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section - Smaller */}
        <div className="retro-window mb-8">
          <div className="retro-titlebar retro-titlebar-sky">
            <div className="flex items-center space-x-3">
              <Image className="w-4 h-4 retro-icon" />
              <span className="retro-title text-xs font-bold uppercase">KEBELE MEDIA</span>
            </div>
            <div className="retro-window-controls">
              <div className="retro-window-dot"></div>
              <div className="retro-window-dot"></div>
              <div className="retro-window-dot"></div>
            </div>
          </div>
          <div className="p-4 text-center">
            <h1 className="text-xl md:text-2xl retro-title mb-3 leading-tight uppercase tracking-tight">
              VISUAL TAPESTRY OF ETHIOPIA
            </h1>
            <p className="text-xs md:text-sm retro-text max-w-2xl mx-auto leading-relaxed">
              Explore the visual tapestry of Ethiopian culture through our curated collection of photographs capturing the essence of our heritage.
            </p>
          </div>
        </div>

        {/* Search and Filters - Minimal */}
        <div className="retro-window mb-8">
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-charcoal w-4 h-4 retro-icon" />
                  <input
                    type="text"
                    placeholder="Search media..."
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
              <div>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="w-full retro-btn px-4 py-2 flex items-center justify-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span className="text-xs">Upload</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Grid - Enhanced Visual Layout */}
        <div className="mb-8">
          {loading ? (
            <div className="retro-window retro-floating text-center p-12">
              <div className="retro-spinner w-16 h-16 mx-auto mb-6"></div>
              <p className="retro-text text-lg">Loading media gallery...</p>
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="retro-window retro-floating text-center p-12">
              <div className="retro-titlebar retro-titlebar-sky mb-6">
                <div className="flex items-center space-x-3">
                  <Image className="w-5 h-5 retro-icon" />
                  <span className="retro-title text-sm font-bold uppercase">NO MEDIA FOUND</span>
                </div>
                <div className="retro-window-controls">
                  <div className="retro-window-dot"></div>
                  <div className="retro-window-dot"></div>
                  <div className="retro-window-dot"></div>
                </div>
              </div>
              <div className="w-16 h-16 bg-mustard rounded-lg flex items-center justify-center mx-auto mb-6 border-2 border-charcoal">
                <Image className="w-8 h-8 text-charcoal retro-icon" />
              </div>
              <h3 className="retro-title text-xl font-bold mb-4 uppercase tracking-wide">No Media Found</h3>
              <p className="retro-text text-base">Try adjusting your search criteria or check back later for new content.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Featured Image - Large Hero */}
              {filteredMedia[0] && (
                <div className="retro-window retro-floating overflow-hidden">
                  <div className="retro-titlebar retro-titlebar-coral">
                    <div className="flex items-center space-x-3">
                      <span className="retro-title text-sm font-bold uppercase">FEATURED</span>
                    </div>
                    <div className="retro-window-controls">
                      <div className="retro-window-dot"></div>
                      <div className="retro-window-dot"></div>
                      <div className="retro-window-dot"></div>
                    </div>
                  </div>
                  <div className="relative">
                    <img
                      src={filteredMedia[0].imageUrl}
                      alt={filteredMedia[0].title}
                      className="w-full h-96 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="px-4 py-2 bg-paper text-charcoal rounded-lg retro-title text-sm font-bold uppercase border-2 border-charcoal">
                          {filteredMedia[0].category}
                        </span>
                        <span className="retro-title text-sm font-bold">
                          {new Date(filteredMedia[0].date).getFullYear()}
                        </span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold mb-2 retro-title">{filteredMedia[0].title}</h2>
                      <p className="text-lg opacity-90 leading-relaxed max-w-2xl">{filteredMedia[0].description}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Gallery Grid - Remaining Images */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMedia.slice(1).map((item, index) => (
                  <div key={item.id} className="retro-window retro-floating overflow-hidden group cursor-pointer">
                    {/* Image Container */}
                    <div className="aspect-[4/3] overflow-hidden relative">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 group-hover:from-black/60 transition-all duration-300"></div>

                      {/* Category Badge */}
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-2 bg-paper text-charcoal rounded-lg retro-title text-sm font-bold uppercase border-2 border-charcoal shadow-2xl transform -rotate-3 group-hover:rotate-0 transition-transform duration-300">
                          {item.category}
                        </span>
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-paper text-charcoal px-4 py-2 rounded-lg retro-title text-sm font-bold uppercase border-2 border-charcoal shadow-2xl">
                          VIEW FULL SIZE
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="retro-title text-base font-bold uppercase line-clamp-2 group-hover:text-sky-blue transition-colors">
                          {item.title}
                        </h3>
                        <span className="retro-title text-sm font-bold text-charcoal">
                          {new Date(item.date).getFullYear()}
                        </span>
                      </div>

                      <p className="retro-text text-sm mb-4 leading-relaxed opacity-90">
                        {item.description.length > 80 ? `${item.description.substring(0, 80)}...` : item.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="retro-text text-xs opacity-70">
                          Click to enlarge
                        </span>
                        <button className="retro-btn text-xs py-2 px-4 font-bold uppercase">
                          VIEW
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="retro-window retro-floating text-center">
          <div className="retro-titlebar retro-titlebar-teal">
            <div className="flex items-center space-x-3">
              <Image className="w-5 h-5 retro-icon" />
              <span className="retro-title text-sm font-bold uppercase">CAPTURING ETHIOPIAN CULTURE</span>
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
              Our media gallery showcases the beauty, diversity, and richness of Ethiopian heritage through stunning visual storytelling.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="retro-btn text-lg py-4 px-8 font-bold uppercase">
                EXPLORE MORE
              </button>
              <button className="bg-paper text-charcoal px-8 py-4 rounded-lg retro-title text-lg font-bold uppercase border-2 border-charcoal hover:bg-mustard hover:text-charcoal transition-colors">
                SUBMIT PHOTOS
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
        uploading={uploading}
      />
    </div>
  );
};

export default KebeleMedia;