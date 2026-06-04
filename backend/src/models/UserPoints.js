const mongoose = require('mongoose');

const userPointsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    totalPoints: { type: Number, default: 0, min: 0 },
    gamesPlayed: { type: Number, default: 0, min: 0 },
    checkersWins: { type: Number, default: 0, min: 0 },
    marblesWins: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

userPointsSchema.index({ totalPoints: -1 });

module.exports = mongoose.model('UserPoints', userPointsSchema);
