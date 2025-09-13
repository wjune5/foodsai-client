'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Save, Upload } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { renderSvgIcon } from '@/shared/constants/food-icons';
import { databaseService } from '@/shared/services/DatabaseService';
import { toast } from 'sonner';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { IconFormData } from '../types/interface';

interface IconFormProps {
  editingId?: string | null;
  isEditing?: boolean;
  onSubmit?: (data: IconFormData) => void;
  onCancel?: () => void;
  showCard?: boolean;
  categories?: Array<{id: string, displayName: string}>;
}

const IconForm: React.FC<IconFormProps> = ({ 
  editingId, 
  isEditing = false, 
  onSubmit, 
  onCancel,
  showCard = true,
  categories = []
}) => {
  const t = useTranslations();
  
  const FormSchema = z.object({
    name: z.string().min(1, t('icons.msg.nameRequired')),
    category: z.string().min(1, t('icons.msg.categoryRequired')),
    svgContent: z.string().min(1, t('icons.msg.svgContentRequired')),
  });
  
  type FormData = z.infer<typeof FormSchema>;
  
  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      category: '',
      svgContent: ''
    },
    mode: 'onSubmit'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load icon data for editing
  const loadIconData = useCallback(async () => {
    try {
      setIsLoading(true);
      const icon = await databaseService.getCustomIcon(editingId!);
      if (icon) {
        form.reset({
          name: icon.name,
          svgContent: icon.svgContent,
          category: icon.category
        });
      } else {
        toast.error(t('errors.notFound'));
      }
    } catch (error) {
      console.error('Failed to load icon:', error);
      toast.error(t('errors.serverError'));
    } finally {
      setIsLoading(false);
    }
  }, [editingId, t, form]);

  useEffect(() => {
    if (isEditing && editingId) {
      loadIconData();
    }
  }, [isEditing, editingId, loadIconData]);

  // Validate SVG content
  const validateSVG = (svgContent: string): boolean => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgContent, 'image/svg+xml');
      const parseError = doc.querySelector('parsererror');
      return !parseError && doc.documentElement.tagName.toLowerCase() === 'svg';
    } catch {
      return false;
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'image/svg+xml') {
      toast.error(t('icons.selectSvgFile'));
      return;
    }

    if (file.size > 1024 * 1024) { // 1MB limit
      toast.error(t('icons.msg.svgTooLarge'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const svgContent = e.target?.result as string;
      if (validateSVG(svgContent)) {
        form.setValue('name', file.name.replace(/\.[^/.]+$/, ''));
        form.setValue('svgContent', svgContent);
      } else {
        toast.error(t('icons.msg.invalidSvgFormat'));
      }
    };
    reader.readAsText(file);
  };

  // Handle form submission
  const handleSubmit = async (data: FormData) => {
    if (!validateSVG(data.svgContent)) {
      toast.error(t('icons.msg.invalidSvg'));
      return;
    }

    try {
      setIsSaving(true);

      if (onSubmit) {
        // Use custom submit handler if provided
        await onSubmit(data);
      } else {
        // Default behavior - save to database
        if (isEditing && editingId) {
          await databaseService.updateCustomIcon(editingId, {
            name: data.name,
            svgContent: data.svgContent,
            category: data.category,
          });
          toast.success(t('message.updateSuccess'));
        } else {
          await databaseService.addCustomIcon({
            id: '',
            name: data.name,
            svgContent: data.svgContent,
            category: data.category,
            builtIn: false,
            isActive: true
          });
          toast.success(t('message.addSuccess'));
        }
      }
    } catch (error) {
      console.error('Failed to save icon:', error);
      toast.error(t('errors.serverError'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="text-lg">{t('common.loading')}...</div>
      </div>
    );
  }

  const formContent = (
    <>
      <style jsx>{`
        .svg-container svg {
          max-width: 100%;
          max-height: 100%;
          width: auto;
          height: auto;
        }
      `}</style>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('icons.iconLabel')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('icons.enterIconName')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('icons.iconCategory')}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('icons.selectCategory')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {(category.displayName || category.id).charAt(0).toUpperCase() + (category.displayName || category.id).slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="svgContent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('icons.svgContent')}</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <Textarea
                      placeholder={t('icons.pasteSvgHere')}
                      className="h-32 text-sm font-mono resize-none"
                      {...field}
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{t('common.or')}</span>
                      <input
                        id="svg-upload"
                        type="file"
                        accept=".svg"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('svg-upload')?.click()}
                      >
                        <Upload className="w-3 h-3 mr-1" />
                        {t('common.uploadFile')}
                      </Button>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.watch('svgContent') && (
            <div>
              <Label>{t('icons.preview')}</Label>
              <div className="mt-2 p-4 border rounded-lg flex items-center justify-center bg-gray-50">
                {renderSvgIcon(form.watch('svgContent'), false)}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSaving}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving
                ? t('common.saving')
                : t('common.save')
              }
            </Button>
          </div>
        </form>
      </Form>
    </>
  );

  if (showCard) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? t('icons.editIcon') : t('icons.addIcon')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {formContent}
        </CardContent>
      </Card>
    );
  }

  return formContent;
};

export default IconForm;
