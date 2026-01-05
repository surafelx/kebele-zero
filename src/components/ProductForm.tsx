import React, { useState } from 'react';
import ImageUpload from './ImageUpload';

const ProductForm: React.FC<{
  onSubmit: (data: any) => void;
  onCancel: () => void;
  editingItem?: any;
  onOpenMediaLibrary?: () => void;
  onMediaSelected?: (media: any) => void;
}> = ({ onSubmit, onCancel, editingItem, onOpenMediaLibrary, onMediaSelected }) => {
  const [formData, setFormData] = useState({
    name: editingItem?.name || '',
    description: editingItem?.description || '',
    price: editingItem?.price || 0,
    category: editingItem?.category || 'handicraft',
    stock_quantity: editingItem?.stock_quantity || 0,
    image_url: editingItem?.image_url || '',
    is_coming_soon: editingItem?.is_coming_soon || false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-semibold retro-text">Product Name *</label>
          <input
            type="text"
            required
            placeholder="Enter product name"
            className="retro-input w-full"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-semibold retro-text">Category</label>
          <select
            className="retro-input w-full bg-white"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            <option value="handicraft">👐 Handicraft</option>
            <option value="food">🍽️ Food & Beverage</option>
            <option value="clothing">👕 Clothing</option>
            <option value="art">🎨 Art & Decor</option>
            <option value="books">📚 Books</option>
            <option value="other">📦 Other</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold retro-text">Description *</label>
        <textarea
          required
          rows={1}
          placeholder="Describe your product"
          className="retro-input w-full resize-none"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-semibold retro-text">Price ($)</label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            placeholder="0.00"
            className="retro-input w-full"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-semibold retro-text">Stock Quantity</label>
          <input
            type="number"
            required
            min="0"
            placeholder="0"
            className="retro-input w-full"
            value={formData.stock_quantity}
            onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold retro-text">Product Image</label>
        <div className="flex flex-wrap gap-2 mb-2">
          <ImageUpload
            label="Product Image"
            value={formData.image_url}
            onChange={(url) => setFormData({ ...formData, image_url: url })}
            placeholder="Drag & drop product image"
          />
          {onOpenMediaLibrary && (
            <button
              type="button"
              onClick={onOpenMediaLibrary}
              className="retro-btn-secondary px-3 py-2 text-sm"
            >
              📚 Media Library
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="is_coming_soon"
          checked={formData.is_coming_soon}
          onChange={(e) => setFormData({ ...formData, is_coming_soon: e.target.checked })}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="is_coming_soon" className="text-sm font-semibold retro-text">Coming Soon</label>
      </div>

      <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
        <button
          type="submit"
          className="flex-1 retro-btn-success py-2 px-4 text-sm"
        >
          🛍️ {editingItem ? 'Update' : 'Create'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="retro-btn-secondary py-2 px-4 text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ProductForm;