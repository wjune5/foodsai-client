export interface Inventory {
    id: string;
    name: string;
    img: string;
    expirationDate: string;
    quantity: number;
    originalQuantity: number;
    unit: string;
    price: number;
    position: string;
    category: string;
    dateFrom: string;
    createdBy: string;
    updatedBy: string;
    createTime: Date;
    updateTime: Date;
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
    img?: string;
    createTime: Date;
    updateTime: Date;
}