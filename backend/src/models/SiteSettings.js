const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  siteName:            { type: String, default: 'Kebele Zero' },
  siteDescription:     { type: String, default: '' },
  contactEmail:        { type: String, default: '' },
  maintenanceMode:     { type: Boolean, default: false },
  allowRegistration:   { type: Boolean, default: true },
  enableNotifications: { type: Boolean, default: true },
  primaryColor:        { type: String, default: '#10b981' },
  logoUrl:             { type: String, default: null },
  faviconUrl:          { type: String, default: null },
  socialLinks:         { type: Object, default: {} },
}, { timestamps: true });

module.exports = mongoose.model('SiteSettings', schema);
