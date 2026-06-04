const Event = require('../models/Event');
const Product = require('../models/Product');
const Media = require('../models/Media');
const RadioStation = require('../models/RadioStation');
const About = require('../models/About');

// ── Events ─────────────────────────────────────────────────────────────────

async function getEvents(req, res, next) {
  try {
    const filter = req.query.active === 'true' ? { isActive: true } : {};
    const events = await Event.find(filter).sort({ date: 1 }).lean();
    res.json(events);
  } catch (err) { next(err); }
}

async function getEvent(req, res, next) {
  try {
    const event = await Event.findById(req.params.id).lean();
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) { next(err); }
}

async function createEvent(req, res, next) {
  try {
    const body = { ...req.body };
    // Accept startDate or date interchangeably
    if (body.startDate && !body.date) body.date = body.startDate;
    if (body.date && !body.startDate) body.startDate = body.date;
    const event = await Event.create(body);
    res.status(201).json(event);
  } catch (err) { next(err); }
}

async function updateEvent(req, res, next) {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) { next(err); }
}

async function deleteEvent(req, res, next) {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event deleted' });
  } catch (err) { next(err); }
}

// ── Products ───────────────────────────────────────────────────────────────

async function getProducts(req, res, next) {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.inStock === 'true') filter.inStock = true;
    const products = await Product.find(filter).sort({ createdAt: -1 }).lean();
    res.json(products);
  } catch (err) { next(err); }
}

async function getProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) { next(err); }
}

async function createProduct(req, res, next) {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) { next(err); }
}

async function updateProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) { next(err); }
}

async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) { next(err); }
}

// ── Media ──────────────────────────────────────────────────────────────────

async function getMedia(req, res, next) {
  try {
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.category) filter.category = req.query.category;
    filter.isPublic = true;
    const media = await Media.find(filter)
      .sort({ createdAt: -1 })
      .populate('userId', 'username')
      .lean();
    res.json(media);
  } catch (err) { next(err); }
}

async function uploadMedia(req, res, next) {
  try {
    const { title, description, type, url, category } = req.body;
    const media = await Media.create({
      userId: req.user._id,
      title,
      description,
      type,
      url,
      category,
    });
    res.status(201).json(media);
  } catch (err) { next(err); }
}

async function deleteMedia(req, res, next) {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ message: 'Media not found' });

    const isOwner = String(media.userId) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await media.deleteOne();
    res.json({ message: 'Media deleted' });
  } catch (err) { next(err); }
}

// ── Radio ──────────────────────────────────────────────────────────────────

async function getRadioStations(req, res, next) {
  try {
    const filter = req.query.active === 'false' ? {} : { isActive: true };
    const stations = await RadioStation.find(filter).sort({ name: 1 }).lean();
    res.json(stations);
  } catch (err) { next(err); }
}

async function createRadioStation(req, res, next) {
  try {
    const station = await RadioStation.create(req.body);
    res.status(201).json(station);
  } catch (err) { next(err); }
}

async function updateRadioStation(req, res, next) {
  try {
    const station = await RadioStation.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!station) return res.status(404).json({ message: 'Station not found' });
    res.json(station);
  } catch (err) { next(err); }
}

async function deleteRadioStation(req, res, next) {
  try {
    const station = await RadioStation.findByIdAndDelete(req.params.id);
    if (!station) return res.status(404).json({ message: 'Station not found' });
    res.json({ message: 'Station deleted' });
  } catch (err) { next(err); }
}

// ── About ──────────────────────────────────────────────────────────────────

async function getAbout(req, res, next) {
  try {
    const sections = await About.find().sort({ order: 1 }).lean();
    res.json(sections);
  } catch (err) { next(err); }
}

async function upsertAboutSection(req, res, next) {
  try {
    const { section } = req.params;
    const data = await About.findOneAndUpdate(
      { section },
      { ...req.body, section },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(data);
  } catch (err) { next(err); }
}

module.exports = {
  getEvents, getEvent, createEvent, updateEvent, deleteEvent,
  getProducts, getProduct, createProduct, updateProduct, deleteProduct,
  getMedia, uploadMedia, deleteMedia,
  getRadioStations, createRadioStation, updateRadioStation, deleteRadioStation,
  getAbout, upsertAboutSection,
};
