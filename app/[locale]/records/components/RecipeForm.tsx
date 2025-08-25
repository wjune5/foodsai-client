'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Recipe, InventoryImage } from '@/shared/entities/inventory';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/shared/components/ui/form';
import {
  Plus,
  Minus,
  Upload,
  X,
  Clock,
  Users,
  Hash,
  FileText,
  List
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast, { Toaster } from 'react-hot-toast';

interface RecipeFormProps {
  initialData?: Recipe;
  mode?: 'add' | 'edit';
  onAdd: (recipe: Omit<Recipe, 'id' | 'createTime' | 'updateTime'>) => void;
  onEdit: (recipe: Omit<Recipe, 'id' | 'createTime' | 'updateTime'>) => void;
}

const RecipeForm: React.FC<RecipeFormProps> = ({ onAdd, onEdit, initialData, mode = 'add' }) => {
  const t = useTranslations();

  const recipeSchema = z.object({
    name: z.string().min(1, t('recipe.nameRequired')),
    description: z.string().optional(),
    ingredients: z.array(z.object({
      value: z.string()
    })).min(1, t('recipe.ingredientsRequired')).optional(),
    instructions: z.array(z.object({
      value: z.string()
    })).min(1, t('recipe.instructionsRequired')).optional(),
    cookingTime: z.coerce.number().min(1),
    servings: z.coerce.number().min(1),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    tags: z.array(z.string()).optional(),
    img: z.object({
      id: z.string(),
      fileName: z.string(),
      mimeType: z.string(),
      size: z.number(),
      data: z.string()
    }).optional(),
  });

  type RecipeFormData = z.infer<typeof recipeSchema>;

  const form = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      name: '',
      description: '',
      ingredients: [{ value: '' }],
      instructions: [{ value: '' }],
      cookingTime: 10,
      servings: 1,
      difficulty: 'easy',
      tags: [],
      img: undefined,
    },
  });

  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({
    control: form.control,
    name: 'ingredients',
  });

  const {
    fields: instructionFields,
    append: appendInstruction,
    remove: removeInstruction,
  } = useFieldArray({
    control: form.control,
    name: 'instructions',
  });

  // Initialize form with recipe data
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        description: initialData.description || '',
        ingredients: initialData.ingredients.length > 0
          ? initialData.ingredients.map(ing => ({ value: ing }))
          : [{ value: '' }],
        instructions: initialData.instructions.length > 0
          ? initialData.instructions.map(inst => ({ value: inst }))
          : [{ value: '' }],
        cookingTime: initialData.cookingTime,
        servings: initialData.servings,
        difficulty: initialData.difficulty as 'easy' | 'medium' | 'hard' | undefined,
        tags: initialData.tags || [],
        img: initialData.img,
      });
      setTags(initialData.tags || []);
    }
  }, [initialData, form]);

  const onSubmit = (data: RecipeFormData) => {
    const recipeData = {
      name: data.name.trim(),
      description: data.description?.trim() || undefined,
      ingredients: data.ingredients?.map(ing => ing.value.trim())
        .filter(ing => ing.length > 0) || [],
      instructions: data.instructions?.map(inst => inst.value.trim())
        .filter(inst => inst.length > 0) || [],
      cookingTime: data.cookingTime,
      servings: data.servings,
      difficulty: data.difficulty,
      tags: tags,
      img: data.img,
    };

    if (mode === 'edit') {
      onEdit(recipeData);
    } else {
      onAdd(recipeData);
    }
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
        const imageData: InventoryImage = {
          id: Date.now().toString(),
          fileName: file.name,
          mimeType: file.type,
          size: file.size,
          data: reader.result as string
        };
        form.setValue('img', imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const addIngredient = () => {
    appendIngredient({ value: '' });
  };

  const removeIngredientItem = (index: number) => {
    if (ingredientFields.length > 1) {
      removeIngredient(index);
    }
  };

  const addInstruction = () => {
    appendInstruction({ value: '' });
  };

  const removeInstructionItem = (index: number) => {
    if (instructionFields.length > 1) {
      removeInstruction(index);
    }
  };

  const addTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <>
      <Toaster position="top-right" />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
          Object.entries(errors).forEach(([fieldName, error]) => {
            toast.error(`${error?.message}`, {
              duration: 4000,
              position: 'top-right',
            });
          });
        })} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('recipe.name')} *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g., Chocolate Chip Cookies"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('recipe.description')}</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="A delicious recipe that..."
                    className="min-h-[80px]"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="cookingTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {t('recipe.cookingTime')}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type="number"
                        min="1"
                        value={field.value || ''}
                        className="pr-16"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                        {t('recipe.minutes')}
                      </span>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="servings"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {t('recipe.servings')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="1"
                      value={field.value || ''}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('recipe.difficulty')}</FormLabel>
                  <Select
                    value={field.value || ''}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="easy">{t('recipe.difficultyLevels.easy')}</SelectItem>
                      <SelectItem value="medium">{t('recipe.difficultyLevels.medium')}</SelectItem>
                      <SelectItem value="hard">{t('recipe.difficultyLevels.hard')}</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="img"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1">
                  <Upload className="h-4 w-4" />
                  {t('recipe.image')}
                </FormLabel>
                <div className="space-y-3">
                  {field.value ? (
                    <div className="relative">
                      <img
                        src={field.value.data}
                        alt="Recipe"
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => form.setValue('img', undefined)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label
                      htmlFor="image-upload"
                      className="block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                    >
                      <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-2">{t('common.uploadImage')}</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                    </label>
                  )}
                </div>
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel className="flex items-center gap-1">
              <List className="h-4 w-4" />
              {t('recipe.ingredients')} *
            </FormLabel>
            <div className="space-y-2">
              {ingredientFields.map((ingredient, index) => (
                <FormField
                  key={ingredient.id}
                  control={form.control}
                  name={`ingredients.${index}.value`}
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t('recipe.ingredientPlaceholder')}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeIngredientItem(index)}
                          disabled={ingredientFields.length === 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    </FormItem>
                  )}
                />
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addIngredient}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('recipe.addIngredient')}
              </Button>
            </div>
          </FormItem>

          <FormItem>
            <FormLabel className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              {t('recipe.instructions')} *
            </FormLabel>
            <div className="space-y-3">
              {instructionFields.map((instruction, index) => (
                <FormField
                  key={instruction.id}
                  control={form.control}
                  name={`instructions.${index}.value`}
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex gap-2 items-start">
                        <Badge variant="outline" className="text-xs mt-2 flex-shrink-0">
                          {index + 1}
                        </Badge>
                        <div className="flex-1">
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder={t('recipe.instructionPlaceholder')}
                              className="min-h-[60px]"
                            />
                          </FormControl>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeInstructionItem(index)}
                          disabled={instructionFields.length === 1}
                          className="mt-2 flex-shrink-0"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    </FormItem>
                  )}
                />
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addInstruction}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('recipe.addInstruction')}
              </Button>
            </div>
          </FormItem>

          {/* Tags */}
          <FormItem>
            <FormLabel className="flex items-center gap-1">
              <Hash className="h-4 w-4" />
              {t('recipe.tags')}
            </FormLabel>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder={t('recipe.tagPlaceholder')}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newTag.trim() && !tags.includes(newTag.trim())) {
                        addTag(newTag.trim());
                        setNewTag('');
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (newTag.trim() && !tags.includes(newTag.trim())) {
                      addTag(newTag.trim());
                      setNewTag('');
                    }
                  }}
                  disabled={!newTag.trim() || tags.includes(newTag.trim())}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
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
          </FormItem>

          {/* Form Actions */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <Button type="submit" className="flex-1">
              {t('common.save')}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

export default RecipeForm;