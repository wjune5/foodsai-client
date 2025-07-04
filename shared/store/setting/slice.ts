import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type StorageType = 'localStorage' | 'cloud';

export interface UserSettings {
  storageType: StorageType;
  isCloudSubscriptionActive: boolean;
  cloudSubscriptionTier?: 'basic' | 'premium';
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly' | 'never';
}

interface SettingsState {
  storageType: StorageType;
  isCloudSubscriptionActive: boolean;
  cloudSubscriptionTier?: 'basic' | 'premium';
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly' | 'never';
}

const initialState: SettingsState = {
  storageType: 'localStorage', // Default to localStorage (free)
  isCloudSubscriptionActive: false,
  autoBackup: false,
  backupFrequency: 'never',
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setStorageType: (state, action: PayloadAction<StorageType>) => {
      state.storageType = action.payload;
    },
    setCloudSubscription: (state, action: PayloadAction<{ active: boolean; tier?: 'basic' | 'premium' }>) => {
      state.isCloudSubscriptionActive = action.payload.active;
      if (action.payload.tier) {
        state.cloudSubscriptionTier = action.payload.tier;
      }
    },
    setAutoBackup: (state, action: PayloadAction<boolean>) => {
      state.autoBackup = action.payload;
    },
    setBackupFrequency: (state, action: PayloadAction<'daily' | 'weekly' | 'monthly' | 'never'>) => {
      state.backupFrequency = action.payload;
    },
  },
});

export const { 
  setStorageType, 
  setCloudSubscription, 
  setAutoBackup, 
  setBackupFrequency, 
} = settingsSlice.actions;

export default settingsSlice.reducer; 