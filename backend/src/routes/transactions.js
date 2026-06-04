const express = require('express');
const Transaction = require('../models/Transaction');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/transactions — admin only, list all
router.get('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 }).lean();
    res.json(transactions);
  } catch (err) { next(err); }
});

// POST /api/transactions — any authenticated user
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const data = { ...req.body, userId: req.user._id };
    const transaction = await Transaction.create(data);
    res.status(201).json(transaction);
  } catch (err) { next(err); }
});

// DELETE /api/transactions/:id — admin only
router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json({ message: 'Transaction deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
