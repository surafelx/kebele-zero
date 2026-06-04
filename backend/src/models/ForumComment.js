const mongoose = require('mongoose');

const forumCommentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ForumPost',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      minlength: [1, 'Comment cannot be empty'],
      maxlength: [2000, 'Comment must be at most 2000 characters'],
    },
  },
  { timestamps: true }
);

forumCommentSchema.index({ postId: 1, createdAt: 1 });

module.exports = mongoose.model('ForumComment', forumCommentSchema);
