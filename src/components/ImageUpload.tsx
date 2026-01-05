import React, { useState } from 'react';

const ImageUpload: React.FC<{
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  saveToMedia?: boolean;
  onMediaUpdate?: (mediaItem: any) => void;
  disabled?: boolean;
}> = ({ value, onChange, label = "Image URL", placeholder = "Enter image URL", saveToMedia = false, onMediaUpdate, disabled = false }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => setImageError(true);
  const handleImageLoad = () => setImageError(false);

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-semibold retro-text">{label}</label>}
      <div className="space-y-3">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="retro-input w-full"
          disabled={disabled}
        />
        {value && (
          <div className="space-y-3">
            <div className="relative">
              <img
                src={value}
                alt="Preview"
                className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
              {imageError && (
                <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Invalid image URL</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Image preview</span>
              <button
                type="button"
                onClick={() => onChange('')}
                className="text-red-500 hover:text-red-700 text-sm font-medium"
                disabled={disabled}
              >
                Remove
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;