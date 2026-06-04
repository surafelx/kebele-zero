const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  platform:     { type: String, required: true },
  label:        { type: String, required: true },
  url:          { type: String, required: true },
  icon:         { type: String, default: 'link' },
  isActive:     { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('SocialLink', schema);
