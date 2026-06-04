const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Event title is required'], trim: true },
    description: { type: String, default: '' },
    shortDescription: { type: String, default: '' },
    category: { type: String, default: 'cultural' },
    // Primary date field — also stored as startDate for frontend compatibility
    date: { type: Date },
    startDate: { type: Date },
    endDate: { type: Date },
    location: { type: mongoose.Schema.Types.Mixed, default: '' },
    imageUrl: { type: String, default: null },
    images: { type: Array, default: [] },
    tickets: { type: Array, default: [] },
    organizer: { type: mongoose.Schema.Types.Mixed, default: {} },
    tags: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    capacity: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Pre-save: sync date ↔ startDate
eventSchema.pre('save', function (next) {
  if (this.startDate && !this.date) this.date = this.startDate;
  if (this.date && !this.startDate) this.startDate = this.date;
  next();
});

eventSchema.index({ date: 1 });
eventSchema.index({ startDate: 1 });

module.exports = mongoose.model('Event', eventSchema);
