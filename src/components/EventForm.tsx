import React, { useState, useRef, useEffect } from 'react';
import { Upload, Image as ImageIcon, X, Link } from 'lucide-react';
import MediaLibrarySelector from './MediaLibrarySelector';

const EventForm: React.FC<{
  onSubmit: (data: any) => void;
  onCancel: () => void;
  onOpenMediaLibrary?: () => void;
  onMediaSelected?: (media: any) => void;
  editingEvent?: any;
}> = ({ onSubmit, onCancel, onOpenMediaLibrary, onMediaSelected, editingEvent }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'cultural',
    start_date: '',
    end_date: '',
    location: { venue: '', address: { city: 'Addis Ababa', country: 'Ethiopia' } },
    organizer: { name: '', email: '' },
    images: [] as Array<{ url: string; alt?: string; source: 'url' | 'upload' | 'library' }>
  });

  useEffect(() => {
    if (editingEvent) {
      setFormData({
        title: editingEvent.title || '',
        description: editingEvent.description || '',
        category: editingEvent.category || 'cultural',
        start_date: editingEvent.start_date ? new Date(editingEvent.start_date).toISOString().slice(0, 16) : '',
        end_date: editingEvent.end_date ? new Date(editingEvent.end_date).toISOString().slice(0, 16) : '',
        location: {
          venue: editingEvent.location?.venue || '',
          address: {
            city: editingEvent.location?.address?.city || 'Addis Ababa',
            country: editingEvent.location?.address?.country || 'Ethiopia'
          }
        },
        organizer: {
          name: editingEvent.organizer?.name || '',
          email: editingEvent.organizer?.email || ''
        },
        images: editingEvent.images ? editingEvent.images.map((img: any) => ({
          url: img.url,
          alt: img.alt || 'Event image',
          source: 'url'
        })) : []
      });
    }
  }, [editingEvent]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleMediaSelected = (event: any) => {
      const media = event.detail;
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, {
          url: media.media_url,
          alt: media.alt_text || media.title,
          source: 'library'
        }]
      }));
    };

    window.addEventListener('mediaSelected', handleMediaSelected);
    return () => window.removeEventListener('mediaSelected', handleMediaSelected);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      images: formData.images.length > 0 ? formData.images.map(img => ({ url: img.url, alt: img.alt })) : null,
      start_date: new Date(formData.start_date).toISOString(),
      end_date: new Date(formData.end_date).toISOString()
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const url = e.target?.result as string;
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, { url, alt: file.name, source: 'upload' }]
          }));
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleUrlAdd = () => {
    const url = prompt('Enter image URL:');
    if (url && url.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, { url: url.trim(), alt: 'Image from URL', source: 'url' }]
      }));
    }
  };

  const handleMediaSelect = (media: any) => {
    if (onMediaSelected) {
      onMediaSelected(media);
    } else {
      // Fallback for direct handling
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, {
          url: media.media_url,
          alt: media.alt_text || media.title,
          source: 'library'
        }]
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  return (
    <>
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="retro-title text-xl mb-2">{editingEvent ? 'Edit Event' : 'Create New Event'}</h3>
          <p className="retro-text text-sm opacity-80">Fill in the details to {editingEvent ? 'update' : 'add'} a new event to your platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold retro-text">Event Title</label>
            <input
              type="text"
              required
              placeholder="Enter event title"
              className="retro-input w-full"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold retro-text">Category</label>
            <select
              className="retro-input w-full bg-white"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="music">🎵 Music</option>
              <option value="art">🎨 Art</option>
              <option value="workshop">🔧 Workshop</option>
              <option value="performance">🎭 Performance</option>
              <option value="networking">🤝 Networking</option>
              <option value="cultural">🏛️ Cultural</option>
              <option value="other">📌 Other</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold retro-text">Description</label>
          <textarea
            required
            rows={2}
            placeholder="Describe your event in detail"
            className="retro-input w-full resize-none"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold retro-text">Event Images</label>

          {/* Image Upload Options */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Upload className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-700">Upload</span>
            </button>
            <button
              type="button"
              onClick={handleUrlAdd}
              className="flex items-center space-x-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Link className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700">Add URL</span>
            </button>
            <button
              type="button"
              onClick={onOpenMediaLibrary}
              className="flex items-center space-x-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <ImageIcon className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-purple-700">Media Library</span>
            </button>
          </div>

          {/* Drag and Drop Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragOver
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className={`w-8 h-8 mx-auto mb-2 ${dragOver ? 'text-blue-500' : 'text-gray-400'}`} />
            <p className="text-sm text-gray-600">
              {dragOver ? 'Drop images here' : 'Drag & drop images here, or click upload above'}
            </p>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />

          {/* Selected Images Preview */}
          {formData.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative group border rounded-lg overflow-hidden">
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-24 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/150?text=Error';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                    {image.source === 'upload' && '📁 Upload'}
                    {image.source === 'url' && '🔗 URL'}
                    {image.source === 'library' && '📚 Library'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold retro-text">Start Date & Time</label>
            <input
              type="datetime-local"
              required
              className="retro-input w-full"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold retro-text">End Date & Time</label>
            <input
              type="datetime-local"
              required
              className="retro-input w-full"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold retro-text">Venue</label>
            <input
              type="text"
              required
              placeholder="Event location"
              className="retro-input w-full"
              value={formData.location.venue}
              onChange={(e) => setFormData({
                ...formData,
                location: { ...formData.location, venue: e.target.value }
              })}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold retro-text">City</label>
            <input
              type="text"
              required
              placeholder="City name"
              className="retro-input w-full"
              value={formData.location.address.city}
              onChange={(e) => setFormData({
                ...formData,
                location: {
                  ...formData.location,
                  address: { ...formData.location.address, city: e.target.value }
                }
              })}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t-4 border-mustard">
          <button
            type="submit"
            className="flex-1 retro-btn-success py-3 px-6"
          >
            {editingEvent ? '🎉 Update Event' : '🎉 Create Event'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="retro-btn-secondary py-3 px-6"
          >
            Cancel
          </button>
        </div>
      </form>

      </div>
    </>
  );
};

export default EventForm;