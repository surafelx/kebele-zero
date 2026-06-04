const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Media title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['image', 'video', 'audio'],
      required: true,
    },
    url: {
      type: String,
      required: [true, 'Media URL is required'],
    },
    category: {
      type: String,
      default: 'general',
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

mediaSchema.index({ userId: 1 });
mediaSchema.index({ type: 1 });
mediaSchema.index({ category: 1 });

module.exports = mongoose.model('Media', mediaSchema);
