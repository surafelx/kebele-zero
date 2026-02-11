import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';
import { Calendar, MapPin, Clock, Users, Ticket, Star, Heart, Share2, Music, Film, BookOpen, Coffee, Zap, Sparkles, Search, X } from 'lucide-react';
import { eventsAPI } from '../services/content';

interface Event {
  id: string;
  title: string;
  description: string;
  short_description: string;
  category: string;
  start_date: string;
  end_date: string;
  location: {
    venue: string;
    address: {
      city: string;
      country: string;
    };
  };
  images: Array<{ url: string; alt: string }>;
  tickets: Array<{
    type: string;
    name: string;
    price: number;
    quantity: number;
    sold: number;
    max_per_order: number;
  }>;
  organizer: {
    name: string;
  };
  tags: string[];
  is_active: boolean;
  is_featured: boolean;
  capacity: number;
}

// Mock events data - Fallback when no Supabase data
const mockEvents: Event[] = [
  {
    id: "1",
    title: "Ethiopian Cultural Festival 2024",
    description: "A celebration of Ethiopian culture featuring traditional music, dance, food, and art from all regions of Ethiopia.",
    short_description: "Celebrate Ethiopian culture with music, dance, and traditional cuisine",
    category: "Cultural",
    start_date: "2024-12-15T18:00:00Z",
    end_date: "2024-12-15T23:00:00Z",
    location: {
      venue: "Addis Ababa Convention Center",
      address: { city: "Addis Ababa", country: "Ethiopia" }
    },
    images: [
      { url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop", alt: "Cultural festival" },
      { url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop", alt: "Traditional dance" }
    ],
    tickets: [
      { type: "general", name: "General Admission", price: 25, quantity: 500, sold: 120, max_per_order: 4 },
      { type: "vip", name: "VIP Experience", price: 75, quantity: 100, sold: 45, max_per_order: 2 }
    ],
    organizer: { name: "Ethiopian Cultural Society" },
    tags: ["culture", "music", "dance", "food"],
    is_active: true,
    is_featured: true,
    capacity: 600
  },
  {
    id: "2",
    title: "Jazz Night: Ethiopian Fusion",
    description: "Experience the unique blend of traditional Ethiopian melodies with modern jazz improvisation.",
    short_description: "Ethiopian jazz fusion with renowned musicians",
    category: "Music",
    start_date: "2024-12-20T20:00:00Z",
    end_date: "2024-12-20T23:00:00Z",
    location: {
      venue: "Blue Nile Jazz Club",
      address: { city: "Addis Ababa", country: "Ethiopia" }
    },
    images: [
      { url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop", alt: "Jazz performance" }
    ],
    tickets: [
      { type: "general", name: "General Admission", price: 35, quantity: 150, sold: 89, max_per_order: 4 }
    ],
    organizer: { name: "Blue Nile Entertainment" },
    tags: ["jazz", "music", "fusion", "live"],
    is_active: true,
    is_featured: true,
    capacity: 150
  },
  {
    id: "3",
    title: "Coffee Ceremony Workshop",
    description: "Learn the art of traditional Ethiopian coffee ceremony and the cultural significance of coffee in Ethiopian society.",
    short_description: "Master the traditional Ethiopian coffee ceremony",
    category: "Workshop",
    start_date: "2024-12-10T14:00:00Z",
    end_date: "2024-12-10T17:00:00Z",
    location: {
      venue: "Cultural Heritage Center",
      address: { city: "Addis Ababa", country: "Ethiopia" }
    },
    images: [
      { url: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&h=600&fit=crop", alt: "Coffee ceremony" }
    ],
    tickets: [
      { type: "workshop", name: "Workshop Ticket", price: 45, quantity: 30, sold: 18, max_per_order: 2 }
    ],
    organizer: { name: "Ethiopian Coffee Association" },
    tags: ["coffee", "ceremony", "culture", "workshop"],
    is_active: true,
    is_featured: false,
    capacity: 30
  },
  {
    id: "4",
    title: "Timket Celebration",
    description: "Join the grand celebration of Timket, the Ethiopian Orthodox Christmas, with traditional processions and ceremonies.",
    short_description: "Celebrate Ethiopian Orthodox Christmas with traditional ceremonies",
    category: "Religious",
    start_date: "2025-01-19T06:00:00Z",
    end_date: "2025-01-19T18:00:00Z",
    location: {
      venue: "Holy Trinity Cathedral",
      address: { city: "Addis Ababa", country: "Ethiopia" }
    },
    images: [
      { url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop", alt: "Religious celebration" }
    ],
    tickets: [
      { type: "free", name: "Free Entry", price: 0, quantity: 1000, sold: 234, max_per_order: 6 }
    ],
    organizer: { name: "Ethiopian Orthodox Church" },
    tags: ["timket", "christmas", "religious", "tradition"],
    is_active: true,
    is_featured: true,
    capacity: 1000
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
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'detail'>('grid');

  useEffect(() => {
    loadEvents();
    loadCategories();
  }, [searchTerm, selectedCategory, selectedStatus]);

  const loadEvents = async () => {
    try {
      // Fetch from Supabase
      const data = await eventsAPI.getEvents({
        category: selectedCategory || undefined
      });
      
      // Transform Supabase data to match component format
      if (data && data.length > 0) {
        const transformedEvents: Event[] = data.map(event => ({
          id: event.id,
          title: event.title,
          description: event.description,
          short_description: event.short_description || '',
          category: event.category,
          start_date: event.start_date,
          end_date: event.end_date,
          location: event.location || { venue: '', address: { city: '', country: '' } },
          images: event.images || [{ url: '', alt: event.title }],
          tickets: event.tickets || [],
          organizer: event.organizer || { name: '' },
          tags: event.tags || [],
          is_active: event.is_active,
          is_featured: event.is_featured,
          capacity: event.capacity || 0
        }));
        setEvents(transformedEvents);
      } else {
        // Fallback to mock data
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
        setEvents(filteredEvents);
      }
    } catch (error) {
      console.error('Error loading events:', error);
      // Fallback to mock data on error
      let filteredEvents = mockEvents;
      if (searchTerm) {
        filteredEvents = filteredEvents.filter(event =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      if (selectedCategory) {
        filteredEvents = filteredEvents.filter(event => event.category === selectedCategory);
      }
      setEvents(filteredEvents);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      // Fetch categories from Supabase
      const data = await eventsAPI.getCategories();
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

  const getEventStatus = (event: Event): string => {
    const now = new Date();
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);
    if (now < startDate) return 'upcoming';
    if (now > endDate) return 'past';
    return 'ongoing';
  };


  const handleTicketPurchase = async (event: Event, ticketType: any) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // Mock payment process
    alert(`Mock payment successful! You purchased 1 ${ticketType.name} ticket for $${ticketType.price} for "${event.title}"`);
  };

  const EventDetailView: React.FC<{ event: Event }> = ({ event }) => {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <div className="retro-window">
          <div className="p-4">
            <button
              onClick={() => {
                setViewMode('grid');
                setSelectedEvent(null);
              }}
              className="retro-btn flex items-center space-x-2 text-sm font-bold uppercase"
            >
              <span>← BACK TO EVENTS</span>
            </button>
          </div>
        </div>

        {/* Event Details Header */}
        <div className="retro-window">
          <div className="retro-titlebar retro-titlebar-sky">
            <div className="flex items-center space-x-3">
              <Calendar className="w-4 h-4 retro-icon" />
              <span className="retro-title text-sm font-bold uppercase">Event Details</span>
            </div>
            <div className="retro-window-controls">
              <div className="retro-window-dot"></div>
              <div className="retro-window-dot"></div>
              <div className="retro-window-dot"></div>
            </div>
          </div>
          <div className="p-6">
            {/* Main Image */}
            {event.images.length > 0 && (
              <div className="mb-6">
                <img
                  src={event.images[0].url}
                  alt={event.images[0].alt}
                  className="w-full h-64 object-cover rounded-lg border-2 border-charcoal"
                />
              </div>
            )}

            {/* Title and Description */}
            <div className="mb-6">
              <h1 className="retro-title text-2xl font-bold mb-3 uppercase tracking-tight">
                {event.title}
              </h1>
              <p className="retro-text text-base leading-relaxed mb-4">
                {event.description}
              </p>
            </div>

            {/* Event Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-sky-blue retro-icon mt-0.5" />
                  <div>
                    <div className="retro-title text-sm font-bold uppercase mb-1">Date & Time</div>
                    <div className="retro-text text-sm">
                      {formatDate(event.start_date)} at {formatTime(event.start_date)}
                      {event.end_date && event.end_date !== event.start_date && (
                        <> - {formatDate(event.end_date)} at {formatTime(event.end_date)}</>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-coral-red retro-icon mt-0.5" />
                  <div>
                    <div className="retro-title text-sm font-bold uppercase mb-1">Location</div>
                    <div className="retro-text text-sm">
                      {event.location.venue}<br />
                      {event.location.address.city}, {event.location.address.country}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-mustard retro-icon mt-0.5" />
                  <div>
                    <div className="retro-title text-sm font-bold uppercase mb-1">Capacity</div>
                    <div className="retro-text text-sm">
                      {event.capacity} attendees
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Star className="w-5 h-5 text-gold retro-icon mt-0.5" />
                  <div>
                    <div className="retro-title text-sm font-bold uppercase mb-1">Organizer</div>
                    <div className="retro-text text-sm">
                      {event.organizer.name}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status and Category */}
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-bold uppercase border-2 border-white shadow-lg" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                {getEventStatus(event)}
              </span>
              <span className="px-3 py-1 bg-purple-600 text-white rounded retro-title text-sm font-bold uppercase border-2 border-white shadow-lg">
                {event.category}
              </span>
              {event.is_featured && (
                <span className="px-3 py-1 bg-green-600 text-white rounded retro-title text-sm font-bold uppercase border-2 border-white shadow-lg">
                  FEATURED
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tickets Section */}
        <div className="retro-window">
          <div className="retro-titlebar retro-titlebar-teal">
            <div className="flex items-center space-x-3">
              <Ticket className="w-4 h-4 retro-icon" />
              <span className="retro-title text-sm font-bold uppercase">Tickets</span>
            </div>
            <div className="retro-window-controls">
              <div className="retro-window-dot"></div>
              <div className="retro-window-dot"></div>
              <div className="retro-window-dot"></div>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {event.tickets.map((ticket, index) => (
                <div key={index} className="retro-card p-3 border-2 border-charcoal">
                  <div className="mb-2">
                    <div className="retro-title text-sm font-bold mb-1">{ticket.name}</div>
                    <div className="retro-text text-xs opacity-80 mb-1">
                      {ticket.quantity - ticket.sold}/{ticket.quantity} left
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="retro-title text-lg font-bold">${ticket.price}</div>
                      <div className="retro-text text-xs">Max {ticket.max_per_order}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleTicketPurchase(event, ticket)}
                    disabled={ticket.quantity - ticket.sold <= 0}
                    className="retro-btn w-full py-1 px-2 text-xs font-bold uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {ticket.quantity - ticket.sold <= 0 ? 'SOLD OUT' : 'BUY'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tags Section */}
        {event.tags.length > 0 && (
          <div className="retro-window">
            <div className="retro-titlebar retro-titlebar-mustard">
              <div className="flex items-center space-x-3">
                <Sparkles className="w-4 h-4 retro-icon" />
                <span className="retro-title text-sm font-bold uppercase">Tags</span>
              </div>
              <div className="retro-window-controls">
                <div className="retro-window-dot"></div>
                <div className="retro-window-dot"></div>
                <div className="retro-window-dot"></div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-200 text-charcoal rounded retro-title text-sm font-bold uppercase">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };


  if (loading) {
    return (
      <div className="flex justify-center">
        <div className="text-center w-80">
          <div className="retro-titlebar retro-titlebar-sky mb-4">
            <div className="flex items-center justify-center">
              <Calendar className="w-5 h-5 retro-icon" />
            </div>
            <div className="retro-window-controls">
              <div className="retro-window-dot"></div>
              <div className="retro-window-dot"></div>
              <div className="retro-window-dot"></div>
            </div>
          </div>
          <div className="retro-spinner w-16 h-16 mx-auto mb-6"></div>
          <div className="retro-title text-lg font-bold uppercase tracking-wider">Loading Events...</div>
          <p className="retro-text text-sm mt-4 opacity-80">Discovering amazing Ethiopian cultural events</p>
        </div>
      </div>
    );
  }

  return (
    <div className="retro-bg retro-bg-enhanced">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section - Smaller */}
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8">
          <div className="flex items-center justify-between px-4 py-3 border-b-4 border-black bg-gradient-to-r from-emerald-600 to-teal-600">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-white" />
              <span className="text-xs font-black text-white uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>KEBELE EVENTS</span>
            </div>
            <button className="p-1 bg-white border-2 border-black rounded shadow hover:bg-red-500 hover:text-white transition-all">
              <span className="text-sm font-bold">×</span>
            </button>
          </div>
          <div className="p-4 text-center">
            <h1 className="text-xl md:text-2xl font-bold mb-3 leading-tight uppercase tracking-tight" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
              DISCOVER ETHIOPIAN CULTURE THROUGH EVENTS
            </h1>
            <p className="text-xs md:text-sm retro-text max-w-2xl mx-auto leading-relaxed">
              Experience the richness of Ethiopian culture through our curated events, celebrations, and community gatherings.
            </p>
          </div>
        </div>

        {/* Search and Filters - Only show in grid view */}
        {viewMode === 'grid' && (
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8">
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-charcoal w-4 h-4 retro-icon" />
                    <input
                      type="text"
                      placeholder="Search events..."
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
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 retro-input bg-paper text-xs"
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
        )}

        {/* Events Content */}
        {viewMode === 'grid' ? (
          <div className="mb-12">
            {events.length === 0 ? (
              <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center p-12">
                <div className="flex items-center justify-between px-4 py-3 border-b-4 border-black bg-gradient-to-r from-orange-500 to-red-500 mb-6">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-white" />
                    <span className="text-sm font-black text-white uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>NO EVENTS FOUND</span>
                  </div>
                  <button className="p-1 bg-white border-2 border-black rounded shadow hover:bg-red-500 hover:text-white transition-all">
                    <span className="text-sm font-bold">×</span>
                  </button>
                </div>
                <div className="w-16 h-16 bg-mustard rounded-lg flex items-center justify-center mx-auto mb-6 border-2 border-charcoal">
                  <Calendar className="w-8 h-8 text-charcoal retro-icon" />
                </div>
                <h3 className="font-black text-xl font-bold mb-4 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>No Events Found</h3>
                <p className="font-medium text-base" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Try adjusting your search criteria or check back later for new events.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {events.map((event) => (
                  <div key={event.id} className="retro-window retro-floating">
                    {/* Event Image */}
                    <div className="aspect-[3/2] overflow-hidden relative">
                      <img
                        src={event.images[0]?.url}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                      {/* Semi-transparent background overlay for better tag visibility */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10"></div>

                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 rounded-md retro-title text-xs font-bold uppercase border-2 border-white shadow-lg transform rotate-3 bg-blue-600 text-white">
                          {getEventStatus(event)}
                        </span>
                      </div>
                      {event.is_featured && (
                        <div className="absolute top-3 left-3">
                          <span className="px-2 py-1 bg-green-600 text-white rounded-md retro-title text-xs font-bold uppercase border-2 border-white shadow-lg transform -rotate-3">
                            FEATURED
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Event Content */}
                    <div className="p-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="px-1.5 py-0.5 bg-purple-600 text-white rounded retro-title text-xs font-bold uppercase border border-white shadow-sm">
                          {event.category}
                        </span>
                        <span className="retro-title text-xs font-bold text-charcoal">
                          ${Math.min(...event.tickets.map(t => t.price))}
                        </span>
                      </div>

                      <h3 className="retro-title text-xs font-bold mb-1 leading-tight uppercase line-clamp-2">
                        {event.title}
                      </h3>

                      <div className="space-y-0.5 mb-2">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-2.5 h-2.5 text-sky-blue retro-icon" />
                          <span className="retro-text text-xs">{formatDate(event.start_date)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-2.5 h-2.5 text-coral-red retro-icon" />
                          <span className="retro-text text-xs truncate">{event.location.venue}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedEvent(event);
                          setViewMode('detail');
                        }}
                        className="w-full retro-btn text-xs py-1 font-bold uppercase"
                      >
                        DETAILS
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          selectedEvent && <EventDetailView event={selectedEvent} />
        )}

        {/* Call to Action */}
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
          <div className="flex items-center justify-between px-4 py-3 border-b-4 border-black bg-gradient-to-r from-teal-500 to-emerald-500">
            <div className="flex items-center space-x-3">
              <Sparkles className="w-5 h-5 text-white" />
              <span className="text-sm font-black text-white uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>JOIN THE CULTURE</span>
            </div>
            <button className="p-1 bg-white border-2 border-black rounded shadow hover:bg-red-500 hover:text-white transition-all">
              <span className="text-sm font-bold">×</span>
            </button>
          </div>
          <div className="p-8">
            <h2 className="font-black text-2xl font-bold mb-4 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>READY TO EXPERIENCE CULTURE?</h2>
            <p className="retro-text text-base mb-6 max-w-2xl mx-auto leading-relaxed">
              Join our community events and be part of the vibrant Ethiopian cultural scene that brings people together.
            </p>
            <button className="retro-btn text-lg py-4 px-8 font-bold uppercase">
              BROWSE ALL EVENTS
            </button>
          </div>
        </div>

        {/* Auth Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          feature="events"
        />
      </div>
    </div>
  );
};

export default KebeleEvents;