import { guestDB } from '../utils/guest_db';
import { DEFAULT_SETTINGS, GuestUser, UserInfo, UserSettings } from '../entities/user';
import { Category, Inventory, Recipe } from '../entities/inventory';

export interface GuestModeState {
  isGuestMode: boolean;
  guestUser: GuestUser | null;
  isInitialized: boolean;
}

export class DatabaseService {
  private static instance: DatabaseService;
  private guestUser: GuestUser | null = null;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // Initialize guest mode
  async initializeGuestMode(): Promise<GuestUser> {
    try {
      // Check if there's an existing guest user
      const existingUsers = await guestDB.users.toArray();
      let user: GuestUser;

      if (existingUsers.length > 0) {
        // Use existing guest user
        user = existingUsers[0];
      } else {
        // Create new guest user
        user = await guestDB.createUser({
          username: `Guest_${Math.random().toString(36).substr(2, 9)}`,
          nickname: 'Guest User',
          avatar: undefined,
          email: undefined
        });
      }

      this.guestUser = user;
      this.isInitialized = true;

      // Initialize default settings if not exists
      const settings = await guestDB.getSettings();
      if (!settings) {
        await guestDB.updateSettings(DEFAULT_SETTINGS);
      }

      return user;
    } catch (error) {
      console.error('Failed to initialize guest mode:', error);
      throw new Error('Failed to initialize guest mode');
    }
  }

  // Get current guest user
  getCurrentUser(): GuestUser | null {
    return this.guestUser;
  }

  // Check if guest mode is active
  isGuestModeActive(): boolean {
    return this.isInitialized && this.guestUser !== null;
  }

  // Convert guest user to UserInfo format for compatibility
  getUserInfo(): GuestUser | null {
    if (!this.guestUser) return null;

    return {
      id: this.guestUser.id,
      username: this.guestUser.username,
      nickname: this.guestUser.nickname || this.guestUser.username,
      email: this.guestUser.email || '',
      avatar: this.guestUser.avatar || ''
    };
  }

  // Update guest user profile
  async updateUserProfile(updates: Partial<GuestUser>): Promise<GuestUser> {
    if (!this.guestUser) {
      throw new Error('No guest user found');
    }

    await guestDB.updateUser(this.guestUser.id, updates);
    this.guestUser = { ...this.guestUser, ...updates };
    return this.guestUser;
  }

  // Guest inventory operations
  async addInventoryItem(item: Omit<Inventory, 'id' | 'createTime' | 'updateTime'>): Promise<Inventory> {
    const existing = await guestDB.getInventoryItemByName(item.name);
    if (existing) {
      await guestDB.updateInventoryItem(existing.id, {
        ...item,
        originalQuantity: existing.originalQuantity+item.quantity,
        quantity: existing.quantity+item.quantity,
        createdBy: existing.createdBy,
        updatedBy: existing.updatedBy
      });
      return existing;
    }
    return await guestDB.addInventoryItem(item);
  }

  async getCategories(): Promise<Category[]> {
    return await guestDB.getCategories();
  }

  async addCategory(category: Omit<Category, 'id' | 'isDefault' | 'icon'>): Promise<Category> {
    return await guestDB.addCategory(category);
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<void> {
    await guestDB.updateCategory(id, updates);
  }

  async deleteCategory(id: string): Promise<void> {
    await guestDB.deleteCategory(id);
  }

  async getInventoryItems(): Promise<Inventory[]> {
    return await guestDB.getInventoryItems();
  }
  async getInventoryItem(id: string): Promise<Inventory | undefined> {
    return await guestDB.getInventoryItem(id);
  }
  async updateInventoryItem(id: string, updates: Partial<Inventory>): Promise<void> {
    await guestDB.updateInventoryItem(id, updates);
  }

  async deleteInventoryItem(id: string): Promise<void> {
    await guestDB.deleteInventoryItem(id);
  }

  // Guest recipe operations
  async addRecipe(recipe: Omit<Recipe, 'id' | 'createTime' | 'updateTime'>): Promise<Recipe> {
    return await guestDB.addRecipe(recipe);
  }

  async getRecipes(): Promise<Recipe[]> {
    return await guestDB.getRecipes();
  }

  async updateRecipe(id: string, updates: Partial<Recipe>): Promise<void> {
    await guestDB.updateRecipe(id, updates);
  }

  async deleteRecipe(id: string): Promise<void> {
    await guestDB.deleteRecipe(id);
  }

  // Guest settings operations
  async getUserSettings(): Promise<UserSettings | undefined> {
    return await guestDB.getSettings();
  }

  async updateUserSettings(updates: Partial<UserSettings>): Promise<void> {
    await guestDB.updateSettings(updates);
  }

  // Guest image operations
  async uploadImage(file: File): Promise<string> {
    return await guestDB.saveImage(file);
  }

  async getImageDataUrl(imageId: string): Promise<string | null> {
    return await guestDB.getImageDataUrl(imageId);
  }

  async deleteImage(imageId: string): Promise<void> {
    await guestDB.deleteImage(imageId);
  }

  async getAllImages(): Promise<any[]> {
    return await guestDB.getAllImages();
  }

  // Data migration from guest to authenticated user
  async migrateToAuthenticatedUser(authenticatedUser: UserInfo): Promise<void> {
    try {
      // Export all guest data
      const guestData = await guestDB.exportData();
      
      // Store the data temporarily (you might want to send this to your API)
      localStorage.setItem('guest_migration_data', JSON.stringify({
        ...guestData,
        // targetUserId: authenticatedUser.id,
        migrationDate: new Date().toISOString()
      }));

      // Clear guest data
      await this.clearDBData();
      
      console.log('User data prepared for migration to authenticated user');
    } catch (error) {
      console.error('Failed to migrate guest data:', error);
      throw new Error('Failed to migrate guest data');
    }
  }

  // Clear all guest data
  async clearDBData(): Promise<void> {
    try {
      await guestDB.clearAllData();
      this.guestUser = null;
      this.isInitialized = false;
    } catch (error) {
      console.error('Failed to clear guest data:', error);
      throw new Error('Failed to clear guest data');
    }
  }

  // Export guest data
  async exportGuestData(): Promise<{
    user: GuestUser | undefined;
    inventoryItems: Inventory[];
    recipes: Recipe[];
    settings: UserSettings | undefined;
    exportDate: Date;
  }> {
    return await guestDB.exportData();
  }

  // Import guest data
  async importGuestData(data: {
    user?: GuestUser;
    inventoryItems?: Inventory[];
    recipes?: Recipe[];
    settings?: UserSettings;
  }): Promise<void> {
    await guestDB.importData(data);
    
    // Update current guest user if imported
    if (data.user) {
      this.guestUser = data.user;
      this.isInitialized = true;
    }
  }

  // Get database statistics
  async getGuestDatabaseStats(): Promise<{
    totalItems: number;
    userCount: number;
    inventoryCount: number;
    recipeCount: number;
    settingsCount: number;
  }> {
    const userCount = await guestDB.users.count();
    const inventoryCount = await guestDB.inventoryItems.count();
    const recipeCount = await guestDB.recipes.count();
    const settingsCount = await guestDB.settings.count();
    
    return {
      totalItems: userCount + inventoryCount + recipeCount + settingsCount,
      userCount,
      inventoryCount,
      recipeCount,
      settingsCount
    };
  }

  // Reset guest mode (for testing or user request)
  async resetGuestMode(): Promise<GuestUser> {
    await this.clearDBData();
    return await this.initializeGuestMode();
  }
}

// Export singleton instance
export const databaseService = DatabaseService.getInstance(); 