import { configureStore } from '@reduxjs/toolkit';
import inventoryItemsReducer from './slices/foodItemsSlice';
import recipesReducer from './slices/recipesSlice';
import settingsReducer from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    inventoryItems: inventoryItemsReducer,
    recipes: recipesReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 