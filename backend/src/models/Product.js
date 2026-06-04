const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Product name is required'], trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: [true, 'Price is required'], min: [0, 'Price cannot be negative'] },
    category: { type: String, default: 'general' },
    imageUrl: { type: String, default: null },
    inStock: { type: Boolean, default: true },
    // Accept both `stock` and `stockQuantity` (frontend sends stockQuantity)
    stock: { type: Number, default: 0, min: 0 },
    stockQuantity: { type: Number, default: 0, min: 0 },
    isComingSoon: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Sync stock ↔ stockQuantity on save
productSchema.pre('save', function (next) {
  if (this.stockQuantity > 0 && this.stock === 0) this.stock = this.stockQuantity;
  if (this.stock > 0 && this.stockQuantity === 0) this.stockQuantity = this.stock;
  next();
});

productSchema.index({ category: 1 });
productSchema.index({ inStock: 1 });

module.exports = mongoose.model('Product', productSchema);
