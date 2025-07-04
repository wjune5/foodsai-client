import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  createTransform,
} from 'redux-persist';
import type { PersistConfig } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { chatReducer } from './chat/slice';
import aiReducer from './ai/slice';
import settingsReducer from './setting/slice';

const rootReducer = combineReducers({
  chat: chatReducer,
  ai: aiReducer,
  settings: settingsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

// 创建一个transform来过滤chat状态
const chatTransform = createTransform<unknown, unknown, RootState>(
  // 保存到storage时的转换函数
    (inboundState: unknown, key: string | number) => {
      // 只处理chat状态
      if (key === 'chat') {
        // 创建一个新的状态对象，只包含我们想要持久化的字段
        return {
          // 保留chatRequestParams，但不保留messages等会话相关数据
          chatRequestParams: (inboundState as { chatRequestParams: unknown }).chatRequestParams,
          // 重置其他字段为初始状态
          messages: [],
          inputMessage: '',
          isWaitingForResponse: false,
          getResponseError: false,
          isChatView: false,
          isChatSufficient: false,
          chatError: '',
          isChatReadOnly: false,
        };
      }
      return inboundState;
    },
  // 从storage加载时的转换函数
    (outboundState: unknown) => outboundState,
  // 配置选项
  {
    whitelist: ['chat'], // 只对chat状态应用此transform
  }
);

const persistConfig: PersistConfig<RootState> = {
  key: 'root',
  storage,
  transforms: [chatTransform],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
