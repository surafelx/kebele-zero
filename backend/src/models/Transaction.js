const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount:        { type: Number, required: true },
  description:   { type: String, default: '' },
  paymentMethod: { type: String, default: 'card' },
  currency:      { type: String, default: 'USD' },
  status:        { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  reference:     { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', schema);
