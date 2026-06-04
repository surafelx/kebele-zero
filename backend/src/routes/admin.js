const express = require('express');
const User = require('../models/User');
const Event = require('../models/Event');
const Product = require('../models/Product');
const Media = require('../models/Media');
const RadioStation = require('../models/RadioStation');
const ForumPost = require('../models/ForumPost');
const PaymentRequest = require('../models/PaymentRequest');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/stats
router.get('/stats', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const [
      users,
      events,
      products,
      media,
      radio,
      forumPosts,
      paymentTotal,
      paymentPending,
      paymentApproved,
    ] = await Promise.all([
      User.countDocuments(),
      Event.countDocuments(),
      Product.countDocuments(),
      Media.countDocuments(),
      RadioStation.countDocuments(),
      ForumPost.countDocuments(),
      PaymentRequest.countDocuments(),
      PaymentRequest.countDocuments({ status: 'pending' }),
      PaymentRequest.countDocuments({ status: 'approved' }),
    ]);

    res.json({
      users,
      events,
      products,
      media,
      radio,
      forumPosts,
      paymentRequests: {
        total: paymentTotal,
        pending: paymentPending,
        approved: paymentApproved,
      },
    });
  } catch (err) { next(err); }
});

// GET /api/admin/users
router.get('/users', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const users = await User.find().lean();
    res.json(users);
  } catch (err) { next(err); }
});

// PUT /api/admin/users/:id/role
router.put('/users/:id/role', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
