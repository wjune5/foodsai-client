'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Link from 'next/link';
import { Utensils, Clock, Plus, Heart, ArrowLeft } from 'lucide-react';
import { RootState } from '../../store/store';
import { addRecipe, setCurrentRecipe } from '../../store/slices/recipesSlice';
import { Recipe } from '../../store/slices/recipesSlice';
import { ReduxProvider } from '../../providers/ReduxProvider';

export default function Recipes() {
  const dispatch = useDispatch();
  const foodItems = useSelector((state: RootState) => state.foodItems.items);
  const recipes = useSelector((state: RootState) => state.recipes.recipes);
  const currentRecipe = useSelector((state: RootState) => state.recipes.currentRecipe);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);

  // Mock recipe generation function (in a real app, this would call an AI API)
  const generateRecipe = async () => {
    setIsGenerating(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const availableIngredients = foodItems.map(item => item.name.toLowerCase());
    const selectedItems = selectedIngredients.length > 0 
      ? selectedIngredients 
      : availableIngredients.slice(0, 3); // Use first 3 items if none selected
    
    // Mock recipe generation based on ingredients
    const mockRecipes = [
      {
        name: `${selectedItems[0]?.charAt(0).toUpperCase() + selectedItems[0]?.slice(1)} Stir Fry`,
        ingredients: [...selectedItems, 'soy sauce', 'garlic', 'ginger'],
        instructions: [
          'Heat oil in a large wok or skillet over high heat',
          'Add minced garlic and ginger, stir for 30 seconds',
          `Add ${selectedItems[0]} and stir-fry for 3-4 minutes`,
          'Add soy sauce and continue cooking for 2 minutes',
          'Serve hot with rice or noodles'
        ],
        cookingTime: 15,
        missingIngredients: ['soy sauce', 'garlic', 'ginger', 'oil']
      },
      {
        name: `${selectedItems[1]?.charAt(0).toUpperCase() + selectedItems[1]?.slice(1)} Salad`,
        ingredients: [...selectedItems, 'olive oil', 'lemon juice', 'salt', 'pepper'],
        instructions: [
          'Wash and prepare all vegetables',
          'Combine ingredients in a large bowl',
          'Mix olive oil, lemon juice, salt, and pepper for dressing',
          'Pour dressing over salad and toss gently',
          'Serve immediately'
        ],
        cookingTime: 10,
        missingIngredients: ['olive oil', 'lemon juice', 'salt', 'pepper']
      }
    ];

    const newRecipe: Recipe = {
      id: Date.now().toString(),
      ...mockRecipes[0],
      createdAt: new Date().toISOString()
    };

    dispatch(addRecipe(newRecipe));
    dispatch(setCurrentRecipe(newRecipe));
    setIsGenerating(false);
  };

  const handleIngredientToggle = (ingredient: string) => {
    setSelectedIngredients(prev => 
      prev.includes(ingredient)
        ? prev.filter(item => item !== ingredient)
        : [...prev, ingredient]
    );
  };

  const saveRecipe = (recipe: Recipe) => {
    // In a real app, this would save to favorites
    alert('Recipe saved to favorites!');
  };

  return (
    <ReduxProvider>
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Recipe Generator</h1>
            <p className="text-gray-600">Get AI-powered recipe suggestions</p>
          </div>
          <div className="flex space-x-4">
            <Link 
              href="/favorites"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Heart className="w-4 h-4 mr-2" />
              Favorites
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Ingredients Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Available Ingredients</h3>
                <p className="text-sm text-gray-600">Select ingredients to include in your recipe</p>
              </div>
              
              <div className="p-6">
                {foodItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Utensils className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No ingredients available</p>
                    <p className="text-sm text-gray-400">Add some food items to get started</p>
                    <Link 
                      href="/food/add"
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Items
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {foodItems.map((item) => (
                      <label key={item.id} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedIngredients.includes(item.name)}
                          onChange={() => handleIngredientToggle(item.name)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-900">{item.name}</span>
                        <span className="text-xs text-gray-500">({item.quantity} {item.unit})</span>
                      </label>
                    ))}
                  </div>
                )}
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={generateRecipe}
                    disabled={isGenerating || foodItems.length === 0}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating Recipe...
                      </>
                    ) : (
                      <>
                        <Utensils className="w-4 h-4 mr-2" />
                        Generate Recipe
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Recipe Display */}
          <div className="lg:col-span-2">
            {currentRecipe ? (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-medium text-gray-900">{currentRecipe.name}</h3>
                      <div className="flex items-center mt-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-1" />
                        {currentRecipe.cookingTime} minutes
                      </div>
                    </div>
                    <button
                      onClick={() => saveRecipe(currentRecipe)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  {/* Ingredients */}
                  <div className="mb-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Ingredients</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {currentRecipe.ingredients.map((ingredient, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-gray-700">{ingredient}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Missing Ingredients */}
                  {currentRecipe.missingIngredients.length > 0 && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                      <h4 className="text-sm font-medium text-yellow-800 mb-2">Missing Ingredients</h4>
                      <div className="flex flex-wrap gap-2">
                        {currentRecipe.missingIngredients.map((ingredient, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            {ingredient}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Instructions */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Instructions</h4>
                    <ol className="space-y-3">
                      {currentRecipe.instructions.map((instruction, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <span className="text-sm text-gray-700">{instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg">
                <div className="p-12 text-center">
                  <Utensils className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Recipe Generated</h3>
                  <p className="text-gray-500">
                    Select some ingredients and click "Generate Recipe" to get started.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Recipes */}
        {recipes.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Recipes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.slice(-3).reverse().map((recipe) => (
                <div key={recipe.id} className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-2">{recipe.name}</h4>
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <Clock className="w-4 h-4 mr-1" />
                      {recipe.cookingTime} minutes
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      {recipe.ingredients.slice(0, 3).join(', ')}...
                    </p>
                    <button
                      onClick={() => dispatch(setCurrentRecipe(recipe))}
                      className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View Recipe
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
    </ReduxProvider>
  );
} 