import React from 'react';
import { 
  Apple, 
  Milk, 
  Beef, 
  Wheat, 
  Coffee,
  Egg,
  Fish,
  Cookie,
  Carrot,
  Banana,
  Cherry,
  Wine,
  Sandwich,
  Pizza,
  Soup,
  Salad,
  IceCream
} from 'lucide-react';
import { CustomIcon } from '../entities/setting';
import { databaseService } from '../services/DatabaseService';

export type FoodIconKey = 
  | 'apple' | 'banana' | 'cherry' | 'carrot' | 'salad'
  | 'milk' | 'egg' | 'cheese' 
  | 'beef' | 'fish' | 'chicken'
  | 'wheat' | 'bread' | 'pizza'
  | 'coffee' | 'wine' | 'water'
  | 'cookie' | 'ice-cream' | 'sandwich'
  | 'soup' | 'generic'
  | string; // Allow custom icon keys

// Default built-in food icons following CustomIcon structure
export const DEFAULT_FOOD_ICONS: CustomIcon[] = [
  // Fruit category
  {
    id: 'apple',
    name: 'Apple',
    category: '3',
    svgContent: 'apple',
    builtIn: true,
    createdBy: 'system',
    createTime: new Date('2025-09-01'),
    isActive: true
  },
  {
    id: 'banana',
    name: 'Banana',
    category: '3',
    svgContent: 'banana',
    builtIn: true,
    createdBy: 'system',
    createTime: new Date('2025-09-01'),
    isActive: true
  },
  {
    id: 'cherry',
    name: 'Cherry',
    category: '3',
    svgContent: 'cherry',
    builtIn: true,
    createdBy: 'system',
    createTime: new Date('2025-09-01'),
    isActive: true
  },
  
  // Vegetable category
  {
    id: 'carrot',
    name: 'Carrot',
    category: '0',
    svgContent: 'carrot',
    builtIn: true,
    createdBy: 'system',
    createTime: new Date('2025-09-01'),
    isActive: true
  },
  {
    id: 'salad',
    name: 'Leafy Greens',
    category: '0',
    svgContent: 'salad',
    builtIn: true,
    createdBy: 'system',
    createTime: new Date('2025-09-01'),
    isActive: true
  },
  
  // Dairy category
  {
    id: 'milk',
    name: 'Milk',
    category: '1',
    svgContent: 'milk',
    builtIn: true,
    createdBy: 'system',
    createTime: new Date('2025-09-01'),
    isActive: true
  },
  {
    id: 'egg',
    name: 'Eggs',
    category: '1',
    svgContent: 'egg',
    builtIn: true,
    createdBy: 'system',
    createTime: new Date('2025-09-01'),
    isActive: true
  },
  
  // Meat category
  {
    id: 'beef',
    name: 'Beef',
    category: '2',
    svgContent: 'beef',
    builtIn: true,
    createdBy: 'system',
    createTime: new Date('2025-09-01'),
    isActive: true
  },
  {
    id: 'fish',
    name: 'Fish',
    category: '2',
    svgContent: 'fish',
    builtIn: true,
    createdBy: 'system',
    createTime: new Date('2025-09-01'),
    isActive: true
  },
  
  // Grain category
  {
    id: 'wheat',
    name: 'Grains',
    category: '4',
    svgContent: 'wheat',
    builtIn: true,
    createdBy: 'system',
    createTime: new Date('2025-09-01'),
    isActive: true
  },
  {
    id: 'pizza',
    name: 'Bread/Pizza',
    category: '4',
    svgContent: 'pizza',
    builtIn: true,
    createdBy: 'system',
    createTime: new Date('2025-09-01'),
    isActive: true
  },
  
  // Beverages category
  {
    id: 'coffee',
    name: 'Coffee/Tea',
    category: '5',
    svgContent: 'coffee',
    builtIn: true,
    createdBy: 'system',
    createTime: new Date('2025-09-01'),
    isActive: true
  },
  {
    id: 'wine',
    name: 'Wine',
    category: '5',
    svgContent: 'wine',
    builtIn: true,
    createdBy: 'system',
    createTime: new Date('2025-09-01'),
    isActive: true
  },
  
  // Snacks category
  {
    id: 'cookie',
    name: 'Cookies',
    category: '6',
    svgContent: 'cookie',
    builtIn: true,
    createdBy: 'system',
    createTime: new Date('2025-09-01'),
    isActive: true
  },
  {
    id: 'ice-cream',
    name: 'Ice Cream',
    category: '6',
    svgContent: 'ice-cream',
    builtIn: true,
    createdBy: 'system',
    createTime: new Date('2025-09-01'),
    isActive: true
  },
  
  // Other category
  {
    id: 'sandwich',
    name: 'Sandwich',
    category: '7',
    svgContent: 'sandwich',
    builtIn: true,
    createdBy: 'system',
    createTime: new Date('2025-09-01'),
    isActive: true
  },
  {
    id: 'soup',
    name: 'Soup',
    category: '7',
    svgContent: 'soup',
    builtIn: true,
    createdBy: 'system',
    createTime: new Date('2025-09-01'),
    isActive: true
  },
];

