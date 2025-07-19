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