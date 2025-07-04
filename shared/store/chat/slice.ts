import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatRequestParams } from '@/shared/entities/chat';
import { Message } from '@/shared/entities/chat';
import { defaultChatRequestParams } from '@/shared/constants/constants';

export interface ChatState {
  chatRequestParams: ChatRequestParams;
  messages: Message[];
  inputMessage: string;
  isWaitingForResponse: boolean;
  getResponseError: boolean;
  isChatView: boolean;
  isChatSufficient: boolean;
  chatError: string;
  isChatReadOnly: boolean;
}

const initialState: ChatState = {
  chatRequestParams: defaultChatRequestParams,
  messages: [],
  inputMessage: '',
  isWaitingForResponse: false,
  getResponseError: false,
  isChatView: false,
  isChatSufficient: false,
  chatError: '',
  isChatReadOnly: false,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChatRequestParams(state, action: PayloadAction<ChatRequestParams>) {
      state.chatRequestParams = action.payload;
    },
    updateChatRequestParams(
      state,
      action: PayloadAction<Partial<ChatRequestParams>>
    ) {
      state.chatRequestParams = {
        ...state.chatRequestParams,
        ...action.payload,
      };
    },
    setMessages(state, action: PayloadAction<Message[]>) {
      state.messages = action.payload;
    },
    addMessage(state, action: PayloadAction<Message>) {
      state.messages.push(action.payload);
    },
    setInputMessage(state, action: PayloadAction<string>) {
      state.inputMessage = action.payload;
    },
    setIsWaitingForResponse(state, action: PayloadAction<boolean>) {
      state.isWaitingForResponse = action.payload;
    },
    setGetResponseError(state, action: PayloadAction<boolean>) {
      state.getResponseError = action.payload;
    },
    setIsChatView(state, action: PayloadAction<boolean>) {
      state.isChatView = action.payload;
    },
    setIsChatSufficient(state, action: PayloadAction<boolean>) {
      state.isChatSufficient = action.payload;
    },
    setChatError(state, action: PayloadAction<string>) {
      state.chatError = action.payload;
    },
    setChatReadOnly(state, action: PayloadAction<boolean>) {
      state.isChatReadOnly = action.payload;
    },
    clearChat(state) {
      state.messages = [];
      state.inputMessage = '';
      state.isWaitingForResponse = false;
      state.getResponseError = false;
      state.isChatView = false;
      state.isChatSufficient = false;
      state.chatError = '';
      state.isChatReadOnly = false;
    },
    resetChatSufficient(state) {
      state.isChatSufficient = false;
    },
  },
});

export const {
  setChatRequestParams,
  updateChatRequestParams,
  setMessages,
  addMessage,
  setInputMessage,
  setIsWaitingForResponse,
  setGetResponseError,
  setIsChatView,
  setIsChatSufficient,
  setChatError,
  setChatReadOnly,
  clearChat,
  resetChatSufficient,
} = chatSlice.actions;

export const chatReducer = chatSlice.reducer;
