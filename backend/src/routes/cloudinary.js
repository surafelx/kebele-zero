const express = require('express');
const { cloudinary, isConfigured } = require('../config/cloudinary');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// DELETE /api/cloudinary/:publicId  — destroy an image (admin only)
// publicId may contain slashes (folder/name), so allow the rest of the path.
router.delete('/:publicId(*)', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    if (!isConfigured()) {
      return res.status(503).json({ message: 'Cloudinary is not configured on the server' });
    }

    const publicId = req.params.publicId;
    if (!publicId) {
      return res.status(400).json({ message: 'publicId is required' });
    }

    const result = await cloudinary.uploader.destroy(publicId);
    // result.result is 'ok' on success, 'not found' if it didn't exist
    if (result.result !== 'ok' && result.result !== 'not found') {
      return res.status(502).json({ message: 'Cloudinary delete failed', result });
    }

    res.json({ message: 'Deleted', publicId, result: result.result });
  } catch (err) {
    next(err);
  }
});

// POST /api/cloudinary/sign — return a signature for signed uploads (admin only)
// Optional helper for future signed-upload support; safe to keep.
router.post('/sign', requireAuth, requireAdmin, (req, res, next) => {
  try {
    if (!isConfigured()) {
      return res.status(503).json({ message: 'Cloudinary is not configured on the server' });
    }
    const timestamp = Math.round(Date.now() / 1000);
    const folder = req.body.folder || 'kebele';
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      require('../config/env').cloudinary.apiSecret
    );
    res.json({
      signature,
      timestamp,
      folder,
      apiKey: require('../config/env').cloudinary.apiKey,
      cloudName: require('../config/env').cloudinary.cloudName,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
