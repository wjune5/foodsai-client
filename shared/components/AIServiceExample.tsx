import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAIService } from '../hooks/useAI';
import { AIGenerationRequest } from '../services/AIService';

// Example component showing how to use AI service with Redux state changes
export const AIServiceExample: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const dispatch = useDispatch();
  const {
    generateText,
    getCurrentConfig,
    isAvailable,
    getAvailableProviders,
    getCurrentProvider,
    aiState
  } = useAIService();

  const handleGenerateText = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError('');
    setResponse('');

    try {
      const request: AIGenerationRequest = {
        prompt: prompt,
        maxTokens: 200,
        temperature: 0.7,
        systemPrompt: "You are a helpful assistant."
      };

      const result = await generateText(request);
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAIConfig = () => {
    // Example of updating AI configuration in Redux
    // This will automatically trigger a refresh of the AI service
    dispatch({
      type: 'ai/updateConfig',
      payload: {
        aiApiKey: 'new-api-key',
        aiApiUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
        aiModel: 'gemini-pro'
      }
    });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">AI Service Example</h2>
      
      {/* Current AI Configuration */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Current AI Configuration</h3>
        <div className="text-sm space-y-1">
          <p><strong>API Key:</strong> {aiState.aiApiKey ? 'Set' : 'Not set'}</p>
          <p><strong>API URL:</strong> {aiState.aiApiUrl || 'Not set'}</p>
          <p><strong>Model:</strong> {aiState.aiModel || 'Not set'}</p>
          <p><strong>Available:</strong> {isAvailable() ? 'Yes' : 'No'}</p>
          <p><strong>Current Provider:</strong> {getCurrentProvider() || 'None'}</p>
          <p><strong>Available Providers:</strong> {getAvailableProviders().join(', ') || 'None'}</p>
        </div>
      </div>

      {/* Text Generation */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Text Generation</h3>
        <div className="space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt here..."
            className="w-full p-3 border border-gray-300 rounded-lg resize-none"
            rows={4}
          />
          <button
            onClick={handleGenerateText}
            disabled={loading || !isAvailable()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300"
          >
            {loading ? 'Generating...' : 'Generate Text'}
          </button>
        </div>
      </div>

      {/* Response */}
      {response && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Response</h3>
          <p className="whitespace-pre-wrap">{response}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-red-800">Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Configuration Update */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Update Configuration</h3>
        <button
          onClick={handleUpdateAIConfig}
          className="px-4 py-2 bg-yellow-500 text-white rounded-lg"
        >
          Update AI Config (Example)
        </button>
        <p className="text-sm text-gray-600 mt-2">
          This will update the Redux state and automatically refresh the AI service providers.
        </p>
      </div>

      {/* Health Check */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Health Check</h3>
        <button
          onClick={async () => {
            try {
              const health = await getCurrentConfig();
              console.log('AI Service Health:', health);
              alert('Health check completed. Check console for details.');
            } catch (err) {
              console.error('Health check failed:', err);
              alert('Health check failed. Check console for details.');
            }
          }}
          className="px-4 py-2 bg-green-500 text-white rounded-lg"
        >
          Run Health Check
        </button>
      </div>
    </div>
  );
}; 