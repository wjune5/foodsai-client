import { useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { aiService } from '../services/AIService';
import { AIGenerationRequest } from '../services/AIService';
import { store } from '../store/store';

export const useAI = () => {
  // Subscribe to AI state changes in Redux
  const aiState = useSelector((state: ReturnType<typeof store.getState>) => state.ai);

  // Refresh providers when AI configuration changes
  useEffect(() => {
    aiService.refreshProviders();
  }, [aiState.aiApiKey, aiState.aiApiUrl, aiState.aiModel]);

  // Generate text with current configuration
  const generateText = useCallback(async (request: AIGenerationRequest): Promise<string> => {
    return await aiService.generateText(request);
  }, []);

  // Generate text with specific provider
  const generateTextWithProvider = useCallback(async (
    providerName: string, 
    request: AIGenerationRequest
  ): Promise<string> => {
    return await aiService.generateTextWithProvider(providerName, request);
  }, []);

  // Get current AI configuration
  const getCurrentConfig = useCallback(() => {
    return aiService.getCurrentAIConfig();
  }, []);

  // Check if AI is available
  const isAvailable = useCallback(() => {
    return aiService.getAvailableProviders().length > 0;
  }, []);

  // Get available providers
  const getAvailableProviders = useCallback(() => {
    return aiService.getAvailableProviders();
  }, []);

  // Get current provider
  const getCurrentProvider = useCallback(() => {
    return aiService.getCurrentProvider();
  }, []);

  // Health check
  const healthCheck = useCallback(async () => {
    return await aiService.healthCheck();
  }, []);

  return {
    generateText,
    generateTextWithProvider,
    getCurrentConfig,
    isAvailable,
    getAvailableProviders,
    getCurrentProvider,
    healthCheck,
    aiState, // Current Redux state
  };
}; 