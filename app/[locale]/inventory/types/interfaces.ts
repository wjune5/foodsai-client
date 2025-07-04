 
export interface FoodItemCreate {
  name: string;
  quantity: number;
  unit: string;
  category: string;
  expirationDate?: string;
}

export interface FoodItemUpdate {
  name?: string;
  quantity?: number;
  unit?: string;
  category?: string;
  expirationDate?: string;
}