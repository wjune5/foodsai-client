'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from '@/shared/i18n/navigation';
import { useParams } from 'next/navigation';
import { Recipe } from '@/shared/entities/inventory';
import { guestModeService } from '@/shared/services/GuestModeService';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { 
  Edit, 
  Copy, 
  Trash2, 
  Clock, 
  Users, 
  ChefHat,
  ArrowLeft,
  Hash,
  List,
  FileText
} from 'lucide-react';

function RecipeDetailPageInner() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecipe = async () => {
      try {
        const recipeId = params.id as string;
        const recipes = await guestModeService.getRecipes();
        const foundRecipe = recipes.find(r => r.id === recipeId);
        
        if (foundRecipe) {
          setRecipe(foundRecipe);
        } else {
          toast.error('Recipe not found');
          router.push('/records');
        }
      } catch (error) {
        console.error('Error loading recipe:', error);
        toast.error('Failed to load recipe');
        router.push('/records');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadRecipe();
    }
  }, [params.id, router]);

  const handleEdit = () => {
    router.push(`/records/form?id=${recipe?.id}`);
  };

  const handleDuplicate = async () => {
    if (!recipe) return;
    
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
      router.push('/records');
    } catch (error) {
      console.error('Error duplicating recipe:', error);
      toast.error('Failed to duplicate recipe');
    }
  };

  const handleDelete = async () => {
    if (!recipe) return;
    
    if (window.confirm(t('recipes.confirmDelete'))) {
      try {
        await guestModeService.deleteRecipe(recipe.id);
        toast.success(t('records.recipeDeleted'));
        router.push('/records');
      } catch (error) {
        console.error('Error deleting recipe:', error);
        toast.error('Failed to delete recipe');
      }
    }
  };

  const handleBack = () => {
    router.push('/records');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-pink-50">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-white rounded-2xl shadow-xl border border-pink-100 overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">{t('common.loading')}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!recipe) {
    return null;
  }

  return (
    <div className="min-h-screen bg-pink-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white rounded-2xl shadow-xl border border-pink-100 overflow-hidden">
          <div className="p-6 md:p-8">
            {/* Header with Actions */}
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('common.back')}
              </Button>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  {t('common.edit')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDuplicate}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  {t('common.duplicate')}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  {t('common.delete')}
                </Button>
              </div>
            </div>

            {/* Recipe Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <ChefHat className="h-8 w-8 text-pink-600" />
                <h1 className="text-3xl font-bold text-gray-900">{recipe.name}</h1>
              </div>
              
              {recipe.description && (
                <p className="text-lg text-gray-600 leading-relaxed">{recipe.description}</p>
              )}

              {/* Recipe Meta Info */}
              <div className="flex flex-wrap gap-4 mt-6">
                {recipe.cookingTime && (
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">{recipe.cookingTime} {t('recipes.cookingTimeMinutes')}</span>
                  </div>
                )}
                
                {recipe.servings && (
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">{recipe.servings} {t('recipes.servings')}</span>
                  </div>
                )}
                
                {recipe.difficulty && (
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                    <span className="text-sm font-medium">{t(`recipes.difficultyLevels.${recipe.difficulty}`)}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {recipe.tags && recipe.tags.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Hash className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">{t('recipes.tags')}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recipe.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Recipe Image */}
            {recipe.img && (
              <div className="mb-8">
                <img 
                  src={recipe.img.data} 
                  alt={recipe.name}
                  className="w-full h-64 object-cover rounded-lg border border-gray-200"
                />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Ingredients */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <List className="h-5 w-5" />
                    {t('recipes.ingredients')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {recipe.ingredients.map((ingredient, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-pink-600 mt-1">•</span>
                        <span>{ingredient}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {t('recipes.instructions')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-4">
                    {recipe.instructions.map((instruction, index) => (
                      <li key={index} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <span className="leading-relaxed">{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function RecipeDetailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RecipeDetailPageInner />
    </Suspense>
  );
}