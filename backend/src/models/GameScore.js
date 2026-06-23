const mongoose = require('mongoose');

const gameScoreSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    gameType: { type: String, enum: ['checkers', 'marbles'], required: true },
    result: { type: String, enum: ['win', 'draw', 'loss'], required: true },
    score: { type: Number, default: 0, min: 0 },
    playedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

gameScoreSchema.index({ playedAt: -1 });

module.exports = mongoose.model('GameScore', gameScoreSchema);
