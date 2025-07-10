// agent tools for inventory, recipes, and cloud sync

import { guestModeService } from "./GuestModeService";

export interface ToolQuery {
  operation: string;
  data?: Record<string, any>;
}

export class InventoryTool {
  name = "inventory_manager";
  description = `Manage inventory items in the fridge database.\nOperations: add, remove, update, list, search, check_expiring\nFormat: {operation: 'add|remove|update|list|search|check_expiring', data: {...}}`;

  run(query: string): string {
    try {
      const params: ToolQuery = JSON.parse(query);
      const { operation, data = {} } = params;
      switch (operation) {
        case "add":
          return this.addItem(data);
        case "remove":
          return this.removeItem(data);
        case "update":
          return this.updateItem(data);
        case "list":
          return this.listItems(data);
        case "search":
          return this.searchItems(data);
        case "check_expiring":
          return this.checkExpiringItems(data);
        default:
          return "Invalid operation";
      }
    } catch (e: any) {
      return `Error: ${e.message}`;
    }
  }

  private addItem(data: Record<string, any>): string {
    // const isGuestMode = guestModeService.isGuestModeActive();
    const item = {
      name: data.entity,
      quantity: data.quantity,
      unit: data.unit,
      expirationDate: data.expiration_date,
      img: "",
      category: data.category,
      dateFrom: new Date(),
      createdBy: "guest",
      updatedBy: "guest"
    }
    guestModeService.addInventoryItem(item);
    return `Added ${data.name} to inventory`;
  }

  private removeItem(data: Record<string, any>): string {
    // Mock response
    return `Removed ${data.name} from inventory`;
  }

  private updateItem(data: Record<string, any>): string {
    // Mock response
    return `Updated ${data.name} in inventory`;
  }

  private listItems(data: Record<string, any>): string {
    // Mock response
    return `Listing all items in inventory`;
  }

  private searchItems(data: Record<string, any>): string {
    // Mock response
    return `Searched inventory for ${JSON.stringify(data)}`;
  }

  private checkExpiringItems(data: Record<string, any>): string {
    const days = data.days ?? 3;
    // Mock response
    return `Found 2 items expiring in next ${days} days: Milk (expires tomorrow), Eggs (expires in 2 days)`;
  }
}

export class RecipeTool {
  name = "recipe_manager";
  description = `Manage recipes and generate new ones.\nOperations: generate, save, list, search, get_by_ingredients\nFormat: {operation: 'generate|save|list|search|get_by_ingredients', data: {...}}`;

  run(query: string): string {
    try {
      const params: ToolQuery = JSON.parse(query);
      const { operation, data = {} } = params;
      switch (operation) {
        case "generate":
          return this.generateRecipe(data);
        case "save":
          return this.saveRecipe(data);
        case "list":
          return this.listRecipes(data);
        case "search":
          return this.searchRecipes(data);
        case "get_by_ingredients":
          return this.getRecipesByIngredients(data);
        default:
          return "Invalid operation";
      }
    } catch (e: any) {
      return `Error: ${e.message}`;
    }
  }

  private generateRecipe(data: Record<string, any>): string {
    const ingredients = data.ingredients || [];
    const dietaryRestrictions = data.dietary_restrictions || [];
    const cuisineType = data.cuisine_type || 'any';
    // Mock response
    return JSON.stringify({
      name: "Quick Pasta Primavera",
      ingredients: ["pasta", "vegetables", "olive oil", "garlic"],
      instructions: ["Boil pasta", "Sauté vegetables", "Combine and serve"],
      prep_time: "10 minutes",
      cook_time: "15 minutes",
      servings: 4
    });
  }

  private saveRecipe(data: Record<string, any>): string {
    // Mock response
    return `Saved recipe: ${data.name}`;
  }

  private listRecipes(data: Record<string, any>): string {
    // Mock response
    return `Listing all recipes`;
  }

  private searchRecipes(data: Record<string, any>): string {
    // Mock response
    return `Searched recipes for ${JSON.stringify(data)}`;
  }

  private getRecipesByIngredients(data: Record<string, any>): string {
    // Mock response
    return `Recipes found for ingredients: ${JSON.stringify(data.ingredients)}`;
  }
}

export class CloudSyncTool {
  name = "cloud_sync";
  description = `Sync data between local Dexie DB and cloud PostgreSQL.\nOperations: sync_up, sync_down, backup, restore\nFormat: {operation: 'sync_up|sync_down|backup|restore', data: {...}}`;

  run(query: string): string {
    try {
      const params: ToolQuery = JSON.parse(query);
      const { operation, data = {} } = params;
      switch (operation) {
        case "sync_up":
          return this.syncToCloud(data);
        case "sync_down":
          return this.syncFromCloud(data);
        case "backup":
          return this.backupToCloud(data);
        case "restore":
          return this.restoreFromCloud(data);
        default:
          return "Invalid operation";
      }
    } catch (e: any) {
      return `Error: ${e.message}`;
    }
  }

  private syncToCloud(data: Record<string, any>): string {
    // Mock response
    return "Successfully synced local changes to cloud";
  }

  private syncFromCloud(data: Record<string, any>): string {
    // Mock response
    return "Successfully synced cloud data to local";
  }

  private backupToCloud(data: Record<string, any>): string {
    // Mock response
    return "Backup completed to cloud";
  }

  private restoreFromCloud(data: Record<string, any>): string {
    // Mock response
    return "Restore from cloud completed";
  }
}
