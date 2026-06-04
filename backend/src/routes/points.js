const express = require('express');
const { body } = require('express-validator');
const { getPoints, getLeaderboard, createPoints, recordGame } = require('../controllers/pointsController');
const { requireAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/leaderboard', getLeaderboard);
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
