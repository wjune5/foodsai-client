 
export interface InventoryCreate {
  name: string;
  quantity: number;
  unit: string;
  price?: number;
  position?: string;
  category: string;
  expirationDate?: string;
  dateFrom?: string;
  img?: string;
}

export interface InventoryUpdate {
  name?: string;
  quantity?: number;
  unit?: string;
  category?: string;
  expirationDate?: string;
}

