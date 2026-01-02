// Cloudinary service for image uploads
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY;
const API_SECRET = import.meta.env.VITE_CLOUDINARY_API_SECRET;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  created_at: string;
}

export const cloudinaryService = {
  /**
   * Upload a file to Cloudinary
   * @param file - The file to upload
   * @param options - Additional upload options
   * @returns Promise with upload result
   */
  async uploadFile(file: File, options: {
    folder?: string;
    transformation?: string[];
    publicId?: string;
  } = {}): Promise<CloudinaryUploadResult> {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      throw new Error('Cloudinary configuration is missing. Please check your environment variables.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    if (options.folder) {
      formData.append('folder', options.folder);
    }

    if (options.publicId) {
      formData.append('public_id', options.publicId);
    }

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Upload failed: ${errorData.error?.message || 'Unknown error'}`);
    }

    const result: CloudinaryUploadResult = await response.json();
    return result;
  },

  /**
   * Upload a base64 image string to Cloudinary
   * @param base64String - The base64 encoded image
   * @param options - Additional upload options
   * @returns Promise with upload result
   */
  async uploadBase64(base64String: string, options: {
    folder?: string;
    publicId?: string;
  } = {}): Promise<CloudinaryUploadResult> {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      throw new Error('Cloudinary configuration is missing. Please check your environment variables.');
    }

    const formData = new FormData();
    formData.append('file', base64String);
    formData.append('upload_preset', UPLOAD_PRESET);

    if (options.folder) {
      formData.append('folder', options.folder);
    }

    if (options.publicId) {
      formData.append('public_id', options.publicId);
    }

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Upload failed: ${errorData.error?.message || 'Unknown error'}`);
    }

    const result: CloudinaryUploadResult = await response.json();
    return result;
  },

  /**
   * Delete an image from Cloudinary
   * @param publicId - The public ID of the image to delete
   * @returns Promise with deletion result
   */
  async deleteImage(publicId: string): Promise<any> {
    if (!CLOUD_NAME) {
      throw new Error('Cloudinary configuration is missing.');
    }

    // Note: This requires server-side implementation with API secret
    // For client-side, you'd need to implement this on your backend
    throw new Error('Delete operation requires server-side implementation');
  },

  /**
   * Generate a Cloudinary URL with transformations
   * @param publicId - The public ID of the image
   * @param transformations - Array of transformation strings
   * @returns The transformed URL
   */
  generateUrl(publicId: string, transformations: string[] = []): string {
    if (!CLOUD_NAME) {
      throw new Error('Cloudinary configuration is missing.');
    }

    const transformationString = transformations.length > 0 ? transformations.join(',') + '/' : '';
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformationString}${publicId}`;
  }
};