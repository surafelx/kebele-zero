const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userEmail:     { type: String, required: true },
  userName:      { type: String, required: true },
  itemType:      { type: String, enum: ['event', 'product'], required: true },
  itemId:        { type: String, required: true },
  itemName:      { type: String, required: true },
  itemPrice:     { type: Number, required: true },
  quantity:      { type: Number, default: 1, min: 1 },
  totalAmount:   { type: Number, required: true },
  paymentMethod: { type: String, enum: ['bank_transfer', 'cash', 'mobile_money'], default: 'bank_transfer' },
  notes:         { type: String, default: '' },
  status:        { type: String, enum: ['pending', 'approved', 'rejected', 'completed'], default: 'pending' },
  adminNotes:    { type: String, default: '' },
  reviewedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt:    { type: Date },
}, { timestamps: true });

schema.index({ status: 1 });
schema.index({ userId: 1 });

module.exports = mongoose.model('PaymentRequest', schema);
