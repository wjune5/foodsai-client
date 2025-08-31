import { InventoryImage } from "@/shared/entities/inventory";
 
export interface InventoryCreate {
  name: string;
  quantity: number;
  perOptQuantity: number;
  unit: string;
  price?: number;
  position?: string;
  category: string;
  expirationDays?: number;
  dateFrom?: Date;
  img?: InventoryImage;
  iconColor?: string;
}

export interface InventoryUpdate {
  name?: string;
  quantity?: number;
  perOptQuantity?: number;
  unit?: string;
  category?: string;
  expirationDays?: number;
  img?: InventoryImage;
  iconColor?: string;
}

