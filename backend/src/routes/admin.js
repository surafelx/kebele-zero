const express = require('express');
const User = require('../models/User');
const Event = require('../models/Event');
const Product = require('../models/Product');
const Media = require('../models/Media');
const RadioStation = require('../models/RadioStation');
const ForumPost = require('../models/ForumPost');
const ForumComment = require('../models/ForumComment');
const PaymentRequest = require('../models/PaymentRequest');
const Transaction = require('../models/Transaction');
const UserPoints = require('../models/UserPoints');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/stats
router.get('/stats', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      users,
      newUsers,
      events,
      products,
      media,
      radio,
      forumPosts,
      forumComments,
      transactions,
      paymentTotal,
      paymentPending,
      paymentApproved,
      gameAgg,
      revenueAgg,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: since } }),
      Event.countDocuments(),
      Product.countDocuments(),
      Media.countDocuments(),
      RadioStation.countDocuments(),
      ForumPost.countDocuments(),
      ForumComment.countDocuments(),
      Transaction.countDocuments(),
      PaymentRequest.countDocuments(),
      PaymentRequest.countDocuments({ status: 'pending' }),
      PaymentRequest.countDocuments({ status: 'approved' }),
      // Total game sessions = sum of gamesPlayed across all players
      UserPoints.aggregate([
        { $group: { _id: null, totalGames: { $sum: '$gamesPlayed' } } },
      ]),
      // Revenue = completed transactions + approved/completed payment requests
      Transaction.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    const totalGames = gameAgg[0]?.totalGames || 0;
    let revenue = revenueAgg[0]?.total || 0;

    // Add approved/completed payment request amounts to revenue
    const prRevenueAgg = await PaymentRequest.aggregate([
      { $match: { status: { $in: ['approved', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    revenue += prRevenueAgg[0]?.total || 0;

    res.json({
      // total* field names consumed by AdminOverview & AdminAnalytics
      totalUsers: users,
      newUsers,
      totalEvents: events,
      totalProducts: products,
      totalMedia: media,
      totalRadio: radio,
      totalPosts: forumPosts,
      totalComments: forumComments,
      totalTransactions: transactions,
      totalGames,
      totalRevenue: revenue,
      paymentRequests: {
        total: paymentTotal,
        pending: paymentPending,
        approved: paymentApproved,
      },
      // legacy aliases (kept for any older consumers)
      users,
      events,
      products,
      media,
      radio,
      forumPosts,
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
