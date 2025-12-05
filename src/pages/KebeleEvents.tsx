import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, MapPin, Clock, Users, Ticket, Star, Heart, Share2, Music, Film, BookOpen, Coffee, Zap, Sparkles } from 'lucide-react';

interface Event {
  _id: string;
  title: string;
  description: string;
  shortDescription: string;
  category: string;
  startDate: string;
  endDate: string;
  location: {
    venue: string;
    address: {
      city: string;
      country: string;
    };
  };
  images: Array<{ url: string; alt: string; isMain: boolean }>;
  tickets: Array<{
    type: string;
    name: string;
    price: number;
    quantity: number;
    sold: number;
    maxPerOrder: number;
  }>;
  organizer: {
    name: string;
  };
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  capacity: number;
  status: string;
}

// Mock events data
const mockEvents: Event[] = [
  {
    _id: "1",
    title: "Ethiopian Cultural Festival 2024",
    description: "A celebration of Ethiopian culture featuring traditional music, dance, food, and art from all regions of Ethiopia.",
    shortDescription: "Celebrate Ethiopian culture with music, dance, and traditional cuisine",
    category: "Cultural",
    startDate: "2024-12-15T18:00:00Z",
    endDate: "2024-12-15T23:00:00Z",
    location: {
      venue: "Addis Ababa Convention Center",
      address: { city: "Addis Ababa", country: "Ethiopia" }
    },
    images: [
      { url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop", alt: "Cultural festival", isMain: true },
      { url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop", alt: "Traditional dance", isMain: false }
    ],
    tickets: [
      { type: "general", name: "General Admission", price: 25, quantity: 500, sold: 120, maxPerOrder: 4 },
      { type: "vip", name: "VIP Experience", price: 75, quantity: 100, sold: 45, maxPerOrder: 2 }
    ],
    organizer: { name: "Ethiopian Cultural Society" },
    tags: ["culture", "music", "dance", "food"],
    isActive: true,
    isFeatured: true,
    capacity: 600,
    status: "upcoming"
  },
  {
    _id: "2",
    title: "Jazz Night: Ethiopian Fusion",
    description: "Experience the unique blend of traditional Ethiopian melodies with modern jazz improvisation.",
    shortDescription: "Ethiopian jazz fusion with renowned musicians",
    category: "Music",
    startDate: "2024-12-20T20:00:00Z",
    endDate: "2024-12-20T23:00:00Z",
    location: {
      venue: "Blue Nile Jazz Club",
      address: { city: "Addis Ababa", country: "Ethiopia" }
    },
    images: [
      { url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop", alt: "Jazz performance", isMain: true }
    ],
    tickets: [
      { type: "general", name: "General Admission", price: 35, quantity: 150, sold: 89, maxPerOrder: 4 }
    ],
    organizer: { name: "Blue Nile Entertainment" },
    tags: ["jazz", "music", "fusion", "live"],
    isActive: true,
    isFeatured: true,
    capacity: 150,
    status: "upcoming"
  },
  {
    _id: "3",
    title: "Coffee Ceremony Workshop",
    description: "Learn the art of traditional Ethiopian coffee ceremony and the cultural significance of coffee in Ethiopian society.",
    shortDescription: "Master the traditional Ethiopian coffee ceremony",
    category: "Workshop",
    startDate: "2024-12-10T14:00:00Z",
    endDate: "2024-12-10T17:00:00Z",
    location: {
      venue: "Cultural Heritage Center",
      address: { city: "Addis Ababa", country: "Ethiopia" }
    },
    images: [
      { url: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&h=600&fit=crop", alt: "Coffee ceremony", isMain: true }
    ],
    tickets: [
      { type: "workshop", name: "Workshop Ticket", price: 45, quantity: 30, sold: 18, maxPerOrder: 2 }
    ],
    organizer: { name: "Ethiopian Coffee Association" },
    tags: ["coffee", "ceremony", "culture", "workshop"],
    isActive: true,
    isFeatured: false,
    capacity: 30,
    status: "upcoming"
  },
  {
    _id: "4",
    title: "Timket Celebration",
    description: "Join the grand celebration of Timket, the Ethiopian Orthodox Christmas, with traditional processions and ceremonies.",
    shortDescription: "Celebrate Ethiopian Orthodox Christmas with traditional ceremonies",
    category: "Religious",
    startDate: "2025-01-19T06:00:00Z",
    endDate: "2025-01-19T18:00:00Z",
    location: {
      venue: "Holy Trinity Cathedral",
      address: { city: "Addis Ababa", country: "Ethiopia" }
    },
    images: [
      { url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop", alt: "Religious celebration", isMain: true }
    ],
    tickets: [
      { type: "free", name: "Free Entry", price: 0, quantity: 1000, sold: 234, maxPerOrder: 6 }
    ],
    organizer: { name: "Ethiopian Orthodox Church" },
    tags: ["timket", "christmas", "religious", "tradition"],
    isActive: true,
    isFeatured: true,
    capacity: 1000,
    status: "upcoming"
  }
];

const mockCategories = ["Cultural", "Music", "Workshop", "Religious", "Sports", "Art", "Food"];

const KebeleEvents: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    loadEvents();
    loadCategories();
  }, [searchTerm, selectedCategory, selectedStatus]);

  const loadEvents = async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      let filteredEvents = mockEvents;

      if (searchTerm) {
        filteredEvents = filteredEvents.filter(event =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      if (selectedCategory) {
        filteredEvents = filteredEvents.filter(event => event.category === selectedCategory);
      }

      if (selectedStatus) {
        filteredEvents = filteredEvents.filter(event => event.status === selectedStatus);
      }

      setEvents(filteredEvents);
    } catch (error) {
      console.error('Error loading events:', error);
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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  const handleTicketPurchase = async (event: Event, ticketType: any) => {
    if (!user) {
      alert('Please login to purchase tickets');
      return;
    }

    // Mock payment process
    alert(`Mock payment successful! You purchased 1 ${ticketType.name} ticket for $${ticketType.price} for "${event.title}"`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
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
            Kebele <span className="text-cyan-600">Events</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience the richness of Ethiopian culture through our curated events, celebrations, and community gatherings.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="past">Past</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="mb-8">
          {events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600">Try adjusting your search criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div key={event._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  {/* Event Image */}
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={event.images[0]?.url}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' : event.status === 'ongoing' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {event.status}
                      </span>
                    </div>
                    {event.isFeatured && (
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-amber-500 text-white rounded-full text-xs font-medium">
                          Featured
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Event Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {event.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {event.shortDescription}
                    </p>
                    <div className="space-y-2 text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(event.startDate)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location.venue}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 uppercase">{event.category}</span>
                      <span className="font-semibold text-cyan-600">
                        From ${Math.min(...event.tickets.map(t => t.price))}
                      </span>
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

export default KebeleEvents;