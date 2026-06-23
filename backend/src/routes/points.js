const express = require('express');
const { body } = require('express-validator');
const {
  getPoints,
  getLeaderboard,
  createPoints,
  recordGame,
  listGameScores,
  createGameScoreAdmin,
  adminSetPoints,
} = require('../controllers/pointsController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/leaderboard', getLeaderboard);

router.get('/admin/scores', requireAuth, requireAdmin, listGameScores);
router.post(
  '/admin/scores',
  requireAuth,
  requireAdmin,
  [
    body('userId').notEmpty().withMessage('userId is required'),
    body('gameType').isIn(['checkers', 'marbles']).withMessage('gameType must be checkers or marbles'),
    body('result').isIn(['win', 'draw', 'loss']).withMessage('result must be win, draw, or loss'),
  ],
  validate,
  createGameScoreAdmin
);
router.put('/admin/:userId', requireAuth, requireAdmin, adminSetPoints);

router.get('/:userId', requireAuth, getPoints);
router.get('/', requireAuth, getPoints);

router.post('/', requireAuth, createPoints);

router.put(
  '/game',
  requireAuth,
  [
    body('game').isIn(['checkers', 'marbles']).withMessage('game must be checkers or marbles'),
    body('result').isIn(['win', 'draw', 'loss']).withMessage('result must be win, draw, or loss'),
  ],
  validate,
  recordGame
);

module.exports = router;
