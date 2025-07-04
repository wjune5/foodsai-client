// Example usage of the AI Service
import { 
  aiService, 
  generateText, 
  generateTextWithProvider,
  AIGenerationRequest 
} from './AIService';

// Example 1: Simple text generation with default provider
async function simpleTextGeneration() {
  try {
    const request: AIGenerationRequest = {
      prompt: "Write a short recipe for chocolate chip cookies",
      maxTokens: 200,
      temperature: 0.7
    };

    const response = await generateText(request);
    console.log('Generated text:', response.text);
    console.log('Provider used:', response.provider);
    console.log('Model used:', response.model);
  } catch (error) {
    console.error('Text generation failed:', error);
  }
}

// Example 2: Text generation with system prompt
async function textGenerationWithSystemPrompt() {
  try {
    const request: AIGenerationRequest = {
      prompt: "What should I cook for dinner?",
      systemPrompt: "You are a helpful cooking assistant. Provide practical, easy-to-follow recipes.",
      maxTokens: 300,
      temperature: 0.8
    };

    const response = await generateText(request);
    console.log('Cooking advice:', response.text);
  } catch (error) {
    console.error('Cooking advice generation failed:', error);
  }
}

// Example 3: Using a specific provider
async function useSpecificProvider() {
  try {
    const request: AIGenerationRequest = {
      prompt: "Explain quantum computing in simple terms",
      maxTokens: 150,
      temperature: 0.5
    };

    // Try Google GenAI specifically
    const response = await generateTextWithProvider('Google GenAI', request);
    console.log('Google GenAI response:', response.text);
  } catch (error) {
    console.error('Google GenAI failed, trying fallback...');
    
    // Fallback to any available provider
    try {
      const response = await generateText(request);
      console.log('Fallback response:', response.text);
    } catch (fallbackError) {
      console.error('All providers failed:', fallbackError);
    }
  }
}

// Example 4: Check available providers
function checkProviders() {
  const availableProviders = aiService.getAvailableProviders();
  console.log('Available providers:', availableProviders);
  
  const currentProvider = aiService.getCurrentProvider();
  console.log('Current provider:', currentProvider);
  
  // Check if specific provider is available
  const isGoogleAvailable = aiService.isProviderAvailable('Google GenAI');
  console.log('Google GenAI available:', isGoogleAvailable);
}

// Example 5: Health check all providers
async function healthCheck() {
  try {
    const health = await aiService.healthCheck();
    console.log('Provider health status:', health);
  } catch (error) {
    console.error('Health check failed:', error);
  }
}

// Example 6: Set preferred provider
function setPreferredProvider() {
  const success = aiService.setPreferredProvider('Hugging Face');
  if (success) {
    console.log('Successfully set Hugging Face as preferred provider');
  } else {
    console.log('Failed to set preferred provider - Hugging Face not available');
  }
}

// Example 7: Recipe generation for food inventory
async function generateRecipeFromInventory(ingredients: string[]) {
  try {
    const request: AIGenerationRequest = {
      prompt: `Create a recipe using these ingredients: ${ingredients.join(', ')}. Include cooking time, difficulty level, and step-by-step instructions.`,
      systemPrompt: "You are a professional chef. Create practical, delicious recipes that are easy to follow. Always include cooking time, difficulty level, and clear instructions.",
      maxTokens: 500,
      temperature: 0.7
    };

    const response = await generateText(request);
    return response.text;
  } catch (error) {
    console.error('Recipe generation failed:', error);
    return 'Sorry, I could not generate a recipe at this time.';
  }
}

// Example 8: Food expiration advice
async function getExpirationAdvice(foodItem: string, daysUntilExpiry: number) {
  try {
    const request: AIGenerationRequest = {
      prompt: `I have ${foodItem} that expires in ${daysUntilExpiry} days. What should I do with it?`,
      systemPrompt: "You are a food safety expert. Provide practical advice on how to use food items before they expire, including recipe suggestions and storage tips.",
      maxTokens: 200,
      temperature: 0.6
    };

    const response = await generateText(request);
    return response.text;
  } catch (error) {
    console.error('Expiration advice generation failed:', error);
    return 'Please check food safety guidelines for proper handling of this item.';
  }
}

// Export examples for use in other files
export {
  simpleTextGeneration,
  textGenerationWithSystemPrompt,
  useSpecificProvider,
  checkProviders,
  healthCheck,
  setPreferredProvider,
  generateRecipeFromInventory,
  getExpirationAdvice
}; 