const SiteSettings = require('../models/SiteSettings');

async function getSettings(req, res, next) {
  try {
    const settings = await SiteSettings.findOne().lean();
    if (!settings) {
      // Return defaults when no document exists yet
      const defaults = new SiteSettings();
      return res.json(defaults.toObject());
    }
    res.json(settings);
  } catch (err) { next(err); }
}

async function saveSettings(req, res, next) {
  try {
    const settings = await SiteSettings.findOneAndUpdate(
      {},
      req.body,
      { new: true, upsert: true, runValidators: true }
    );
    res.json(settings);
  } catch (err) { next(err); }
}

module.exports = { getSettings, saveSettings };
