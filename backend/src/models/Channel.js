const mongoose = require('mongoose');

// A YouTube channel registered by an admin so its videos can be synced into
// the Media collection. Syncing uses YouTube's public RSS feed (no API key),
// which returns the channel's most recent ~15 uploads.
const channelSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // The canonical YouTube channel ID (starts with "UC…"). Unique so the same
    // channel can't be registered twice.
    channelId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      default: '',
      trim: true,
    },
    // The original URL the admin pasted (handle, /channel/…, /c/…, or /user/…).
    url: {
      type: String,
      default: '',
    },
    thumbnailUrl: {
      type: String,
      default: '',
    },
    // When the channel was last synced, and how many videos it pulled in total.
    lastSyncedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Channel', channelSchema);
