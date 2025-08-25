'use client';

import React, { useState, useEffect } from 'react';
import { Recipe } from '@/shared/entities/inventory';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { 
  Plus, 
  Minus, 
  Upload, 
  X,
  Clock,
  Users,
  ChefHat,
  Hash,
  FileText,
  List
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';

interface RecipeFormProps {
  recipe?: Recipe;
  onSave: (recipe: Omit<Recipe, 'id' | 'createTime' | 'updateTime'>) => void;
  onCancel: () => void;
}

export default function RecipeForm({ recipe, onSave, onCancel }: RecipeFormProps) {
  const t = useTranslations();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ingredients: [''],
    instructions: [''],
    cookingTime: undefined as number | undefined,
    servings: undefined as number | undefined,
    difficulty: '',
    tags: [] as string[],
    img: ''
  });
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (recipe) {
      setFormData({
        name: recipe.name,
        description: recipe.description || '',
        ingredients: recipe.ingredients.length > 0 ? recipe.ingredients : [''],
        instructions: recipe.instructions.length > 0 ? recipe.instructions : [''],
        cookingTime: recipe.cookingTime,
        servings: recipe.servings,
        difficulty: recipe.difficulty || '',
        tags: recipe.tags || [],
        img: recipe.img || ''
      });
    }
  }, [recipe]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('recipes.nameRequired');
    }

    const validIngredients = formData.ingredients.filter(ingredient => ingredient.trim());
    if (validIngredients.length === 0) {
      newErrors.ingredients = t('recipes.ingredientsRequired');
    }

    const validInstructions = formData.instructions.filter(instruction => instruction.trim());
    if (validInstructions.length === 0) {
      newErrors.instructions = t('recipes.instructionsRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    const recipeData = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      ingredients: formData.ingredients.filter(ingredient => ingredient.trim()),
      instructions: formData.instructions.filter(instruction => instruction.trim()),
      cookingTime: formData.cookingTime,
      servings: formData.servings,
      difficulty: formData.difficulty || undefined,
      tags: formData.tags,
      img: formData.img || undefined
    };

    onSave(recipeData);
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, '']
    }));
  };

  const removeIngredient = (index: number) => {
    if (formData.ingredients.length > 1) {
      setFormData(prev => ({
        ...prev,
        ingredients: prev.ingredients.filter((_, i) => i !== index)
      }));
    }
  };

  const updateIngredient = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ingredient, i) => 
        i === index ? value : ingredient
      )
    }));
  };

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }));
  };

  const removeInstruction = (index: number) => {
    if (formData.instructions.length > 1) {
      setFormData(prev => ({
        ...prev,
        instructions: prev.instructions.filter((_, i) => i !== index)
      }));
    }
  };

  const updateInstruction = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.map((instruction, i) => 
        i === index ? value : instruction
      )
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit
        toast.error('Image size must be less than 1MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({
          ...prev,
          img: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-6 w-6" />
            {recipe ? t('recipes.editRecipe') : t('recipes.addRecipe')}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">{t('recipes.recipeName')} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Chocolate Chip Cookies"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="description">{t('recipes.recipeDescription')}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="A delicious recipe that..."
                  className="min-h-[80px]"
                />
              </div>

              {/* Recipe Details Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="cookingTime" className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {t('recipes.cookingTime')}
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="cookingTime"
                      type="number"
                      min="1"
                      value={formData.cookingTime || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        cookingTime: e.target.value ? parseInt(e.target.value) : undefined 
                      }))}
                    />
                    <span className="text-sm text-muted-foreground">
                      {t('recipes.cookingTimeMinutes')}
                    </span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="servings" className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {t('recipes.servings')}
                  </Label>
                  <Input
                    id="servings"
                    type="number"
                    min="1"
                    value={formData.servings || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      servings: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                  />
                </div>

                <div>
                  <Label htmlFor="difficulty">{t('recipes.difficulty')}</Label>
                  <Select 
                    value={formData.difficulty} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">{t('recipes.difficultyLevels.easy')}</SelectItem>
                      <SelectItem value="medium">{t('recipes.difficultyLevels.medium')}</SelectItem>
                      <SelectItem value="hard">{t('recipes.difficultyLevels.hard')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <Label className="flex items-center gap-1">
                <Upload className="h-4 w-4" />
                {t('recipes.image')}
              </Label>
              <div className="mt-2">
                {formData.img ? (
                  <div className="relative">
                    <img 
                      src={formData.img} 
                      alt="Recipe" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => setFormData(prev => ({ ...prev, img: '' }))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Upload recipe image</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <Button type="button" variant="outline" asChild>
                      <label htmlFor="image-upload" className="cursor-pointer">
                        Choose Image
                      </label>
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <Label className="flex items-center gap-1">
                <List className="h-4 w-4" />
                {t('recipes.ingredients')} *
              </Label>
              <div className="space-y-2 mt-2">
                {formData.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={ingredient}
                      onChange={(e) => updateIngredient(index, e.target.value)}
                      placeholder={t('recipes.ingredientPlaceholder')}
                      className={errors.ingredients ? 'border-red-500' : ''}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeIngredient(index)}
                      disabled={formData.ingredients.length === 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addIngredient}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('recipes.addIngredient')}
                </Button>
                {errors.ingredients && <p className="text-sm text-red-500">{errors.ingredients}</p>}
              </div>
            </div>

            {/* Instructions */}
            <div>
              <Label className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                {t('recipes.instructions')} *
              </Label>
              <div className="space-y-2 mt-2">
                {formData.instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {index + 1}
                        </Badge>
                      </div>
                      <Textarea
                        value={instruction}
                        onChange={(e) => updateInstruction(index, e.target.value)}
                        placeholder={t('recipes.instructionPlaceholder')}
                        className={`${errors.instructions ? 'border-red-500' : ''} min-h-[60px]`}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeInstruction(index)}
                      disabled={formData.instructions.length === 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addInstruction}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('recipes.addInstruction')}
                </Button>
                {errors.instructions && <p className="text-sm text-red-500">{errors.instructions}</p>}
              </div>
            </div>

            {/* Tags */}
            <div>
              <Label className="flex items-center gap-1">
                <Hash className="h-4 w-4" />
                {t('recipes.tags')}
              </Label>
              <div className="space-y-2 mt-2">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder={t('recipes.tagPlaceholder')}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addTag}
                    disabled={!newTag.trim() || formData.tags.includes(newTag.trim())}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-xs hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {recipe ? t('common.save') : t('recipes.addRecipe')}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                {t('common.cancel')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
