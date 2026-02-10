import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit3, Trash2, Search, Filter, MapPin, Clock, Users } from 'lucide-react';
import { supabase } from '../services/supabase';
import Modal from './Modal';
import EventForm from './EventForm';

const AdminEvents = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
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

  const filteredEvents = events.filter(event => {
    const matchesSearch = !searchTerm || 
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || event.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory]);

  const categories = [...new Set(events.map(e => e.category))].filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-800 uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Events Management</h2>
          <p className="text-gray-600 mt-1 font-bold uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Create and manage community events</p>
        </div>
        <button
          onClick={() => setShowEventForm(true)}
          className="inline-flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold uppercase tracking-wide border-2 border-black transition-colors shadow-lg"
          style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
        >
          <Plus className="w-5 h-5" />
          <span>Add Event</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border-4 border-black">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-bold uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Total Events</p>
              <p className="text-2xl font-black text-gray-800" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{events.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center border-2 border-black">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border-4 border-black">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-bold uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Upcoming</p>
              <p className="text-2xl font-black text-gray-800" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                {events.filter(e => new Date(e.start_date) > new Date()).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center border-2 border-black">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border-4 border-black">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-bold uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Categories</p>
              <p className="text-2xl font-black text-gray-800" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{categories.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center border-2 border-black">
              <Filter className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl p-4 border-4 border-black">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-300 focus:border-emerald-500 focus:outline-none transition-all font-medium"
              style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border-2 border-gray-300 focus:border-emerald-500 focus:outline-none font-medium"
            style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="bg-white rounded-xl p-12 text-center border-4 border-black">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-bold uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Loading events...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border-4 border-black">
          <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-xl font-medium text-gray-800 font-bold uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>No events found</p>
          <p className="text-gray-500 mt-1 font-medium" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Create your first event to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {paginatedEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-xl shadow-sm border-4 border-black overflow-hidden hover:shadow-lg transition-all">
              {/* Event Image */}
              <div className="h-40 bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center border-b-4 border-black">
                <Calendar className="w-16 h-16 text-white/50" />
              </div>
              
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg mb-1" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{event.title}</h3>
                    <span className="inline-flex items-center px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full border-2 border-black uppercase tracking-wide">
                      {event.category || 'General'}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg border-2 border-black transition-colors">
                      <Edit3 className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="p-2 hover:bg-red-50 rounded-lg border-2 border-black transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm line-clamp-2 mb-4 font-medium" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{event.description}</p>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{event.start_date ? new Date(event.start_date).toLocaleDateString() : 'TBD'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{event.location?.venue || 'TBD'}</span>
                  </div>
                  {event.capacity && (
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span className="font-medium" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Capacity: {event.capacity}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-gray-100 border-4 border-black">
          <p className="text-sm text-gray-600 font-bold uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredEvents.length)} of {filteredEvents.length} events
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm bg-white border-2 border-black text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 font-bold uppercase tracking-wide"
              style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm bg-white border-2 border-black text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 font-bold uppercase tracking-wide"
              style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={showEventForm}
        onClose={() => setShowEventForm(false)}
        title="Create New Event"
      >
        <EventForm
          onSubmit={(data) => {
            handleCreateEvent(data);
            setShowEventForm(false);
          }}
          onCancel={() => setShowEventForm(false)}
        />
      </Modal>
    </div>
  );
};

export default AdminEvents;
