
export interface Recipe {
    id: string;
    name: string;
    ingredients: string[];
    instructions: string[];
    cooking_time: number;
    missing_ingredients?: string[];
    created_by?: string;
    updated_by?: string;
    create_time?: string;
    update_time?: string;
  }
  
  export interface RecipeCreate {
    name: string;
    ingredients: string[];
    instructions: string[];
    cooking_time: number;
  }
  
  export interface RecipeUpdate {
    name?: string;
    ingredients?: string[];
    instructions?: string[];
    cooking_time?: number;
  }
  