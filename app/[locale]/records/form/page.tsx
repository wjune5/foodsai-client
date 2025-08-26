'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/shared/i18n/navigation';
import { Recipe } from '@/shared/entities/inventory';
import { databaseService } from '@/shared/services/DatabaseService';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import RecipeForm from '../components/RecipeForm';

function RecipeFormPageInner() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  
  const recipeId = searchParams.get('id');
  const isEdit = !!recipeId;

  useEffect(() => {
    if (isEdit && recipeId) {
      const loadRecipe = async () => {
        try {
          setLoading(true);
          const recipes = await databaseService.getRecipes();
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

      loadRecipe();
    }
  }, [isEdit, recipeId, router]);

  const handleAddRecipe = async (recipeData: Omit<Recipe, 'id' | 'createTime' | 'updateTime'>) => {
    try {
      await databaseService.addRecipe(recipeData);
      toast.success(t('records.recipeAdded'));
      router.push('/records');
    } catch (error) {
      console.error('Error adding recipe:', error);
      toast.error('Failed to add recipe');
    }
  };

  const handleEditRecipe = async (recipeData: Omit<Recipe, 'id' | 'createTime' | 'updateTime'>) => {
    try {
      if (recipe) {
        await databaseService.updateRecipe(recipe.id, recipeData);
        toast.success(t('records.recipeUpdated'));
        router.push('/records');
      }
    } catch (error) {
      console.error('Error updating recipe:', error);
      toast.error('Failed to update recipe');
    }
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

  return (
    <div className="min-h-screen bg-pink-50">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white rounded-2xl shadow-xl border border-pink-100 overflow-hidden">
          <div className="p-6 md:p-8">
            <RecipeForm
              initialData={isEdit ? recipe || undefined : undefined}
              mode={isEdit ? 'edit' : 'add'}
              onAdd={handleAddRecipe}
              onEdit={handleEditRecipe}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function RecipeFormPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RecipeFormPageInner />
    </Suspense>
  );
}
