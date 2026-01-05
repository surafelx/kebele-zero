import React, { useState } from 'react';
import { Calendar, Plus, Edit3, Trash2 } from 'lucide-react';
import { supabase } from '../services/supabase';
import Modal from './Modal';
import EventForm from './EventForm';

const AdminEvents = () => {
  const [showEventForm, setShowEventForm] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch events on component mount
  React.useEffect(() => {
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

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="retro-title text-xl">Events Management</h2>
          <p className="retro-text text-base opacity-80 mt-2">Create and manage community events</p>
        </div>
        <button
          onClick={() => setShowEventForm(true)}
          className="retro-btn px-6 py-3 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5 retro-icon" />
          <span>Add Event</span>
        </button>
      </div>

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

      {loading ? (
        <div className="retro-window text-center py-16">
          <div className="retro-spinner w-16 h-16 mx-auto mb-6"></div>
          <p className="retro-text text-lg">Loading events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="retro-window text-center py-16">
          <Calendar className="w-20 h-20 text-gray-300 mx-auto mb-6 retro-icon" />
          <p className="retro-text text-xl">No events found</p>
          <p className="retro-text text-base opacity-70 mt-3">Create your first event to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="retro-window retro-hover">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md retro-icon">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex space-x-2">
                    <button className="retro-btn-secondary p-2">
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
    </div>
  );
};

export default AdminEvents;