'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ConsumptionHistory, Inventory, Recipe, InventoryImage } from '@/shared/entities/inventory';
import { databaseService } from '@/shared/services/DatabaseService';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Calendar } from '@/shared/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import {
  CalendarIcon,
  Upload,
  X,
  Plus,
  Utensils,
  ChefHat,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ConsumptionHistoryFormProps {
  initialData?: ConsumptionHistory;
  mode?: 'add' | 'edit';
  onAdd: (history: Omit<ConsumptionHistory, 'id' | 'createTime' | 'updateTime'>) => void;
  onEdit: (history: Omit<ConsumptionHistory, 'id' | 'createTime' | 'updateTime'>) => void;
  onCancel: () => void;
}

const ConsumptionHistoryForm: React.FC<ConsumptionHistoryFormProps> = ({
  initialData,
  mode = 'add',
  onAdd,
  onEdit,
  onCancel
}) => {
  const t = useTranslations();
  const [inventoryItems, setInventoryItems] = useState<Inventory[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [open, setOpen] = useState(false);

  const consumptionSchema = z.object({
    type: z.enum(['recipe', 'food']),
    itemId: z.string().optional(),
    itemName: z.string().min(1, 'Item name is required'),
    recipeId: z.string().optional(),
    recipeName: z.string().optional(),
    quantity: z.coerce.number().min(0.1, 'Quantity must be greater than 0'),
    unit: z.string().optional(),
    consumedAt: z.date(),
    notes: z.string().optional()
  });

  type ConsumptionFormData = z.infer<typeof consumptionSchema>;

  const form = useForm<ConsumptionFormData>({
    resolver: zodResolver(consumptionSchema),
    defaultValues: {
      type: 'food',
      itemName: '',
      quantity: 1,
      unit: 'pcs',
      consumedAt: new Date(),
      notes: '',
    },
  });

  const watchType = form.watch('type');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (initialData) {
      form.reset({
        type: initialData.type,
        itemId: initialData.itemId,
        itemName: initialData.itemName,
        quantity: initialData.quantity,
        unit: initialData.unit,
        consumedAt: initialData.consumedAt,
        notes: initialData.notes
      });
    }
  }, [initialData, form]);

  const loadData = async () => {
    try {
      const [inventoryList, recipeList] = await Promise.all([
        databaseService.getInventoryItems(),
        databaseService.getRecipes()
      ]);
      setInventoryItems(inventoryList);
      setRecipes(recipeList);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    }
  };

  const onSubmit = (data: ConsumptionFormData) => {
    const historyData = {
      type: data.type,
      itemId: data.type === 'food' ? data.itemId : undefined,
      itemName: data.itemName,
      recipeId: data.type === 'recipe' ? data.recipeId : undefined,
      recipeName: data.type === 'recipe' ? data.recipeName : undefined,
      quantity: data.quantity,
      unit: data.unit,
      consumedAt: data.consumedAt,
      notes: data.notes
    };

    if (mode === 'edit') {
      onEdit(historyData);
    } else {
      onAdd(historyData);
    }
  };

  const handleItemSelection = (itemId: string) => {
    const item = inventoryItems.find(inv => inv.id === itemId);
    if (item) {
      form.setValue('itemId', itemId);
      form.setValue('itemName', item.name);
      form.setValue('unit', item.unit);
    }
  };

  const handleRecipeSelection = (recipeId: string) => {
    const recipe = recipes.find(r => r.id === recipeId);
    if (recipe) {
      form.setValue('recipeId', recipeId);
      form.setValue('recipeName', recipe.name);
      form.setValue('itemName', recipe.name);
      form.setValue('unit', 'serving');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
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
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Type Selection */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Consumption Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select consumption type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="food">
                      <div className="flex items-center gap-2">
                        <Utensils className="h-4 w-4" />
                        Food Consumption
                      </div>
                    </SelectItem>
                    <SelectItem value="recipe">
                      <div className="flex items-center gap-2">
                        <ChefHat className="h-4 w-4" />
                        Recipe Consumption
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Item/Recipe Selection */}
          {watchType === 'food' ? (
            <FormField
              control={form.control}
              name="itemId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Food Item</FormLabel>
                  <Select onValueChange={handleItemSelection} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a food item" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {inventoryItems.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          <div className="flex items-center gap-2">
                            {item.img && (
                              <div className="w-6 h-6 rounded overflow-hidden">
                                <img 
                                  src={item.img.data} 
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <span>{item.name}</span>
                            <span className="text-muted-foreground text-sm">
                              ({item.quantity} {item.unit})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <FormField
              control={form.control}
              name="recipeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipe</FormLabel>
                  <Select onValueChange={handleRecipeSelection} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a recipe" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {recipes.map((recipe) => (
                        <SelectItem key={recipe.id} value={recipe.id}>
                          <div className="flex items-center gap-2">
                            {recipe.img && (
                              <div className="w-6 h-6 rounded overflow-hidden">
                                <img 
                                  src={recipe.img.data} 
                                  alt={recipe.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <span>{recipe.name}</span>
                            {recipe.servings && (
                              <span className="text-muted-foreground text-sm">
                                ({recipe.servings} servings)
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Manual Item Name (if not selected from list) */}
          <FormField
            control={form.control}
            name="itemName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter item name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Quantity and Unit */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., pcs, kg, liters"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Consumption Date */}
          <FormField
            control={form.control}
            name="consumedAt"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Consumption Date</FormLabel>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date);
                        setOpen(false);
                      }}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Notes */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Add any notes about this consumption..."
                    className="min-h-[80px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Form Actions */}
          <div className="flex gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {mode === 'edit' ? 'Update' : 'Add'} Consumption
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ConsumptionHistoryForm;
