import { useState } from 'react';
import { useAuth } from '@/shared/context/AuthContext';
import { guestModeService } from '@/shared/services/GuestModeService';

export interface UploadResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
  fileType?: string;
  isSVG?: boolean;
}

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { isGuestMode } = useAuth();

  const uploadImage = async (file: File): Promise<UploadResult> => {
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'Only image files are allowed' };
    }

    // Special validation for SVG files
    const isSVG = file.type === 'image/svg+xml';
    if (isSVG) {
      // Additional size check for SVG - they should generally be small
      if (file.size > 1 * 1024 * 1024) { // 1MB for SVG
        return { success: false, error: 'SVG files must be less than 1MB' };
      }
      
      // Basic SVG content validation
      try {
        const text = await file.text();
        if (!text.includes('<svg') || !text.includes('</svg>')) {
          return { success: false, error: 'Invalid SVG file format' };
        }
      } catch (error) {
        return { success: false, error: 'Could not read SVG file' };
      }
    } else {
      // Standard validation for other image types (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        return { success: false, error: 'File size must be less than 5MB' };
      }
    }

    setIsUploading(true);

    try {
      let imageUrl: string;
      let uploadResult: any = {};

      if (isGuestMode) {
        // Store in Dexie database for guest mode
        imageUrl = await guestModeService.uploadImage(file);
        uploadResult = { fileType: file.type, isSVG };
      } else {
        // Upload to cloud for authenticated users
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Upload failed');
        }

        const data = await response.json();
        imageUrl = data.imageUrl;
        uploadResult = {
          fileType: data.fileType,
          isSVG: data.isSVG
        };
      }

      return { 
        success: true, 
        imageUrl,
        fileType: uploadResult.fileType,
        isSVG: uploadResult.isSVG
      };
    } catch (error) {
      console.error('Upload error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      };
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadImage,
    isUploading,
    isGuestMode
  };
}; 