const UserPoints = require('../models/UserPoints');

const POINT_VALUES = {
  win: 10,
  draw: 5,
  loss: 0,
};

// GET /api/points/:userId?
async function getPoints(req, res, next) {
  try {
    const userId = req.params.userId || req.user._id;
    const points = await UserPoints.findOne({ userId }).lean();
    if (!points) return res.status(404).json({ message: 'Points record not found' });
    res.json(points);
  } catch (err) {
    next(err);
  }
}

// GET /api/points/leaderboard?gameType=checkers|marbles&limit=N
async function getLeaderboard(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const { gameType } = req.query;

    // Sort by game-specific wins when a gameType is requested
    const sortField =
      gameType === 'checkers' ? { checkersWins: -1, totalPoints: -1 }
      : gameType === 'marbles' ? { marblesWins: -1, totalPoints: -1 }
      : { totalPoints: -1 };

    // Only include players who have played the requested game type
    const filter =
      gameType === 'checkers' ? { checkersWins: { $gt: 0 } }
      : gameType === 'marbles' ? { marblesWins: { $gt: 0 } }
      : {};

    const leaderboard = await UserPoints.find(filter)
      .sort(sortField)
      .limit(limit)
      .populate('userId', 'username email avatarUrl')
      .lean();
    res.json(leaderboard);
  } catch (err) {
    next(err);
  }
}

// POST /api/points  (create empty record — called internally on register too)
async function createPoints(req, res, next) {
  try {
    const userId = req.body.userId || req.user._id;
    const existing = await UserPoints.findOne({ userId });
    if (existing) return res.status(409).json({ message: 'Points record already exists' });

    const points = await UserPoints.create({ userId });
    res.status(201).json(points);
  } catch (err) {
    next(err);
  }
}

// PUT /api/points/game  — record a game result
async function recordGame(req, res, next) {
  try {
    const { userId, game, result } = req.body;
    const targetId = userId || req.user._id;

    if (!['win', 'draw', 'loss'].includes(result)) {
      return res.status(400).json({ message: 'result must be win, draw, or loss' });
    }
    if (!['checkers', 'marbles'].includes(game)) {
      return res.status(400).json({ message: 'game must be checkers or marbles' });
    }

    let record = await UserPoints.findOne({ userId: targetId });
    if (!record) {
      record = await UserPoints.create({ userId: targetId });
    }

    const inc = { gamesPlayed: 1 };
    if (result === 'win' || result === 'draw') {
      inc.totalPoints = POINT_VALUES[result];
    }
    if (result === 'win') {
      if (game === 'checkers') inc.checkersWins = 1;
      if (game === 'marbles') inc.marblesWins = 1;
    }

    const updated = await UserPoints.findByIdAndUpdate(
      record._id,
      { $inc: inc },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

module.exports = { getPoints, getLeaderboard, createPoints, recordGame };
