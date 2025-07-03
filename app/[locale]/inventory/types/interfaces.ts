export interface Inventory {
    id: string;
    name: string;
    img: string;
    expirationDate: string;
    quantity: number;
    unit: string;
    category: string;
    dateFrom: string;
    createdBy: string;
    updatedBy: string;
    createTime: string;
    updateTime: string;
  }
  
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