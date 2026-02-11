import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cloudinaryService } from '../services/cloudinary';
import { supabase } from '../services/supabase';

const ImageUpload: React.FC<{
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  saveToMedia?: boolean;
  onMediaUpdate?: (mediaItem: any) => void;
  disabled?: boolean;
  folder?: string;
  category?: string;
}> = ({ 
  value, 
  onChange, 
  label = "Image", 
  placeholder = "Enter image URL or drag & drop",
  saveToMedia = true,
  onMediaUpdate,
  disabled = false,
  folder = 'about/hero',
  category = 'about'
}) => {
  const [imageError, setImageError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageError = () => setImageError(true);
  const handleImageLoad = () => setImageError(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        await handleFileUpload(file);
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        await handleFileUpload(file);
      }
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      // Upload to Cloudinary first
      const cloudinaryResult = await cloudinaryService.uploadFile(file, {
        folder: `kebele/${folder}`
      });

      const cloudinaryUrl = cloudinaryResult.secure_url;

      // Save to media table in Supabase
      if (saveToMedia) {
        const { data: mediaData, error: mediaError } = await supabase
          .from('media')
          .insert([{
            title: file.name,
            description: '',
            alt_text: '',
            caption: '',
            media_url: cloudinaryUrl,
            cloudinary_public_id: cloudinaryResult.public_id,
            category: category,
            folder: folder,
            status: 'published'
          }])
          .select()
          .single();

        if (mediaError) {
          console.error('Error saving to media table:', mediaError);
        } else if (mediaData && onMediaUpdate) {
          onMediaUpdate(mediaData);
        }
      }

      onChange(cloudinaryUrl);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file: ' + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-semibold retro-text">{label}</label>}
      
      {/* Drag & Drop Area - Always visible */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`
          border-3 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200
          ${isDragging 
            ? 'border-emerald-500 bg-emerald-50' 
            : 'border-gray-300 hover:border-emerald-400 hover:bg-gray-50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
        
        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mb-2"></div>
            <p className="text-sm text-gray-600">Uploading to Cloudinary...</p>
          </div>
        ) : value ? (
          <div className="flex flex-col items-center">
            <Upload className="w-8 h-8 text-emerald-500 mb-2" />
            <p className="text-sm font-medium text-gray-700">Click or drag to replace image</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="w-10 h-10 text-gray-400 mb-2" />
            <p className="text-sm font-medium text-gray-700">Drag & drop an image</p>
            <p className="text-xs text-gray-500 mt-1">or click to browse</p>
            <p className="text-xs text-gray-400 mt-2">Supports: JPG, PNG, GIF, WebP</p>
          </div>
        )}
      </div>

      {/* Image Preview with Remove Button */}
      {value && (
        <div className="space-y-3">
          <div className="relative">
            {imageError ? (
              <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-gray-200">
                <div className="text-center">
                  <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                  <span className="text-gray-500 text-sm">Invalid image URL</span>
                </div>
              </div>
            ) : (
              <img
                src={value}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
            )}
            {/* Remove Button */}
            <button
              type="button"
              onClick={handleRemoveImage}
              disabled={disabled}
              className={`
                absolute -top-2 -right-2 z-10 w-8 h-8 flex items-center justify-center
                bg-red-500 text-white rounded-full shadow-lg
                hover:bg-red-600 hover:scale-110 transition-all duration-200
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* URL Input - Only show when no image */}
      {!value && (
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="retro-input w-full"
          disabled={disabled}
        />
      )}
    </div>
  );
};

export default ImageUpload;
