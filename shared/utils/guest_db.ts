import Dexie, { Table } from 'dexie';
import { Inventory, Recipe } from '../entities/inventory';
import { GuestUser, UserSettings } from '../entities/user';

// Define the database class
export class GuestDatabase extends Dexie {
  users!: Table<GuestUser>;
  inventoryItems!: Table<Inventory>;
  recipes!: Table<Recipe>;
  settings!: Table<UserSettings>;

  constructor() {
    super('ButloGuestDB');
    
    this.version(1).stores({
      users: '++id, username, email',
      inventoryItems: '++id, name, category, expirationDate, dateFrom',
      recipes: '++id, name, tags',
      settings: '++id'
    });
  }

  // User management
  async createUser(userData: Omit<GuestUser, 'id' | 'createTime' | 'updateTime'>): Promise<GuestUser> {
    const user: GuestUser = {
      ...userData,
      id: crypto.randomUUID(),
      createTime: new Date(),
      updateTime: new Date()
    };
    
    await this.users.add(user);
    return user;
  }

  async getUser(userId: string): Promise<GuestUser | undefined> {
    return await this.users.get(userId);
  }

  async updateUser(userId: string, updates: Partial<GuestUser>): Promise<void> {
    await this.users.update(userId, {
      ...updates,
      updateTime: new Date()
    });
  }

  async deleteUser(userId: string): Promise<void> {
    // Delete all user data
    await this.transaction('rw', [this.users, this.inventoryItems, this.recipes, this.settings], async () => {
      await this.users.delete(userId);
      await this.inventoryItems.clear(); // Clear all inventory items
      await this.recipes.clear(); // Clear all recipes
      await this.settings.clear(); // Clear all settings
    });
  }

  // Inventory management
  async addInventoryItem(item: Omit<Inventory, 'id' | 'createTime' | 'updateTime'>): Promise<Inventory> {
    const inventoryItem: Inventory = {
      ...item,
      id: crypto.randomUUID(),
      createTime: new Date(),
      updateTime: new Date()
    };
    
    await this.inventoryItems.add(inventoryItem);
    return inventoryItem;
  }

  async getInventoryItems(): Promise<Inventory[]> {
    return await this.inventoryItems.toArray();
  }

  async getInventoryItem(id: string): Promise<Inventory | undefined> {
    return await this.inventoryItems.get(id);
  }

  async updateInventoryItem(id: string, updates: Partial<Inventory>): Promise<void> {
    await this.inventoryItems.update(id, {
      ...updates,
      updateTime: new Date()
    });
  }

  async deleteInventoryItem(id: string): Promise<void> {
    await this.inventoryItems.delete(id);
  }

  async getInventoryItemsByCategory(category: string): Promise<Inventory[]> {
    return await this.inventoryItems.where('category').equals(category).toArray();
  }

  async getExpiringItems(days: number = 3): Promise<Inventory[]> {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    return await this.inventoryItems
      .where('expirationDate')
      .between(now.toISOString(), futureDate.toISOString())
      .toArray();
  }

  // Recipe management
  async addRecipe(recipe: Omit<Recipe, 'id' | 'createTime' | 'updateTime'>): Promise<Recipe> {
    const newRecipe: Recipe = {
      ...recipe,
      id: crypto.randomUUID(),
      createTime: new Date(),
      updateTime: new Date()
    };
    
    await this.recipes.add(newRecipe);
    return newRecipe;
  }

  async getRecipes(): Promise<Recipe[]> {
    return await this.recipes.toArray();
  }

  async getRecipe(id: string): Promise<Recipe | undefined> {
    return await this.recipes.get(id);
  }

  async updateRecipe(id: string, updates: Partial<Recipe>): Promise<void> {
    await this.recipes.update(id, {
      ...updates,
      updateTime: new Date()
    });
  }

  async deleteRecipe(id: string): Promise<void> {
    await this.recipes.delete(id);
  }

  async searchRecipes(query: string): Promise<Recipe[]> {
    return await this.recipes
      .filter(recipe => 
        (recipe.name?.toLowerCase().includes(query.toLowerCase()) ?? false) ||
        (recipe.description?.toLowerCase().includes(query.toLowerCase()) ?? false) ||
        (recipe.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ?? false)
      )
      .toArray();
  }

  // Settings management
  async getSettings(): Promise<UserSettings | undefined> {
    return await this.settings.get('default');
  }

  async updateSettings(updates: Partial<UserSettings>): Promise<void> {
    const existing = await this.settings.get('default');
    if (existing) {
      await this.settings.update('default', {
        ...updates,
        updateTime: new Date()
      });
    } else {
      await this.settings.add({
        id: 'default',
        storageType: 'local',
        autoBackup: false,
        backupFrequency: 'never',
        theme: 'auto',
        language: 'en',
        createTime: new Date(),
        updateTime: new Date(),
        ...updates
      });
    }
  }

  // Data export/import
  async exportData(): Promise<{
    user: GuestUser | undefined;
    inventoryItems: Inventory[];
    recipes: Recipe[];
    settings: UserSettings | undefined;
    exportDate: Date;
  }> {
    const user = await this.users.toArray().then(users => users[0]);
    const inventoryItems = await this.getInventoryItems();
    const recipes = await this.getRecipes();
    const settings = await this.getSettings();

    return {
      user,
      inventoryItems,
      recipes,
      settings,
      exportDate: new Date()
    };
  }

  async importData(data: {
    user?: GuestUser;
    inventoryItems?: Inventory[];
    recipes?: Recipe[];
    settings?: UserSettings;
  }): Promise<void> {
    await this.transaction('rw', [this.users, this.inventoryItems, this.recipes, this.settings], async () => {
      // Clear existing data
      await this.users.clear();
      await this.inventoryItems.clear();
      await this.recipes.clear();
      await this.settings.clear();

      // Import new data
      if (data.user) {
        await this.users.add(data.user);
      }
      if (data.inventoryItems) {
        await this.inventoryItems.bulkAdd(data.inventoryItems);
      }
      if (data.recipes) {
        await this.recipes.bulkAdd(data.recipes);
      }
      if (data.settings) {
        await this.settings.add(data.settings);
      }
    });
  }

  // Database utilities
  async clearAllData(): Promise<void> {
    await this.transaction('rw', [this.users, this.inventoryItems, this.recipes, this.settings], async () => {
      await this.users.clear();
      await this.inventoryItems.clear();
      await this.recipes.clear();
      await this.settings.clear();
    });
  }

  async getDatabaseSize(): Promise<number> {
    const userCount = await this.users.count();
    const inventoryCount = await this.inventoryItems.count();
    const recipeCount = await this.recipes.count();
    const settingsCount = await this.settings.count();
    
    return userCount + inventoryCount + recipeCount + settingsCount;
  }
}

// Create and export a singleton instance
export const guestDB = new GuestDatabase(); 