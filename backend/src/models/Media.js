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
    // Cloudinary public_id — stored so the image can be removed from Cloudinary
    // when the media record is deleted.
    publicId: {
      type: String,
      default: null,
    },
    category: {
      type: String,
      default: 'general',
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    // ── Video-specific fields ────────────────────────────────────────────
    // The YouTube video ID (11 chars). Present on type: 'video' records.
    youtubeId: {
      type: String,
      default: '',
    },
    // Original publish date on YouTube (for synced videos).
    publishedAt: {
      type: Date,
      default: null,
    },
    // The channel this video was synced from (a Channel.channelId, e.g. "UC…").
    // Null for videos added manually by link.
    sourceChannelId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

mediaSchema.index({ userId: 1 });
mediaSchema.index({ type: 1 });
mediaSchema.index({ category: 1 });
// Sparse so only video records (which set youtubeId) participate — lets us
// dedupe synced videos without constraining images/audio.
mediaSchema.index({ youtubeId: 1 }, { sparse: true });

module.exports = mongoose.model('Media', mediaSchema);
