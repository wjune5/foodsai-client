import { useState } from 'react';
import { useAuth } from '@/shared/context/AuthContext';
import { databaseService } from '@/shared/services/DatabaseService';
import { API_ENDPOINTS } from '@/shared/constants/api';

export interface UploadResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
  fileType?: string;
  isSVG?: boolean;
  inventoryItems?: any[];
  extractionId?: string;
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
      // Standard validation for other image types (10MB max for AI processing)
      if (file.size > 1 * 1024 * 1024) {
        return { success: false, error: 'File size must be less than 1MB' };
      }
    }

    setIsUploading(true);

    try {
      let imageUrl: string;
      let uploadResult: any = {};

      // Upload to UPLOAD endpoint for AI processing
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(API_ENDPOINTS.UPLOAD, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      // Check if response has content
      const responseText = await response.text();
      
      if (!responseText) {
        throw new Error('Empty response from server');
      }

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        throw new Error('Invalid JSON response from server');
      }
        
        // The UPLOAD endpoint returns data wrapped in a response structure
        if (responseData.data) {
          // Success response from backend
          const result = responseData.data;
          imageUrl = result.filename || file.name; // Use filename as imageUrl for now
          uploadResult = {
            fileType: file.type,
            isSVG,
            inventoryItems: result.inventory_items || [],
            extractionId: result.extraction_id
          };
        } else {
          // Fallback for unexpected response format
          imageUrl = file.name;
          uploadResult = { fileType: file.type, isSVG };
        }
      

      return { 
        success: true, 
        imageUrl,
        fileType: uploadResult.fileType,
        isSVG: uploadResult.isSVG,
        inventoryItems: uploadResult.inventoryItems,
        extractionId: uploadResult.extractionId
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