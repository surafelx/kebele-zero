const UserPoints = require('../models/UserPoints');
const GameScore = require('../models/GameScore');

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

    await GameScore.create({
      userId: targetId,
      gameType: game,
      result,
      score: inc.totalPoints || 0,
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

// GET /api/points/admin/scores?gameType=&result=&search=&limit=  (admin) — individual game history
async function listGameScores(req, res, next) {
  try {
    const { gameType, result, search } = req.query;
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);

    const filter = {};
    if (gameType) filter.gameType = gameType;
    if (result) filter.result = result;

    let scores = await GameScore.find(filter)
      .sort({ playedAt: -1 })
      .limit(limit)
      .populate('userId', 'username email')
      .lean();

    if (search) {
      const q = search.toLowerCase();
      scores = scores.filter((s) => s.userId?.username?.toLowerCase().includes(q));
    }

    res.json(scores);
  } catch (err) {
    next(err);
  }
}

// POST /api/points/admin/scores  (admin) — manually log a game score + keep aggregate in sync
async function createGameScoreAdmin(req, res, next) {
  try {
    const { userId, gameType, score, result } = req.body;

    if (!['win', 'draw', 'loss'].includes(result)) {
      return res.status(400).json({ message: 'result must be win, draw, or loss' });
    }
    if (!['checkers', 'marbles'].includes(gameType)) {
      return res.status(400).json({ message: 'gameType must be checkers or marbles' });
    }

    let record = await UserPoints.findOne({ userId });
    if (!record) {
      record = await UserPoints.create({ userId });
    }

    const inc = { gamesPlayed: 1 };
    const points = score != null ? Number(score) : POINT_VALUES[result];
    if (result === 'win' || result === 'draw') {
      inc.totalPoints = points;
    }
    if (result === 'win') {
      if (gameType === 'checkers') inc.checkersWins = 1;
      if (gameType === 'marbles') inc.marblesWins = 1;
    }

    await UserPoints.findByIdAndUpdate(record._id, { $inc: inc });

    const entry = await GameScore.create({ userId, gameType, result, score: points });
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
}

// PUT /api/points/admin/:userId  (admin) — directly override a user's aggregate stats
async function adminSetPoints(req, res, next) {
  try {
    const { userId } = req.params;
    const { totalPoints, gamesPlayed, checkersWins, marblesWins } = req.body;

    const update = {};
    if (totalPoints !== undefined) update.totalPoints = totalPoints;
    if (gamesPlayed !== undefined) update.gamesPlayed = gamesPlayed;
    if (checkersWins !== undefined) update.checkersWins = checkersWins;
    if (marblesWins !== undefined) update.marblesWins = marblesWins;

    const record = await UserPoints.findOneAndUpdate(
      { userId },
      update,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json(record);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPoints,
  getLeaderboard,
  createPoints,
  recordGame,
  listGameScores,
  createGameScoreAdmin,
  adminSetPoints,
};
