
import { store } from "@/shared/store/store";
// Types for AI service
export interface AIGenerationRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

// export interface AIGenerationResponse {
//   text: string;
//   provider: string;
//   model: string;
//   usage?: {
//     promptTokens: number;
//     completionTokens: number;
//     totalTokens: number;
//   };
//   error?: string;
// }

export interface AIProvider {
  name: string;
  generateText(request: AIGenerationRequest): Promise<string>;
  isAvailable(): boolean;
}

// Configuration
const AI_CONFIG = {
  DEFAULT_MAX_TOKENS: 1000,
  DEFAULT_TEMPERATURE: 0.7,
  DEFAULT_MODEL: 'gemini-pro',
  FALLBACK_MODEL: 'gemini-pro',
  TIMEOUT_MS: 30000,
} as const;

// Helper function to get current AI state from Redux
function getCurrentAIState() {
  return store.getState().ai;
}

// Google GenAI Provider
class GoogleGenAIProvider implements AIProvider {
  private apiKey: string | null = null;
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    const aiState = getCurrentAIState();
    this.apiKey = aiState.aiApiKey || null;
    this.isInitialized = !!this.apiKey;
  }

  name = 'Google GenAI';

  isAvailable(): boolean {
    const aiState = getCurrentAIState();
    return !!(aiState.aiApiKey && aiState.aiApiUrl && aiState.aiModel);
  }

  async generateText(request: AIGenerationRequest): Promise<string> {
    const aiState = getCurrentAIState();
    if (!aiState.aiApiKey || !aiState.aiApiUrl || !aiState.aiModel) {
      throw new Error('Google GenAI is not available');
    }

    try {
      // Use fetch API to call Google GenAI directly
      const url = `${aiState.aiApiUrl}/${aiState.aiModel}:generateContent?key=${aiState.aiApiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: request.systemPrompt 
                ? `${request.systemPrompt}\n\n${request.prompt}`
                : request.prompt
            }]
          }],
          generationConfig: {
            maxOutputTokens: request.maxTokens || AI_CONFIG.DEFAULT_MAX_TOKENS,
            temperature: request.temperature || AI_CONFIG.DEFAULT_TEMPERATURE,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Google GenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      return text;
    } catch (error) {
      console.error('Google GenAI generation error:', error);
      throw new Error(`Google GenAI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Main AI Service Class
export class AIService {
  private providers: AIProvider[] = [];
  private currentProvider: AIProvider | null = null;

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    // Initialize all available providers
    const googleProvider = new GoogleGenAIProvider();

    // Add providers in order of preference
    if (googleProvider.isAvailable()) {
      this.providers.push(googleProvider);
    }

    // Set the first available provider as current
    this.currentProvider = this.providers[0] || null;
  }

  /**
   * Generate text using the best available AI provider
   */
  async generateText(request: AIGenerationRequest): Promise<string> {
    if (!this.currentProvider) {
      throw new Error('No AI providers are available');
    }

    // Try the current provider first
    try {
      return await this.currentProvider.generateText(request);
    } catch (error) {
      console.warn(`Primary provider failed, trying fallback:`, error);
      
      // Try other providers
      for (const provider of this.providers) {
        if (provider === this.currentProvider) continue;
        
        try {
          const result = await provider.generateText(request);
          // Switch to this provider for future requests
          this.currentProvider = provider;
          return result;
        } catch (fallbackError) {
          console.warn(`Provider ${provider.name} failed:`, fallbackError);
          continue;
        }
      }
      
      throw new Error('All AI providers failed');
    }
  }

  /**
   * Generate text with a specific provider
   */
  async generateTextWithProvider(
    providerName: string, 
    request: AIGenerationRequest
  ): Promise<string> {
    const provider = this.providers.find(p => p.name === providerName);
    if (!provider) {
      throw new Error(`Provider '${providerName}' not found`);
    }

    return await provider.generateText(request);
  }

  /**
   * Get list of available providers
   */
  getAvailableProviders(): string[] {
    return this.providers.map(p => p.name);
  }

  /**
   * Get current provider name
   */
  getCurrentProvider(): string | null {
    return this.currentProvider?.name || null;
  }

  /**
   * Set the preferred provider
   */
  setPreferredProvider(providerName: string): boolean {
    const provider = this.providers.find(p => p.name === providerName);
    if (provider) {
      this.currentProvider = provider;
      return true;
    }
    return false;
  }

  /**
   * Check if a specific provider is available
   */
  isProviderAvailable(providerName: string): boolean {
    const provider = this.providers.find(p => p.name === providerName);
    return provider?.isAvailable() || false;
  }

  /**
   * Refresh providers based on current Redux state
   * Call this when AI configuration changes in Redux
   */
  refreshProviders(): void {
    // Re-initialize providers to pick up new Redux state
    this.providers = [];
    this.initializeProviders();
  }

  /**
   * Get current AI configuration from Redux
   */
  getCurrentAIConfig() {
    return getCurrentAIState();
  }

  /**
   * Health check for all providers
   */
  async healthCheck(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    
    for (const provider of this.providers) {
      try {
        const testRequest: AIGenerationRequest = {
          prompt: 'Hello',
          maxTokens: 10,
        };
        await provider.generateText(testRequest);
        results[provider.name] = true;
      } catch (error) {
        results[provider.name] = false;
      }
    }
    
    return results;
  }
}

// Export a singleton instance
export const aiService = new AIService();

// Convenience functions for common use cases
export const generateText = (request: AIGenerationRequest) => aiService.generateText(request);
export const generateTextWithProvider = (providerName: string, request: AIGenerationRequest) => 
  aiService.generateTextWithProvider(providerName, request);
