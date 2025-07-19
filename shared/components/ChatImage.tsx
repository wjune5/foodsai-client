import React, { useState, useEffect } from 'react';
import { useAuth } from '../services/AuthContext';
import { guestModeService } from '../services/GuestModeService';

interface ChatImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const ChatImage: React.FC<ChatImageProps> = ({ src, alt, className, style, onClick }) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isSVG, setIsSVG] = useState(false);
  const { isGuestMode } = useAuth();

  useEffect(() => {
    const loadImage = async () => {
      try {
        setLoading(true);
        setError(false);

        // Check if this is a guest image URL
        if (src.startsWith('/guest-image/')) {
          if (isGuestMode) {
            // Extract image ID from URL
            const imageId = src.replace('/guest-image/', '');
            const imageData = await guestModeService.getImageDataUrl(imageId);
            
            if (imageData) {
              setImageSrc(imageData);
              // Check if it's an SVG based on data URL
              setIsSVG(imageData.startsWith('data:image/svg+xml'));
            } else {
              setError(true);
            }
          } else {
            setError(true);
          }
        } else {
          // Regular cloud/server image
          setImageSrc(src);
          // Check if it's an SVG based on file extension
          setIsSVG(src.toLowerCase().endsWith('.svg'));
        }
      } catch (err) {
        console.error('Failed to load image:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [src, isGuestMode]);

  if (loading) {
    return (
      <div className={`bg-gray-200 animate-pulse rounded-lg ${className}`} style={style}>
        <div className="flex items-center justify-center h-full text-gray-400">
          Loading...
        </div>
      </div>
    );
  }

  if (error || !imageSrc) {
    return (
      <div className={`bg-gray-200 rounded-lg flex items-center justify-center ${className}`} style={style}>
        <div className="text-gray-400 text-sm">
          Failed to load image
        </div>
      </div>
    );
  }

  // For SVG files, we use object tag for better security
  // This prevents potential XSS from malicious SVG files
  if (isSVG && !src.startsWith('data:')) {
    return (
      <object
        data={imageSrc}
        type="image/svg+xml"
        className={className}
        style={style}
        onClick={onClick}
        onError={() => setError(true)}
        aria-label={alt}
      >
        {/* Fallback content if object fails to load */}
        <div className="text-gray-400 text-sm">
          SVG not supported
        </div>
      </object>
    );
  }

  // For data URLs or regular images, use img tag
  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      style={style}
      onClick={onClick}
      onError={() => setError(true)}
    />
  );
};

export default ChatImage; 