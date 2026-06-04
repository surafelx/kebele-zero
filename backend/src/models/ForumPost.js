const mongoose = require('mongoose');

const forumPostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [200, 'Title must be at most 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      minlength: [10, 'Content must be at least 10 characters'],
    },
    category: {
      type: String,
      default: 'general',
    },
    tags: {
      type: [String],
      default: [],
    },
    commentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

forumPostSchema.index({ createdAt: -1 });
forumPostSchema.index({ userId: 1 });
forumPostSchema.index({ category: 1 });

module.exports = mongoose.model('ForumPost', forumPostSchema);
