import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface InventoryItem {
  id: string;
  name: string;
  img?: string;
  quantity: number;
  unit: string;
  dateFrom: string;
  expirationDate?: string;
  category: 'vegetable' | 'dairy' | 'meat' | 'fruit' | 'grain' | 'other';
}

interface InventoryItemsState {
  items: InventoryItem[];
  loading: boolean;
  error: string | null;
}

const initialState: InventoryItemsState = {
  items: [],
  loading: false,
  error: null,
};

const inventoryItemsSlice = createSlice({
  name: 'inventoryItems',
  initialState,
  reducers: {
    addInventoryItem: (state, action: PayloadAction<InventoryItem>) => {
      state.items.push(action.payload);
    },
    updateInventoryItem: (state, action: PayloadAction<InventoryItem>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    removeInventoryItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { addInventoryItem, updateInventoryItem, removeInventoryItem, setLoading, setError } = inventoryItemsSlice.actions;
export default inventoryItemsSlice.reducer; 