// Helper function to get icons by category
export const getIconsByCategory = async (category: string): Promise<IconData[]> => {
  return await databaseService.getCustomIconsByCategory(category).then(item => item.map(convertToIconData));
};

// Helper function to get all categories
export const getCategories = (): string[] => {
  return [...new Set(DEFAULT_FOOD_ICONS.map(icon => icon.category))];
};

// Helper function to get icon by ID
export const getIconById = (id: string): CustomIcon | undefined => {
  return DEFAULT_FOOD_ICONS.find(icon => icon.id === id);
};

// Helper function to get icon by key (alias for getIconById)
export const getIconByKey = (key: string): CustomIcon | undefined => {
  return getIconById(key);
};

// Helper function to get icon data by key (returns IconData format)
export const getIconDataByKey = async (key: string): Promise<IconData | undefined> => {
  const customIcon = await databaseService.getCustomIcon(key);
  if (customIcon) {
    return convertToIconData(customIcon);
  }
  return undefined;
};

// Helper function to get all icons
export const getAllIcons = async (): Promise<IconData[]> => {
  return databaseService.getCustomIcons().then(item => item.map(convertToIconData));
};

// IconData type to match the expected structure in AddForm
export interface IconData {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  isCustom: boolean;
  svg?: string;
}

// Mapping of icon IDs to Lucide React components
export const ICON_COMPONENT_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  apple: Apple,
  banana: Banana,
  cherry: Cherry,
  carrot: Carrot,
  salad: Salad,
  milk: Milk,
  egg: Egg,
  beef: Beef,
  fish: Fish,
  wheat: Wheat,
  coffee: Coffee,
  wine: Wine,
  cookie: Cookie,
  'ice-cream': IceCream,
  sandwich: Sandwich,
  soup: Soup,
  pizza: Pizza
};

// Convert CustomIcon to IconData format
const convertToIconData = (customIcon: CustomIcon): IconData => {
  const IconComponent = ICON_COMPONENT_MAP[customIcon.svgContent];
  return {
    key: customIcon.id,
    label: customIcon.name,
    icon: IconComponent || (() => <div>Icon</div>), // Fallback component
    isCustom: !customIcon.builtIn,
    svg: customIcon.svgContent
  };
};

// Export FOOD_ICONS as an alias for DEFAULT_FOOD_ICONS
export const FOOD_ICONS = DEFAULT_FOOD_ICONS;

// Helper function to render SVG icon
export const renderSvgIcon = (svgContent: string, className: string = "w-6 h-6") => {
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
};

// Default icon for categories
export const DEFAULT_CATEGORY_ICONS: Record<string, string> = {
  fruit: 'apple',
  vegetable: 'carrot',
  dairy: 'milk',
  meat: 'beef',
  grain: 'wheat',
  beverages: 'coffee',
  snacks: 'cookie',
  other: 'sandwich'
}; 