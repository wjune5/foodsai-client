'use client';

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Link from 'next/link';
import { Heart, Clock, ArrowLeft, Trash2 } from 'lucide-react';
import { RootState } from '../../store/store';
import { removeRecipe } from '../../store/slices/recipesSlice';
import { Recipe } from '../../store/slices/recipesSlice';
import { ReduxProvider } from '../../providers/ReduxProvider';

export default function Favorites() {
  const dispatch = useDispatch();
  const recipes = useSelector((state: RootState) => state.recipes.recipes);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this recipe from favorites?')) {
      dispatch(removeRecipe(id));
      if (selectedRecipe?.id === id) {
        setSelectedRecipe(null);
      }
    }
  };

  return (
    <ReduxProvider>
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Saved Recipes</h1>
            <p className="text-gray-600">Your favorite recipes</p>
          </div>

          {recipes.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Saved Recipes</h3>
              <p className="text-gray-500 mb-6">
                You haven't saved any recipes yet. Generate some recipes to get started!
              </p>
              <Link
                href="/recipes"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Generate Recipes
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recipe List */}
              <div className="lg:col-span-1">
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                      Saved Recipes ({recipes.length})
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      {recipes.map((recipe) => (
                        <div
                          key={recipe.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedRecipe?.id === recipe.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:bg-gray-50'
                            }`}
                          onClick={() => setSelectedRecipe(recipe)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{recipe.name}</h4>
                              <div className="flex items-center mt-1 text-sm text-gray-600">
                                <Clock className="w-4 h-4 mr-1" />
                                {recipe.cookingTime} minutes
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(recipe.id);
                              }}
                              className="text-red-600 hover:text-red-800 ml-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recipe Details */}
              <div className="lg:col-span-2">
                {selectedRecipe ? (
                  <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-medium text-gray-900">{selectedRecipe.name}</h3>
                          <div className="flex items-center mt-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-1" />
                            {selectedRecipe.cookingTime} minutes
                          </div>
                        </div>
                        <Heart className="w-5 h-5 text-red-600" />
                      </div>
                    </div>

                    <div className="p-6">
                      {/* Ingredients */}
                      <div className="mb-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-3">Ingredients</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {selectedRecipe.ingredients.map((ingredient, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-sm text-gray-700">{ingredient}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Missing Ingredients */}
                      {selectedRecipe.missingIngredients.length > 0 && (
                        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                          <h4 className="text-sm font-medium text-yellow-800 mb-2">Missing Ingredients</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedRecipe.missingIngredients.map((ingredient, index) => (
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
                          {selectedRecipe.instructions.map((instruction, index) => (
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
                      <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Recipe</h3>
                      <p className="text-gray-500">
                        Choose a recipe from the list to view its details.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </ReduxProvider>
  );
} 