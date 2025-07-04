import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    aiProvider: 'OpenAI',
    aiModel: 'gpt-4o',
    aiApiKey: '',
    aiApiUrl: ''
}

const aiSlice = createSlice({
    name: 'ai',
    initialState,
    reducers: {
        setAiProvider: (state, action) => {
            state.aiProvider = action.payload;
        },
        setAiModel: (state, action) => {
            state.aiModel = action.payload;
        },
        setAiApiKey: (state, action) => {
            state.aiApiKey = action.payload;
        },
        setAiApiUrl: (state, action) => {
            state.aiApiUrl = action.payload;
        },
    },
});

export const { setAiProvider, setAiModel, setAiApiKey, setAiApiUrl } = aiSlice.actions;
export default aiSlice.reducer;