import { storage } from '../utils/storage';
import { StorageType } from '../../app/store/slices/settingsSlice';

export interface StorageData {
  inventoryItems: any[];
  recipes: any[];
  timestamp: number;
}

export class StorageService {
  private static instance: StorageService;
  private currentStorageType: StorageType = 'localStorage';

  private constructor() {}

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  setStorageType(type: StorageType) {
    this.currentStorageType = type;
  }

  async saveData(data: StorageData): Promise<boolean> {
    try {
      if (this.currentStorageType === 'localStorage') {
        return this.saveToLocalStorage(data);
      } else {
        return await this.saveToCloud(data);
      }
    } catch (error) {
      console.error('Error saving data:', error);
      return false;
    }
  }

  async loadData(): Promise<StorageData | null> {
    try {
      if (this.currentStorageType === 'localStorage') {
        return this.loadFromLocalStorage();
      } else {
        return await this.loadFromCloud();
      }
    } catch (error) {
      console.error('Error loading data:', error);
      return null;
    }
  }

  private saveToLocalStorage(data: StorageData): boolean {
    try {
      storage.setLocalStorageWithTTL('foodsai_data', data, 60 * 24 * 30); // 30 days TTL
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  }

  private loadFromLocalStorage(): StorageData | null {
    try {
      const data = storage.getLocalStorage('foodsai_data');
      return data as StorageData | null;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return null;
    }
  }

  private async saveToCloud(data: StorageData): Promise<boolean> {
    try {
      const response = await fetch('/api/storage/cloud', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error saving to cloud:', error);
      return false;
    }
  }

  private async loadFromCloud(): Promise<StorageData | null> {
    try {
      const response = await fetch('/api/storage/cloud', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data as StorageData;
    } catch (error) {
      console.error('Error loading from cloud:', error);
      return null;
    }
  }

  async checkCloudSubscription(): Promise<{ active: boolean; tier?: 'basic' | 'premium' }> {
    try {
      const response = await fetch('/api/storage/subscription', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return { active: false };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking cloud subscription:', error);
      return { active: false };
    }
  }

  async upgradeToCloud(tier: 'basic' | 'premium'): Promise<boolean> {
    try {
      const response = await fetch('/api/storage/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tier }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error upgrading to cloud:', error);
      return false;
    }
  }
}

export const storageService = StorageService.getInstance(); 