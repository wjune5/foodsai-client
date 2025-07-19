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

export type FoodIconKey = 
  | 'apple' | 'banana' | 'cherry' | 'carrot' | 'salad'
  | 'milk' | 'egg' | 'cheese' 
  | 'beef' | 'fish' | 'chicken'
  | 'wheat' | 'bread' | 'pizza'
  | 'coffee' | 'wine' | 'water'
  | 'cookie' | 'ice-cream' | 'sandwich'
  | 'soup' | 'generic';

// Food category icons organized by category
export const FOOD_ICONS: Record<string, { icon: any; label: string; key: FoodIconKey }[]> = {
  fruit: [
    { icon: Apple, label: 'Apple', key: 'apple' },
    { icon: Banana, label: 'Banana', key: 'banana' },
    { icon: Cherry, label: 'Cherry', key: 'cherry' },
  ],
  vegetable: [
    { icon: Carrot, label: 'Carrot', key: 'carrot' },
    { icon: Salad, label: 'Leafy Greens', key: 'salad' },
  ],
  dairy: [
    { icon: Milk, label: 'Milk', key: 'milk' },
    { icon: Egg, label: 'Eggs', key: 'egg' },
  ],
  meat: [
    { icon: Beef, label: 'Beef', key: 'beef' },
    { icon: Fish, label: 'Fish', key: 'fish' },
  ],
  grain: [
    { icon: Wheat, label: 'Grains', key: 'wheat' },
    { icon: Pizza, label: 'Bread/Pizza', key: 'pizza' },
  ],
  beverages: [
    { icon: Coffee, label: 'Coffee/Tea', key: 'coffee' },
    { icon: Wine, label: 'Wine', key: 'wine' },
  ],
  snacks: [
    { icon: Cookie, label: 'Cookies', key: 'cookie' },
    { icon: IceCream, label: 'Ice Cream', key: 'ice-cream' },
  ],
  other: [
    { icon: Sandwich, label: 'Sandwich', key: 'sandwich' },
    { icon: Soup, label: 'Soup', key: 'soup' },
  ]
};

// All icons in a flat array for easy access
export const ALL_FOOD_ICONS = Object.values(FOOD_ICONS).flat();

// Get icons for a specific category
export const getIconsForCategory = (category: string) => {
  return FOOD_ICONS[category] || FOOD_ICONS.other;
};

// Get icon by key
export const getIconByKey = (key: FoodIconKey) => {
  return ALL_FOOD_ICONS.find(icon => icon.key === key);
};

// Default icon for categories
export const DEFAULT_CATEGORY_ICONS: Record<string, FoodIconKey> = {
  fruit: 'apple',
  vegetable: 'carrot',
  dairy: 'milk',
  meat: 'beef',
  grain: 'wheat',
  beverages: 'coffee',
  snacks: 'cookie',
  other: 'sandwich'
}; 