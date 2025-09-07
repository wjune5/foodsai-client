'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from '@/shared/i18n/navigation';
import { Recipe, ConsumptionHistory } from '@/shared/entities/inventory';
import { databaseService } from '@/shared/services/DatabaseService';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/tabs';
import { Plus, Search, Filter, ChefHat, History } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import RecipeCard from './components/RecipeCard';
import ConsumptionHistoryList from './components/ConsumptionHistoryList';

export default function RecipesPage() {
  const t = useTranslations();
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [consumptionHistory, setConsumptionHistory] = useState<ConsumptionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tagFilter, setTagFilter] = useState('all');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('recipes');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Extract unique tags from all recipes
    const tags = new Set<string>();
    recipes.forEach(recipe => {
      recipe.tags?.forEach(tag => tags.add(tag));
    });
    setAvailableTags(Array.from(tags).sort());
  }, [recipes]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [recipeList, historyList] = await Promise.all([
        databaseService.getRecipes(),
        databaseService.getConsumptionHistory()
      ]);
      setRecipes(recipeList);
      setConsumptionHistory(historyList);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRecipe = (recipe: Recipe) => {
    router.push(`/records/form?id=${recipe.id}`);
  };

  const handleDeleteRecipe = async (recipe: Recipe) => {
    if (window.confirm(t('recipe.confirmDelete'))) {
      try {
        await databaseService.deleteRecipe(recipe.id);
        toast.success(t('message.deleteSuccess'));
        await loadData();
      } catch (error) {
        console.error('Error deleting recipe:', error);
        toast.error(t('message.deleteFailed'));
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

      await databaseService.addRecipe(duplicateData);
      toast.success(t('message.duplicateSuccess'));
      await loadData();
    } catch (error) {
      console.error('Error duplicating recipe:', error);
      toast.error(t('message.duplicateFailed'));
    }
  };

  const handleViewRecipe = (recipe: Recipe) => {
    router.push(`/records/${recipe.id}`);
  };

  const handleAddRecipe = () => {
    router.push('/records/form');
  };

  const handleDeleteConsumption = async (consumption: ConsumptionHistory) => {
    try {
      await databaseService.deleteConsumptionHistory(consumption.id);
      toast.success(t('message.deleteSuccess'));
      await loadData();
    } catch (error) {
      console.error('Error deleting consumption:', error);
      toast.error(t('message.deleteFailed'));
    }
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.ingredients.some(ingredient => ingredient.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTag = tagFilter === 'all' ||
      (recipe.tags && recipe.tags.includes(tagFilter));

    return matchesSearch && matchesTag;
  });

  return (
    <div className="container mx-auto p-6 pt-2 md:pt-14">
      {/* Header with Tabs */}
      <div className="mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Recipe Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <TabsList className="grid max-w-md grid-cols-2">
                <TabsTrigger value="recipes" className="flex items-center gap-2">
                  <ChefHat className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="consumption" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={activeTab === 'recipes' ? t('records.searchRecipes') : t('records.searchConsumption')}
                  className="pl-10"
                />
              </div>

              {/* <Select value={tagFilter} onValueChange={setTagFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('records.allTags')}</SelectItem>
                  {availableTags.map(tag => (
                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select> */}
              {activeTab === 'recipes' && (
                <Button onClick={handleAddRecipe}>
                  <Plus className="h-4 w-4" />
                  <span className="hidden md:block">{t('recipe.title')}</span>
                </Button>
              )}
            </div>
          </div>
          <TabsContent value="recipes" className="space-y-6">
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
                    <h3 className="text-lg font-semibold mb-2">{t('records.noRecipes')}</h3>
                    <p className="text-muted-foreground mb-6">{t('records.addFirstRecipe')}</p>
                    <Button onClick={handleAddRecipe}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('recipe.title')}
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-muted-foreground">{t('records.noRecipes')}</p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm('');
                        setTagFilter('all');
                      }}
                      className="mt-4"
                    >
                      {t('common.clear')}
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2">
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
          </TabsContent>

          <TabsContent value="consumption" className="space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">{t('common.loading')}</p>
              </div>
            ) : (
              <ConsumptionHistoryList
                history={consumptionHistory}
                onDelete={handleDeleteConsumption}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
