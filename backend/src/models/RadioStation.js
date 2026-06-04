const mongoose = require('mongoose');

const radioStationSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Station name is required'], trim: true },
    // streamUrl doubles as the YouTube ID when no full URL is provided
    streamUrl: { type: String, default: '' },
    youtubeId: { type: String, default: '' },
    genre: { type: String, default: 'general' },
    category: { type: String, default: 'music' },
    description: { type: String, default: '' },
    logoUrl: { type: String, default: null },
    tags: { type: [String], default: [] },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RadioStation', radioStationSchema);
