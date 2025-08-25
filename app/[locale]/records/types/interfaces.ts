import { InventoryImage } from "@/shared/entities/inventory";

export interface RecipeCreate {
  name: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  cookingTime?: number;
  servings?: number;
  difficulty?: string;
  tags?: string[];
  img?: InventoryImage;
}

