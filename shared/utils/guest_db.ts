import Dexie, { Table } from 'dexie';
import { Category, Inventory, InventoryImage, Recipe, ConsumptionHistory } from '../entities/inventory';
import { CustomIcon } from '../entities/setting';
import { GuestUser, UserSettings } from '../entities/user';

// Define the database class
export class GuestDatabase extends Dexie {
  users!: Table<GuestUser>;
  inventoryItems!: Table<Inventory>;
  recipes!: Table<Recipe>;
  settings!: Table<UserSettings>;
  images!: Table<InventoryImage>;
  categories!: Table<Category>;
  consumptionHistory!: Table<ConsumptionHistory>;
  customIcons!: Table<CustomIcon>;
  constructor() {
    super('ButloGuestDB');
    
    this.version(1).stores({
      users: '++id, username, email',
      inventoryItems: '++id, name, category, expirationDate, dateFrom, img',
      recipes: '++id, name, tags',
      settings: '++id'
    });

    // Version 2: Add images table
    this.version(2).stores({
      users: '++id, username, email',
      inventoryItems: '++id, name, category, expirationDate, dateFrom, img',
      recipes: '++id, name, tags',
      settings: '++id',
      images: '++id, fileName, mimeType, size, data'
    });

    // Version 3: Add custom icons table
    this.version(3).stores({
      users: '++id, username, email',
      inventoryItems: '++id, name, category, expirationDate, dateFrom, img',
      recipes: '++id, name, tags, img, description, ingredients, instructions, cookingTime, servings, difficulty',
      settings: '++id',
      images: '++id, fileName, mimeType, size, data',
      customIcons: '++id, name, category, createdBy, createdTime, isActive',
      categories: '++id, name, displayName, color, icon, isDefault, sortValue'
    });

    // Version 4: Add consumption history table
    this.version(4).stores({
      users: '++id, username, email',
      inventoryItems: '++id, name, category, expirationDate, dateFrom, img',
      recipes: '++id, name, tags, img, description, ingredients, instructions, cookingTime, servings, difficulty',
      settings: '++id',
      images: '++id, fileName, mimeType, size, data',
      customIcons: '++id, name, category, createdBy, createdTime, isActive',
      categories: '++id, name, displayName, color, icon, isDefault, sortValue',
      consumptionHistory: '++id, type, itemId, recipeId, consumedAt, createTime'
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

  async getCategories(): Promise<Category[]> {
    return await this.categories.toArray();
  }

  async getCategory(id: string): Promise<Category> {
    return await this.categories.get(id) as Category;
  }

  async addCategory(category: Omit<Category, 'isDefault' | 'icon'>): Promise<Category> {
    if (!category.id) {
      category.id = crypto.randomUUID()
    }
    await this.categories.add(category);
    return category;
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<void> {
    await this.categories.update(id, {
      ...updates,
    });
  }

  async deleteCategory(id: string): Promise<void> {
    await this.categories.delete(id);
  }

  // Consumption History management
  async addConsumptionHistory(history: Omit<ConsumptionHistory, 'id' | 'createTime' | 'updateTime'>): Promise<ConsumptionHistory> {
    const consumptionHistory: ConsumptionHistory = {
      ...history,
      id: crypto.randomUUID(),
      createTime: new Date(),
      updateTime: new Date()
    };
    
    await this.consumptionHistory.add(consumptionHistory);
    return consumptionHistory;
  }

  async getConsumptionHistory(): Promise<ConsumptionHistory[]> {
    return await this.consumptionHistory.orderBy('consumedAt').reverse().toArray();
  }

  async getConsumptionHistoryByType(type: 'recipe' | 'food'): Promise<ConsumptionHistory[]> {
    return await this.consumptionHistory.where('type').equals(type).sortBy('consumedAt');
  }

  async getConsumptionHistoryByDateRange(startDate: Date, endDate: Date): Promise<ConsumptionHistory[]> {
    return await this.consumptionHistory
      .where('consumedAt')
      .between(startDate, endDate)
      .sortBy('consumedAt');
  }

  async updateConsumptionHistory(id: string, updates: Partial<ConsumptionHistory>): Promise<void> {
    await this.consumptionHistory.update(id, {
      ...updates,
      updateTime: new Date()
    });
  }

  async deleteConsumptionHistory(id: string): Promise<void> {
    await this.consumptionHistory.delete(id);
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

  async getInventoryItemByName(name: string): Promise<Inventory | undefined> {
    return await this.inventoryItems.where('name').equals(name).first();
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

  // Image management methods
  async saveImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const imageId = crypto.randomUUID();
          
          const guestImage: InventoryImage = {
            id: imageId,
            fileName: file.name,
            mimeType: file.type,
            size: file.size,
            data: base64Data
          };

          await this.images.add(guestImage);
          // Return a local URL that can be used to retrieve the image
          resolve(`/guest-image/${imageId}`);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  async getImage(imageId: string): Promise<InventoryImage | undefined> {
    return await this.images.get(imageId);
  }

  async getImageDataUrl(imageId: string): Promise<string | null> {
    const image = await this.getImage(imageId);
    return image ? image.data : null;
  }

  async deleteImage(imageId: string): Promise<void> {
    await this.images.delete(imageId);
  }

  async getAllImages(): Promise<InventoryImage[]> {
    return await this.images.toArray();
  }

  // Custom icon operations
  async addCustomIcon(icon: CustomIcon): Promise<CustomIcon> {
    if (!icon.id) {
      icon.id = crypto.randomUUID();
    }
    const id = await this.customIcons.add(icon as CustomIcon);
    
    return (await this.customIcons.get(id))!;
  }

  async getCustomIcons(): Promise<CustomIcon[]> {
    return await this.customIcons.filter(icon => icon.isActive).sortBy('updateTime');
  }

  async getCustomIcon(id: string): Promise<CustomIcon | undefined> {
    return await this.customIcons.get(id);
  }

  async updateCustomIcon(id: string, updates: Partial<CustomIcon>): Promise<void> {
    await this.customIcons.update(id, {
      ...updates,
      updateTime: new Date()
    });
  }

  async deleteCustomIcon(id: string): Promise<void> {
    // Soft delete by setting isActive to false
    await this.customIcons.update(id, { isActive: false });
  }

  async getCustomIconsByCategory(category: string): Promise<CustomIcon[]> {
    return await this.customIcons
      .filter(icon => icon.category === category && icon.isActive)
      .toArray();
  }

  // Database utilities
  async clearAllData(): Promise<void> {
    await this.transaction('rw', [this.users, this.inventoryItems, this.recipes, this.settings, this.images, this.categories, this.consumptionHistory, this.customIcons], async () => {
      await this.users.clear();
      await this.inventoryItems.clear();
      await this.recipes.clear();
      await this.settings.clear();
      await this.images.clear();
      await this.categories.clear();
      await this.consumptionHistory.clear();
      await this.customIcons.clear();
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