import Resizer from 'react-image-file-resizer';

// Function to sanitize SVG content by removing script tags and event handlers
export const sanitizeSVG = (svgContent: string): string => {
  // Remove script tags and their content
  let sanitized = svgContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers (onclick, onload, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^>\s]+/gi, '');
  
  // Remove javascript: urls
  sanitized = sanitized.replace(/javascript\s*:[^"']*/gi, '');
  
  // Remove data urls that might contain javascript
  sanitized = sanitized.replace(/data\s*:\s*[^;]*;[^,]*,.*javascript/gi, '');
  
  return sanitized;
};

export const resizeFile = (file: File) =>
  new Promise((resolve) => {
    Resizer.imageFileResizer(
      file,
      500,
      500,
      "JPEG",
      90,
      0,
      (uri) => {
        resolve(uri);
      },
      "base64"
    );
  });

export const saveImage = async (file: File) => {
  const resizedFile = await resizeFile(file);
  const imageData = await fetch(resizedFile as string);
  const imageBlob = await imageData.blob();
  const imageUrl = URL.createObjectURL(imageBlob);
  return imageUrl;
};