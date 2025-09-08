'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
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
import {toast, Toaster } from 'sonner';
import Resizer from 'react-image-file-resizer';
import { useImageUpload } from '@/shared/hooks/useImageUpload';

interface RecipeFormProps {
  initialData?: Recipe;
  mode?: 'add' | 'edit';
  onAdd: (recipe: Omit<Recipe, 'id' | 'createTime' | 'updateTime'>) => void;
  onEdit: (recipe: Omit<Recipe, 'id' | 'createTime' | 'updateTime'>) => void;
}

const RecipeForm: React.FC<RecipeFormProps> = ({ onAdd, onEdit, initialData, mode = 'add' }) => {
  const t = useTranslations();
  const { uploadImage, isUploading } = useImageUpload();

  const recipeSchema = z.object({
    name: z.string().min(1, t('recipe.nameRequired')),
    description: z.string().optional(),
    ingredients: z.array(z.string()).optional(),
    instructions: z.array(z.string()).optional(),
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
      ingredients: [''],
      instructions: [''],
      cookingTime: 10,
      servings: 1,
      difficulty: 'easy',
      tags: [],
      img: undefined,
    },
  });

  const [newTag, setNewTag] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [imageData, setImageData] = useState<InventoryImage | undefined>(undefined);
  const [showImagePreview, setShowImagePreview] = useState(false);

  // Watch the fields to get real-time updates
  const watchedTags = form.watch('tags') || [];
  const watchedIngredients = form.watch('ingredients') || [];
  const watchedInstructions = form.watch('instructions') || [];

  // Initialize form with recipe data
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        description: initialData.description || '',
        ingredients: initialData.ingredients.length > 0
          ? initialData.ingredients
          : [''],
        instructions: initialData.instructions.length > 0
          ? initialData.instructions
          : [''],
        cookingTime: initialData.cookingTime,
        servings: initialData.servings,
        difficulty: initialData.difficulty as 'easy' | 'medium' | 'hard' | undefined,
        tags: initialData.tags || [],
        img: initialData.img,
      });
      setImageData(initialData.img);
    }
  }, [initialData, form]);

  const onSubmit = (data: RecipeFormData) => {
    console.log(data)
    const recipeData = {
      name: data.name.trim(),
      description: data.description?.trim() || undefined,
      ingredients: data.ingredients?.map(ing => ing.trim())
        .filter(ing => ing.length > 0) || [],
      instructions: data.instructions?.map(inst => inst.trim())
        .filter(inst => inst.length > 0) || [],
      cookingTime: data.cookingTime,
      servings: data.servings,
      difficulty: data.difficulty,
      tags: data.tags,
      img: data.img,
    };

    if (mode === 'edit') {
      onEdit(recipeData);
    } else {
      onAdd(recipeData);
    }
  };

  const processImageFile = async (file: File, field?: any) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }
    
    let currentFile = file;
    let resizedBase64: string | null = null;
    let maxSize = 1024; // Start with 1024px
    // Keep resizing until file size is under 1MB
    while (currentFile.size > 1024 * 1024) { // 1MB limit
      toast.warning('Image size must be less than 1MB, resizing...');
      
      // Create a custom resize function with current maxSize
      resizedBase64 = await new Promise<string>((resolve) => {
        Resizer.imageFileResizer(
          currentFile,
          maxSize,
          maxSize,
          "JPEG",
          90, // Lower quality for smaller file size
          0,
          (uri) => {
            resolve(uri as string);
          },
          "base64"
        );
      });
      
      // Convert base64 back to File to check size
      const response = await fetch(resizedBase64);
      const blob = await response.blob();
      currentFile = new File([blob], currentFile.name, { type: 'image/jpeg' });
    }
    
    // If we have a resized base64 string, use it directly
    if (resizedBase64) {
      const imageData: InventoryImage = {
        id: Date.now().toString(),
        fileName: currentFile.name,
        mimeType: 'image/jpeg', // Resized files are always JPEG
        size: resizedBase64.length, // Approximate size
        data: resizedBase64
      };
      setImageData(imageData);
      if (field) {
        field.onChange(imageData);
      } else {
        form.setValue('img', imageData, { shouldValidate: true, shouldDirty: true });
      }
      return;
    }
    
    // If no resizing was needed, use FileReader with the original file
    const reader = new FileReader();
    reader.onload = () => {
      const imageData: InventoryImage = {
        id: Date.now().toString(),
        fileName: currentFile.name,
        mimeType: currentFile.type,
        size: currentFile.size,
        data: reader.result as string
      };
      setImageData(imageData);
      if (field) {
        field.onChange(imageData);
      } else {
        form.setValue('img', imageData, { shouldValidate: true, shouldDirty: true });
      }
    };
    reader.readAsDataURL(currentFile);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field?: any) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file, field);
      // Create a local preview URL so the image shows immediately
      const localPreviewUrl = URL.createObjectURL(file);

      const result = await uploadImage(file);
      if (result.success) {
          form.setValue('img', {
              id: 'local',
              fileName: result.imageUrl || file.name,
              mimeType: file.type || 'image/jpeg',
              size: file.size || 0,
              data: localPreviewUrl
          });
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent, field?: any) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processImageFile(files[0], field);
    }
  };

  const addIngredient = () => {
    const currentIngredients = form.getValues('ingredients') || [];
    form.setValue('ingredients', [...currentIngredients, ''], { shouldValidate: true, shouldDirty: true });
  };

  const removeIngredientItem = (index: number) => {
    const currentIngredients = form.getValues('ingredients') || [];
    if (currentIngredients.length > 1) {
      const newIngredients = currentIngredients.filter((_, i) => i !== index);
      form.setValue('ingredients', newIngredients, { shouldValidate: true, shouldDirty: true });
    }
  };

  const addInstruction = () => {
    const currentInstructions = form.getValues('instructions') || [];
    form.setValue('instructions', [...currentInstructions, ''], { shouldValidate: true, shouldDirty: true });
  };

  const removeInstructionItem = (index: number) => {
    const currentInstructions = form.getValues('instructions') || [];
    if (currentInstructions.length > 1) {
      const newInstructions = currentInstructions.filter((_, i) => i !== index);
      form.setValue('instructions', newInstructions, { shouldValidate: true, shouldDirty: true });
    }
  };

  const addTag = (tag: string) => {
    const currentTags = form.getValues('tags') || [];
    if (!currentTags.includes(tag)) {
      form.setValue('tags', [...currentTags, tag], { shouldValidate: true, shouldDirty: true });
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues('tags') || [];
    form.setValue('tags', currentTags.filter(tag => tag !== tagToRemove), { shouldValidate: true, shouldDirty: true });
  };

  return (
    <>
      <Form {...form}>
        <form 
          onSubmit={form.handleSubmit(onSubmit, (errors) => {
            Object.entries(errors).forEach(([fieldName, error]) => {
              toast.error(`${error?.message}`, {
                duration: 4000,
            });
          });
        })}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
              e.preventDefault();
            }
          }}
          className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('recipe.name')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t('recipe.namePlaceholder')}
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
                    placeholder={t('recipe.descriptionPlaceholder')}
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
                    {t('recipe.cookTime')}
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
                <FormItem className="flex-1">
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

          <Controller
            control={form.control}
            name="img"
            render={({ field }) => {
              // Use field.value if available, otherwise fall back to state
              const currentImageData = field.value || imageData;
              
              return (
              <FormItem>
                <FormLabel className="flex items-center gap-1">
                  <Upload className="h-4 w-4" />
                  {t('recipe.image')}
                </FormLabel>
                <div className="space-y-3">
                  {currentImageData ? (
                    <div className="relative">
                      <img
                        src={currentImageData.data}
                        alt="Recipe"
                        className="w-full h-48 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setShowImagePreview(true)}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setImageData(undefined);
                          field.onChange(undefined);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, field)}
                      className={`block border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                        isDragOver 
                          ? 'border-blue-400 bg-blue-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload className={`h-8 w-8 mx-auto mb-2 ${
                          isDragOver ? 'text-blue-400' : 'text-gray-400'
                        }`} />
                        <p className="text-sm text-gray-600 mb-2">
                          {isDragOver ? 'Drop image here' : t('common.uploadImage')}
                        </p>
                        <p className="text-xs text-gray-500 mb-2">
                          {t('common.dragAndDrop')}
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, field)}
                          className="hidden"
                          id="image-upload"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </FormItem>
              );
            }}
          />

          <FormItem>
            <FormLabel className="flex items-center gap-1">
              <List className="h-4 w-4" />
              {t('recipe.ingredients')}
            </FormLabel>
            <div className="space-y-2">
              {watchedIngredients.map((ingredient, index) => (
                <FormField
                  key={index}
                  control={form.control}
                  name={`ingredients.${index}`}
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
                          disabled={watchedIngredients.length === 1}
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
              {t('recipe.instructions')}
            </FormLabel>
            <div className="space-y-3">
              {watchedInstructions.map((instruction, index) => (
                <FormField
                  key={index}
                  control={form.control}
                  name={`instructions.${index}`}
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
                          disabled={watchedInstructions.length === 1}
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newTag.trim() && !watchedTags.includes(newTag.trim())) {
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
                    if (newTag.trim() && !watchedTags.includes(newTag.trim())) {
                      addTag(newTag.trim());
                      setNewTag('');
                    }
                  }}
                  disabled={!newTag.trim() || watchedTags.includes(newTag.trim())}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {watchedTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {watchedTags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
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
            <Button type="submit" className="flex-1" data-form-submit="true">
              {t('common.save')}
            </Button>
          </div>
        </form>
      </Form>
      
      {/* Image Preview Modal */}
      {showImagePreview && imageData && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowImagePreview(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <img
              src={imageData.data}
              alt="Recipe Preview"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => setShowImagePreview(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default RecipeForm;