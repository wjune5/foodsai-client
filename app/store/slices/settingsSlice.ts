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
  settings: UserSettings;
  loading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  settings: {
    storageType: 'localStorage', // Default to localStorage (free)
    isCloudSubscriptionActive: false,
    autoBackup: false,
    backupFrequency: 'never',
  },
  loading: false,
  error: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setStorageType: (state, action: PayloadAction<StorageType>) => {
      state.settings.storageType = action.payload;
    },
    setCloudSubscription: (state, action: PayloadAction<{ active: boolean; tier?: 'basic' | 'premium' }>) => {
      state.settings.isCloudSubscriptionActive = action.payload.active;
      if (action.payload.tier) {
        state.settings.cloudSubscriptionTier = action.payload.tier;
      }
    },
    setAutoBackup: (state, action: PayloadAction<boolean>) => {
      state.settings.autoBackup = action.payload;
    },
    setBackupFrequency: (state, action: PayloadAction<'daily' | 'weekly' | 'monthly' | 'never'>) => {
      state.settings.backupFrequency = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    loadSettings: (state, action: PayloadAction<UserSettings>) => {
      state.settings = action.payload;
    },
  },
});

export const { 
  setStorageType, 
  setCloudSubscription, 
  setAutoBackup, 
  setBackupFrequency, 
  setLoading, 
  setError, 
  loadSettings 
} = settingsSlice.actions;

export default settingsSlice.reducer; 