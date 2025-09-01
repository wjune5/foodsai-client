
// Define custom icon interface for user-uploaded SVG icons
export interface CustomIcon {
    id: string;
    name: string;
    categoryName?: string;
    category: string;
    svgContent: string; // Sanitized SVG content
    builtIn: boolean,
    createdBy: string;
    createTime: Date;
    updateTime: Date;
    isActive: boolean;
  }