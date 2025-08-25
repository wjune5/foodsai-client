'use client';

import React, { useState, useEffect } from 'react';
import { Recipe } from '@/shared/entities/inventory';
import { guestModeService } from '@/shared/services/GuestModeService';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Plus, Search, Filter, ChefHat } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import RecipeCard from './components/RecipeCard';
import RecipeForm from './components/RecipeForm';

export default function RecipesPage() {
  const t = useTranslations();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tagFilter, setTagFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | undefined>();
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  useEffect(() => {
    loadRecipes();
  }, []);

  useEffect(() => {
    // Extract unique tags from all recipes
    const tags = new Set<string>();
    recipes.forEach(recipe => {
      recipe.tags?.forEach(tag => tags.add(tag));
    });
    setAvailableTags(Array.from(tags).sort());
  }, [recipes]);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const recipeList = await guestModeService.getRecipes();
      setRecipes(recipeList);
    } catch (error) {
      console.error('Error loading recipes:', error);
      toast.error('Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecipe = async (recipeData: Omit<Recipe, 'id' | 'createTime' | 'updateTime'>) => {
    try {
      if (editingRecipe) {
        await guestModeService.updateRecipe(editingRecipe.id, recipeData);
        toast.success(t('records.recipeUpdated'));
      } else {
        await guestModeService.addRecipe(recipeData);
        toast.success(t('records.recipeAdded'));
      }
      
      await loadRecipes();
      setShowForm(false);
      setEditingRecipe(undefined);
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast.error('Failed to save recipe');
    }
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setShowForm(true);
  };

  const handleDeleteRecipe = async (recipe: Recipe) => {
    if (window.confirm(t('recipes.confirmDelete'))) {
      try {
        await guestModeService.deleteRecipe(recipe.id);
        toast.success(t('records.recipeDeleted'));
        await loadRecipes();
      } catch (error) {
        console.error('Error deleting recipe:', error);
        toast.error('Failed to delete recipe');
      }
    }
  };

  const handleDuplicateRecipe = async (recipe: Recipe) => {
    try {
      const duplicateData = {
        name: `${recipe.name} (Copy)`,
        description: recipe.description,
        ingredients: [...recipe.ingredients],
        instructions: [...recipe.instructions],
        cookingTime: recipe.cookingTime,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        tags: recipe.tags ? [...recipe.tags] : undefined,
        img: recipe.img
      };
      
      await guestModeService.addRecipe(duplicateData);
      toast.success('Recipe duplicated successfully');
      await loadRecipes();
    } catch (error) {
      console.error('Error duplicating recipe:', error);
      toast.error('Failed to duplicate recipe');
    }
  };

  const handleViewRecipe = (recipe: Recipe) => {
    // For now, just edit the recipe. In the future, this could open a read-only view
    handleEditRecipe(recipe);
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.ingredients.some(ingredient => ingredient.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTag = tagFilter === 'all' || 
      (recipe.tags && recipe.tags.includes(tagFilter));

    return matchesSearch && matchesTag;
  });

  if (showForm) {
    return (
      <RecipeForm
        recipe={editingRecipe}
        onSave={handleSaveRecipe}
        onCancel={() => {
          setShowForm(false);
          setEditingRecipe(undefined);
        }}
      />
    );
  }

  return (
    <div className="container mx-auto p-6 pt-20">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ChefHat className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">{t('recipes.title')}</h1>
        </div>
        <p className="text-muted-foreground">{t('recipes.description')}</p>
      </div>

      {/* Actions and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('recipes.searchRecipes')}
              className="pl-10"
            />
          </div>
          
          <Select value={tagFilter} onValueChange={setTagFilter}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('recipes.allTags')}</SelectItem>
              {availableTags.map(tag => (
                <SelectItem key={tag} value={tag}>{tag}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => setShowForm(true)} className="sm:w-auto w-full">
          <Plus className="h-4 w-4 mr-2" />
          {t('recipes.addRecipe')}
        </Button>
      </div>

      {/* Recipes Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{t('common.loading')}</p>
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div className="text-center py-12">
          {recipes.length === 0 ? (
            <>
              <ChefHat className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('recipes.noRecipes')}</h3>
              <p className="text-muted-foreground mb-6">{t('recipes.addFirstRecipe')}</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t('recipes.addRecipe')}
              </Button>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">No recipes match your filters</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setTagFilter('all');
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map(recipe => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onEdit={handleEditRecipe}
              onDelete={handleDeleteRecipe}
              onDuplicate={handleDuplicateRecipe}
              onView={handleViewRecipe}
            />
          ))}
        </div>
      )}

      {/* Recipe Count */}
      {!loading && filteredRecipes.length > 0 && (
        <div className="mt-8 text-center text-sm text-muted-foreground">
          {filteredRecipes.length === recipes.length 
            ? `${recipes.length} recipe${recipes.length !== 1 ? 's' : ''} total`
            : `${filteredRecipes.length} of ${recipes.length} recipe${recipes.length !== 1 ? 's' : ''}`
          }
        </div>
      )}
    </div>
  );
}
