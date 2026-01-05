import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit3, Trash2, Search, Filter } from 'lucide-react';
import { supabase } from '../services/supabase';
import Modal from '../components/Modal';
import EventForm from '../components/EventForm';
import MediaLibrarySelector from '../components/MediaLibrarySelector';

const AdminEvents = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (eventsError) {
        console.error('Error fetching events:', eventsError);
      } else {
        setEvents(eventsData || []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (eventData: any) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select();

      if (error) throw error;

      setEvents([...events, data[0]]);
      setShowEventForm(false);
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Error creating event');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEvents(events.filter(event => event.id !== id));
      alert('Event deleted successfully!');
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Error deleting event');
    }
  };

  const handleUpdateEvent = async (eventData: any, eventId: string) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', eventId)
        .select();

      if (error) throw error;

      setEvents(events.map(e => e.id === eventId ? data[0] : e));
      setShowEventForm(false);
      setEditingEvent(null);
      fetchEvents();
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Error updating event');
    }
  };

  const filteredEvents = events.filter(event =>
    (searchTerm === '' ||
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.venue?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterStatus === '' ||
      (filterStatus === 'upcoming' && new Date(event.start_date) > new Date()) ||
      (filterStatus === 'past' && new Date(event.start_date) < new Date()))
  );

  return (
    <div className="space-y-8">
      <div className="bg-white border-b-4 border-charcoal px-4 py-3 flex justify-between items-center shadow-sm">
        <div>
          <h2 className="retro-title text-xl">Events Management</h2>
          <p className="retro-text text-base opacity-80 mt-2">Create and manage community events</p>
        </div>
        <button
          onClick={() => { setShowEventForm(true); setEditingEvent(null); }}
          className="retro-btn px-6 py-3 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5 retro-icon" />
          <span>Add Event</span>
        </button>
      </div>

      {/* Event Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <div className="retro-card retro-hover">
          <div className="p-3 text-center">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md border-2 border-green-400 retro-icon mx-auto mb-2">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <p className="text-lg font-bold text-green-900 retro-title">{events.length}</p>
            <p className="text-xs text-green-700 uppercase tracking-wide retro-text">Total Events</p>
          </div>
        </div>

        <div className="retro-card retro-hover">
          <div className="p-3 text-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md border-2 border-blue-400 retro-icon mx-auto mb-2">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <p className="text-lg font-bold text-blue-900 retro-title">
              {events.filter(e => new Date(e.start_date) > new Date()).length}
            </p>
            <p className="text-xs text-blue-700 uppercase tracking-wide retro-text">Upcoming</p>
          </div>
        </div>

        <div className="retro-card retro-hover">
          <div className="p-3 text-center">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md border-2 border-purple-400 retro-icon mx-auto mb-2">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <p className="text-lg font-bold text-purple-900 retro-title">
              {events.filter(e => new Date(e.start_date) < new Date()).length}
            </p>
            <p className="text-xs text-purple-700 uppercase tracking-wide retro-text">Past Events</p>
          </div>
        </div>

        <div className="retro-card retro-hover">
          <div className="p-3 text-center">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md border-2 border-orange-400 retro-icon mx-auto mb-2">
              <span className="text-white font-bold text-sm">📍</span>
            </div>
            <p className="text-lg font-bold text-orange-900 retro-title">
              {[...new Set(events.map(e => e.location?.venue))].length}
            </p>
            <p className="text-xs text-orange-700 uppercase tracking-wide retro-text">Venues</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="retro-window">
        <div className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold retro-text mb-2">Search Events</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by title, description, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 retro-input"
                />
              </div>
            </div>
            <div className="lg:w-64">
              <label className="block text-sm font-semibold retro-text mb-2">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 bg-white retro-input"
              >
                <option value="">All Events</option>
                <option value="upcoming">Upcoming Events</option>
                <option value="past">Past Events</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showEventForm}
        onClose={() => { setShowEventForm(false); setEditingEvent(null); }}
        title={editingEvent ? "Edit Event" : "Create New Event"}
      >
        <EventForm
          onSubmit={(data) => {
            if (editingEvent) {
              handleUpdateEvent(data, editingEvent.id);
            } else {
              handleCreateEvent(data);
            }
            setShowEventForm(false);
            setEditingEvent(null);
          }}
          onCancel={() => { setShowEventForm(false); setEditingEvent(null); }}
          onOpenMediaLibrary={() => setShowMediaLibrary(true)}
          editingEvent={editingEvent}
        />
      </Modal>

      {loading ? (
        <div className="retro-window text-center py-16">
          <div className="retro-spinner w-16 h-16 mx-auto mb-6"></div>
          <p className="retro-text text-lg">Loading events...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="retro-window text-center py-16">
          <Calendar className="w-20 h-20 text-gray-300 mx-auto mb-6 retro-icon" />
          <p className="retro-text text-xl">No events found</p>
          <p className="retro-text text-base opacity-70 mt-3">Create your first event to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div key={event.id} className="retro-window retro-hover">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md retro-icon">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingEvent(event);
                        setShowEventForm(true);
                      }}
                      className="retro-btn-secondary p-2"
                    >
                      <Edit3 className="w-4 h-4 retro-icon" />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="retro-btn-secondary p-2"
                    >
                      <Trash2 className="w-4 h-4 retro-icon" />
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-xl retro-title mb-3">{event.title}</h3>
                  <p className="text-gray-600 text-base retro-text mb-4 line-clamp-3">{event.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm retro-text opacity-80">
                      <span className="font-medium">📅 {new Date(event.start_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-sm retro-text opacity-80">
                      <span className="font-medium">📍 {event.location?.venue || 'TBD'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <MediaLibrarySelector
        isOpen={showMediaLibrary}
        onClose={() => setShowMediaLibrary(false)}
        onSelect={(media) => {
          const event = new CustomEvent('mediaSelected', { detail: media });
          window.dispatchEvent(event);
          setShowMediaLibrary(false);
        }}
      />
    </div>
  );
};

export default AdminEvents;