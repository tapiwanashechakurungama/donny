import { uploadToCloudinary } from './cloudinary';

export async function uploadImage(file: File, folder: string = 'events'): Promise<string> {
  try {
    // Upload to Cloudinary
    const imageUrl = await uploadToCloudinary(file);
    console.log('Event image uploaded to Cloudinary:', imageUrl);
    return imageUrl;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw new Error('Failed to upload image');
  }
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, GIF, and WebP images are allowed' };
  }

  // Check file size (5MB max)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { valid: false, error: 'Image size must be less than 5MB' };
  }

  return { valid: true };
}

export function getImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) {
    return 'https://res.cloudinary.com/dln1sjqtu/image/upload/v1699999999/default-event.jpg'; // Default event image
  }
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // For Cloudinary URLs, they should already be full URLs
  return imagePath;
}
