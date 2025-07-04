# AI Service with Redux Integration

## Overview

The AI Service is designed to automatically react to changes in the Redux state. When you update the AI configuration in Redux, the service will automatically refresh its providers to use the new configuration.

## How it Works

### 1. Redux State Integration

The AI service reads the current AI configuration from Redux using:
```typescript
function getCurrentAIState() {
  return store.getState().ai;
}
```

### 2. Dynamic Provider Updates

When you change the AI state in Redux, the service will automatically:
- Check the new configuration
- Update provider availability
- Use the new API key, URL, and model

### 3. React Hook for Automatic Updates

Use the `useAIService` hook in React components to automatically refresh when Redux state changes:

```typescript
import { useAIService } from '../hooks/useAIService';

const MyComponent = () => {
  const { generateText, aiState } = useAIService();
  
  // The service will automatically refresh when aiState changes
  // No manual intervention needed!
};
```

## Usage Examples

### Basic Usage
```typescript
import { useAIService } from '../hooks/useAIService';

const MyComponent = () => {
  const { generateText } = useAIService();
  
  const handleGenerate = async () => {
    const response = await generateText({
      prompt: "Hello, how are you?",
      maxTokens: 100
    });
    console.log(response);
  };
};
```

### Updating Redux State
```typescript
import { useDispatch } from 'react-redux';

const MyComponent = () => {
  const dispatch = useDispatch();
  
  const updateAIConfig = () => {
    dispatch({
      type: 'ai/updateConfig',
      payload: {
        aiApiKey: 'new-api-key',
        aiApiUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
        aiModel: 'gemini-pro'
      }
    });
    // The AI service will automatically refresh and use the new config!
  };
};
```

### Checking Current Configuration
```typescript
const MyComponent = () => {
  const { getCurrentConfig, isAvailable } = useAIService();
  
  const checkConfig = () => {
    const config = getCurrentConfig();
    console.log('Current AI config:', config);
    console.log('AI available:', isAvailable());
  };
};
```

## Redux State Structure

The AI service expects the following Redux state structure:

```typescript
interface AIState {
  aiApiKey: string;
  aiApiUrl: string;
  aiModel: string;
}
```

## Automatic Provider Refresh

When any of these Redux state properties change:
- `aiApiKey`
- `aiApiUrl` 
- `aiModel`

The AI service will automatically:
1. Refresh its provider list
2. Update provider availability
3. Use the new configuration for subsequent requests

## Manual Refresh

If needed, you can manually refresh the providers:

```typescript
import { aiService } from '../services/AIService';

// Force refresh providers
aiService.refreshProviders();
```

## Error Handling

The service includes comprehensive error handling:
- Invalid API keys
- Network errors
- Provider unavailability
- Configuration errors

All errors are properly caught and reported with meaningful messages.

## Testing

Use the `AIServiceExample` component to test the integration:

```typescript
import { AIServiceExample } from '../components/AIServiceExample';

// This component demonstrates all features including Redux state changes
<AIServiceExample />
```

## Key Benefits

1. **Automatic Updates**: No need to manually refresh when Redux state changes
2. **Type Safety**: Full TypeScript support
3. **Error Handling**: Comprehensive error handling and fallbacks
4. **Flexible**: Easy to add new providers or modify existing ones
5. **React Integration**: Seamless integration with React components via hooks 