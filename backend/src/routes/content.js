const express = require('express');
const { body } = require('express-validator');
const {
  getEvents, getEvent, createEvent, updateEvent, deleteEvent,
  getProducts, getProduct, createProduct, updateProduct, deleteProduct,
  getMedia, uploadMedia, deleteMedia,
  getRadioStations, createRadioStation, updateRadioStation, deleteRadioStation,
  getAbout, upsertAboutSection,
} = require('../controllers/contentController');
const {
  listAdminVideos, createVideoFromLink, updateVideo,
  listChannels, addChannel, syncChannel, deleteChannel,
} = require('../controllers/videosController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// ── Events ─────────────────────────────────────────────────────────────────
router.get('/events', getEvents);
router.get('/events/:id', getEvent);
router.post(
  '/events',
  requireAuth, requireAdmin,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
  ],
  validate,
  createEvent
);
router.put('/events/:id', requireAuth, requireAdmin, updateEvent);
router.delete('/events/:id', requireAuth, requireAdmin, deleteEvent);

// ── Products ───────────────────────────────────────────────────────────────
router.get('/products', getProducts);
router.get('/products/:id', getProduct);
router.post(
  '/products',
  requireAuth, requireAdmin,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be non-negative'),
  ],
  validate,
  createProduct
);
router.put('/products/:id', requireAuth, requireAdmin, updateProduct);
router.delete('/products/:id', requireAuth, requireAdmin, deleteProduct);

// ── Media ──────────────────────────────────────────────────────────────────
router.get('/media', getMedia);
router.post(
  '/media',
  requireAuth,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('type').isIn(['image', 'video', 'audio']).withMessage('type must be image, video, or audio'),
    body('url').notEmpty().withMessage('URL is required'),
  ],
  validate,
  uploadMedia
);
router.delete('/media/:id', requireAuth, deleteMedia);

// ── Videos (admin) ───────────────────────────────────────────────────────────
// Registered before nothing conflicting; these two-segment /media/admin/* paths
// don't collide with the single-segment /media/:id above.
router.get('/media/admin/videos', requireAuth, requireAdmin, listAdminVideos);
router.post(
  '/media/admin/videos',
  requireAuth, requireAdmin,
  [body('link').trim().notEmpty().withMessage('A YouTube link is required')],
  validate,
  createVideoFromLink
);
router.put('/media/admin/videos/:id', requireAuth, requireAdmin, updateVideo);

// ── Channels (admin) — sync videos from a YouTube channel ────────────────────
router.get('/channels', requireAuth, requireAdmin, listChannels);
router.post(
  '/channels',
  requireAuth, requireAdmin,
  [body('url').trim().notEmpty().withMessage('A channel link is required')],
  validate,
  addChannel
);
router.post('/channels/:id/sync', requireAuth, requireAdmin, syncChannel);
router.delete('/channels/:id', requireAuth, requireAdmin, deleteChannel);

// ── Radio ──────────────────────────────────────────────────────────────────
router.get('/radio', getRadioStations);
router.post(
  '/radio',
  requireAuth, requireAdmin,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
  ],
  validate,
  createRadioStation
);
router.put('/radio/:id', requireAuth, requireAdmin, updateRadioStation);
router.delete('/radio/:id', requireAuth, requireAdmin, deleteRadioStation);

// ── About ──────────────────────────────────────────────────────────────────
router.get('/about', getAbout);
router.put(
  '/about/:section',
  requireAuth, requireAdmin,
  [body('content').notEmpty().withMessage('Content is required')],
  validate,
  upsertAboutSection
);

module.exports = router;
