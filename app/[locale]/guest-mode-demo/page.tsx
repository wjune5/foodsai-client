'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/shared/services/AuthContext';
import { useGuestModeWarning } from '@/shared/hooks/useGuestModeWarning';
import { GuestModeWarningService } from '@/shared/services/GuestModeWarningService';
import { Toaster } from 'react-hot-toast';
import { llmService } from '@/shared/services/LLMService';

export default function GuestModeDemoPage() {
  const { isGuestMode, enterGuestMode, exitGuestMode } = useAuth();
  const { showGuestModeWarning } = useGuestModeWarning();

  const testLLM = async () => {
    const result = await llmService.getJsonResponse(
      "I bought 1000 eggs, 3 bottles of milk, 10lb rice, and a chicken hamburger from safeway. and i cooked a kung pao chicken.", 
      'I want to operate on db using json. Convert natural language to json.', 
      '{action: "add|delete|update|query", table: "Inventory|Recipes", entity: "an object that needs to operate", quantity: "(Optional) The amount related to the item, typically used for Inventory operations", unit: "(Optional) The unit associated with the quantity, e.g. "kg", "pcs", "liters""}');
    console.log(result);
  }
  // Initialize warning service when component mounts
  useEffect(() => {
    if (isGuestMode) {
      const warningService = GuestModeWarningService.getInstance();
      warningService.initialize();
      console.log('Guest mode demo: Warning service initialized');
    }
  }, [isGuestMode]);


  const handleTestWarning = () => {
    // showGuestModeWarning();
    testLLM();
  };

  const handleTestServiceWarning = () => {
    const warningService = GuestModeWarningService.getInstance();
    warningService.showManualWarning();
  };

  const handleSimulateDataLoss = () => {
    if (isGuestMode) {
      showGuestModeWarning();
      // Simulate some action that could cause data loss
      setTimeout(() => {
        alert('This action would cause data loss in guest mode!');
      }, 1000);
    } else {
      alert('This action is safe for authenticated users.');
    }
  };

  const handleTestTabSwitch = () => {
    // Simulate tab switch by triggering visibility change
    Object.defineProperty(document, 'hidden', {
      writable: true,
      value: true
    });
    document.dispatchEvent(new Event('visibilitychange'));
    
    // Reset after a short delay
    setTimeout(() => {
      Object.defineProperty(document, 'hidden', {
        writable: true,
        value: false
      });
      document.dispatchEvent(new Event('visibilitychange'));
    }, 100);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Guest Mode Warning System Demo</h1>
        
        {/* Current Status */}
        <div className="bg-gray-100 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Current Status</h2>
          <div className="flex items-center space-x-4">
            <div className={`px-4 py-2 rounded-lg ${isGuestMode ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white'}`}>
              {isGuestMode ? '👤 Guest Mode Active' : '✅ Authenticated User'}
            </div>
            <button
              onClick={isGuestMode ? exitGuestMode : enterGuestMode}
              className={`px-4 py-2 rounded-lg text-white ${isGuestMode ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
            >
              {isGuestMode ? 'Exit Guest Mode' : 'Enter Guest Mode'}
            </button>
          </div>
        </div>

        {/* Warning Tests */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Test Warning System</h3>
            <div className="space-y-3">
              <button 
                onClick={handleTestWarning} 
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Test Hook Warning
              </button>
              <button 
                onClick={handleTestServiceWarning} 
                className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Test Service Warning
              </button>
              <button 
                onClick={handleSimulateDataLoss} 
                className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Simulate Data Loss Action
              </button>
              <button 
                onClick={handleTestTabSwitch} 
                className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
              >
                Test Tab Switch Warning
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Browser Actions</h3>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Try these actions to test the warning system:
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Close the browser tab/window</li>
                <li>• Switch to another tab</li>
                <li>• Use browser back/forward buttons</li>
                <li>• Refresh the page (F5)</li>
                <li>• Navigate to another page</li>
              </ul>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Debug Info:</strong> Check the browser console for debug messages about event listeners and warnings.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Information */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold mb-4 text-blue-800">How It Works</h3>
          <div className="space-y-3 text-blue-700">
            <p>
              <strong>Window Close Warning:</strong> When you try to close the browser tab or window while in guest mode, 
              you'll see a browser dialog asking if you're sure you want to leave.
            </p>
            <p>
              <strong>Tab Switch Warning:</strong> When you switch to another tab, you'll see a toast notification 
              reminding you that your data is saved locally.
            </p>
            <p>
              <strong>Navigation Warning:</strong> When you use browser navigation (back/forward) or refresh the page, 
              you'll see warnings about potential data loss.
            </p>
            <p>
              <strong>Manual Warnings:</strong> You can trigger warnings programmatically for specific actions 
              that could cause data loss.
            </p>
          </div>
        </div>

        {/* Visual Indicators */}
        {isGuestMode && (
          <div className="mt-8 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-yellow-800">Visual Indicators</h3>
            <p className="text-yellow-700">
              When in guest mode, you should see:
            </p>
            <ul className="text-yellow-700 mt-2 space-y-1">
              <li>• A floating indicator in the top-right corner</li>
              <li>• A banner at the top of the page (if enabled)</li>
              <li>• Toast notifications for various actions</li>
            </ul>
          </div>
        )}
      </div>
      <Toaster position="top-right" />
    </div>
  );
} 