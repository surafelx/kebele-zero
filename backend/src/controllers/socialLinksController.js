const SocialLink = require('../models/SocialLink');

async function getAll(req, res, next) {
  try {
    const links = await SocialLink.find().sort({ displayOrder: 1 }).lean();
    res.json(links);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const link = await SocialLink.create(req.body);
    res.status(201).json(link);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const link = await SocialLink.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!link) return res.status(404).json({ message: 'Social link not found' });
    res.json(link);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const link = await SocialLink.findByIdAndDelete(req.params.id);
    if (!link) return res.status(404).json({ message: 'Social link not found' });
    res.json({ message: 'Social link deleted' });
  } catch (err) { next(err); }
}

module.exports = { getAll, create, update, remove };
