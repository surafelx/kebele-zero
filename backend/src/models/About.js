const mongoose = require('mongoose');

const aboutSchema = new mongoose.Schema(
  {
    section: {
      type: String,
      required: [true, 'Section key is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    title: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    imageUrl: {
      type: String,
      default: null,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('About', aboutSchema);
