import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit3, Trash2, Search, Filter, MapPin, Clock } from 'lucide-react';
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

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
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.venue?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterStatus === '' ||
      (filterStatus === 'upcoming' && new Date(event.start_date) > new Date()) ||
      (filterStatus === 'past' && new Date(event.start_date) < new Date()))
  );

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between px-6 py-4 border-b-4 border-black bg-gradient-to-r from-emerald-600 to-teal-600">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-2 border-black shadow-lg">
              <Calendar className="w-7 h-7 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Events Management</h1>
              <p className="text-sm text-emerald-100 font-bold uppercase">Create and manage community events</p>
            </div>
          </div>
          <button
            onClick={() => { setShowEventForm(true); setEditingEvent(null); }}
            className="retro-btn px-4 py-2 bg-white text-black"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Add Event
          </button>
        </div>
      </div>

      {/* Event Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-5 text-center">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-4 border-black mx-auto mb-3">
              <Calendar className="w-6 h-6 text-black" />
            </div>
            <p className="text-3xl font-black text-gray-900" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{events.length}</p>
            <p className="text-sm font-bold text-gray-700 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Total Events</p>
          </div>
        </div>

        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-5 text-center">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-4 border-black mx-auto mb-3">
              <Clock className="w-6 h-6 text-black" />
            </div>
            <p className="text-3xl font-black text-gray-900" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
              {events.filter(e => new Date(e.start_date) > new Date()).length}
            </p>
            <p className="text-sm font-bold text-gray-700 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Upcoming</p>
          </div>
        </div>

        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-5 text-center">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-4 border-black mx-auto mb-3">
              <Calendar className="w-6 h-6 text-black" />
            </div>
            <p className="text-3xl font-black text-gray-900" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
              {events.filter(e => new Date(e.start_date) < new Date()).length}
            </p>
            <p className="text-sm font-bold text-gray-700 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Past Events</p>
          </div>
        </div>

        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-5 text-center">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-4 border-black mx-auto mb-3">
              <MapPin className="w-6 h-6 text-black" />
            </div>
            <p className="text-3xl font-black text-gray-900" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
              {[...new Set(events.map(e => e.location?.venue))].length}
            </p>
            <p className="text-sm font-bold text-gray-700 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Venues</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="px-6 py-4 border-b-4 border-black bg-gradient-to-r from-gray-100 to-gray-200">
          <h3 className="text-lg font-black text-gray-800 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Search & Filter</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="retro-input w-full pl-12"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="retro-input"
            >
              <option value="">All Events</option>
              <option value="upcoming">Upcoming Events</option>
              <option value="past">Past Events</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-12 text-center">
            <div className="retro-spinner w-16 h-16 mx-auto mb-4"></div>
            <p className="font-medium text-lg" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Loading events...</p>
          </div>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="font-medium text-xl" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>No events found</p>
            <p className="font-medium text-sm opacity-70 mt-2" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Create your first event to get started</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {paginatedEvents.map((event) => (
            <div key={event.id} className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-transform">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-4 border-black">
                    <Calendar className="w-6 h-6 text-black" />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingEvent(event);
                        setShowEventForm(true);
                      }}
                      className="p-2 bg-white border-2 border-black rounded-lg hover:bg-yellow-100 transition-colors"
                    >
                      <Edit3 className="w-4 h-4 text-black" />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="p-2 bg-white border-2 border-black rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-black" />
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className="font-black text-lg mb-2" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{event.title}</h3>
                  <p className="font-medium text-gray-600 text-sm line-clamp-2 mb-4" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{event.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-500">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="font-medium text-sm" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{new Date(event.start_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="font-medium text-sm" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{event.location?.venue || 'TBD'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-gray-100 border-4 border-black">
          <p className="font-medium text-sm" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
            Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredEvents.length)} of {filteredEvents.length} events
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="retro-btn px-3 py-1.5"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="retro-btn px-3 py-1.5"
            >
              Next
            </button>
          </div>
        </div>
      )}

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
