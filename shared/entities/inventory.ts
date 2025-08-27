export interface Inventory {
    id: string;
    name: string;
    img?: InventoryImage;
    expirationDays?: number;
    quantity: number;
    originalQuantity: number;
    unit: string;
    price?: number;
    position?: string;
    category: string;
    dateFrom?: Date;
    iconColor?: string;
    createdBy: string;
    updatedBy: string;
    createTime: Date;
    updateTime: Date;
}

export interface InventoryImage {
    id: string;
    fileName: string;
    mimeType: string;
    size: number;
    data: string;
}

// Define custom icon interface for user-uploaded SVG icons
export interface CustomIcon {
  id: string;
  name: string;
  category: string;
  svgContent: string; // Sanitized SVG content
  createdBy: string;
  createdTime: Date;
  isActive: boolean;
}

export interface Recipe {
    id: string;
    name: string;
    description?: string;
    ingredients: string[];
    instructions: string[];
    cookingTime?: number;
    servings?: number;
    difficulty?: string;
    tags?: string[];
    img?: InventoryImage;
    createTime: Date;
    updateTime: Date;
}

export interface Category {
    id?: string;
    name: string;
    displayName: string;
    color?: string;
    icon?: string;
    isDefault?: boolean;
    sortValue: number;
    count?: number;
}

export interface ConsumptionHistory {
    id: string;
    type: 'recipe' | 'food';
    itemId?: string; // For food consumption, refers to inventory item
    itemName?: string;
    quantity: number;
    unit?: string;
    consumedAt: Date;
    notes?: string;
    createTime: Date;
    updateTime: Date;
}