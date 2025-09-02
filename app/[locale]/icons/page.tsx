'use client';

import React, { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Plus, Trash2, Upload, Save, X, Grid3X3, List } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/Dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { DEFAULT_FOOD_ICONS, ICON_COMPONENT_MAP } from '@/shared/constants/food-icons';
import { CustomIcon } from '@/shared/entities/setting';
import { Category } from '@/shared/entities/inventory';
import { databaseService } from '@/shared/services/DatabaseService';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

export default function IconsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [customIcons, setCustomIcons] = useState<CustomIcon[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIcon, setEditingIcon] = useState<CustomIcon | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
  // Load custom icons and categories from database
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      // Load both icons and categories concurrently
      const [icons, dbCategories] = await Promise.all([
        databaseService.getCustomIcons(),
        databaseService.getCategories(locale)
      ]);
      if (icons.length === 0) {
        DEFAULT_FOOD_ICONS.forEach(icon => {
          databaseService.addCustomIcon(icon);
        });
        databaseService.getCustomIcons().then(icons => {
          setCustomIcons(icons);
        });
      } else {
        setCustomIcons(icons);
      }
      
      setCategories(dbCategories);
      form.setValue('category', dbCategories[0].id);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error(t('errors.serverError'));
    } finally {
      setIsLoading(false);
    }
  };

  const loadIcons = async () => {
    try {
      const icons = await databaseService.getCustomIcons();
      setCustomIcons(icons);
    } catch (error) {
      console.error('Failed to load custom icons:', error);
      toast.error(t('errors.serverError'));
    }
  };

  // Open modal for adding new icon
  const handleAddIcon = () => {
    setEditingIcon(null);
    form.reset({
      name: '',
      svgContent: '',
      category: categories.length > 0 ? categories[0].id : ''
    });
    setIsModalOpen(true);
  };

  // Open modal for editing icon
  const handleEdit = (icon: CustomIcon) => {
    setEditingIcon(icon);
    form.reset({
      name: icon.name,
      svgContent: icon.svgContent as string,
      category: icon.category
    });
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingIcon(null);
    form.reset({
      name: '',
      svgContent: '',
      category: ''
    });
  };

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

      if (editingIcon) {
        await databaseService.updateCustomIcon(editingIcon.id, {
          name: data.name,
          svgContent: data.svgContent,
          category: data.category,
        });
        toast.success(t('message.editSuccess'));
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

      await loadIcons(); // Refresh the list
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save icon:', error);
      toast.error(t('errors.serverError'));
    } finally {
      setIsSaving(false);
    }
  };

  // Delete icon
  const handleDelete = async (iconId: string) => {
    if (confirm(t('icons.msg.confirmDelete'))) {
      try {
        await databaseService.deleteCustomIcon(iconId);
        await loadIcons(); // Refresh the list
        toast.success(t('message.deleteSuccess'));
      } catch (error) {
        console.error('Failed to delete icon:', error);
        toast.error(t('errors.serverError'));
      }
    }
  };

  // Import icons
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importedIcons = JSON.parse(e.target?.result as string);
        if (Array.isArray(importedIcons)) {
          let importedCount = 0;
          for (const iconData of importedIcons) {
            try {
              // Check if icon with same name already exists
              const existing = customIcons.find(icon => icon.name === iconData.name);
              if (!existing) {
                await databaseService.addCustomIcon({
                  id: '',
                  name: iconData.name,
                  svgContent: iconData.svgContent || iconData.svg, // Handle both field names
                  category: iconData.category,
                  builtIn: false,
                  isActive: true
                });
                importedCount++;
              }
            } catch (error) {
              console.error('Failed to import icon:', iconData.name, error);
            }
          }

          await loadIcons(); // Refresh the list
          toast.success(t('icons.msg.importSuccess', { count: importedCount }));
        }
      } catch (error) {
        console.error('Failed to parse import file:', error);
        toast.error(t('icons.msg.invalidJsonFile'));
      }
    };
    reader.readAsText(file);
  };

  // Filter icons by category
  const filteredIcons = selectedCategory === 'all'
    ? customIcons
    : customIcons.filter(icon => icon.category === selectedCategory);

  const categoryOptions = [{id: 'all', displayName: 'all'}, ...categories];

  // Render SVG icon
  const renderSvgIcon = (svg: string, builtIn: boolean) => {
    if (builtIn) {
      const IconComponent = ICON_COMPONENT_MAP[svg] as React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
      return (
        <div className="w-12 h-12 flex items-center justify-center">
          <IconComponent className="w-full h-full" />
        </div>
      );
    }
    return (
      <div className="w-12 h-12 flex items-center justify-center overflow-hidden">
        <div 
          className="w-full h-full flex items-center justify-center svg-container"
          dangerouslySetInnerHTML={{ 
            __html: svg.replace(/width="[^"]*"/, 'width="100%"').replace(/height="[^"]*"/, 'height="100%"')
          }} 
        />
      </div>
    );
  };

  // Render SVG preview
  const renderSvgPreview = (svg: string) => {
    return (
      <div className="w-16 h-16 flex items-center justify-center border rounded-lg bg-gray-50 overflow-hidden">
        <div 
          className="w-full h-full flex items-center justify-center svg-container"
          dangerouslySetInnerHTML={{ 
            __html: svg.replace(/width="[^"]*"/, 'width="100%"').replace(/height="[^"]*"/, 'height="100%"')
          }} 
        />
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="text-center py-12">
          <div className="text-lg">{t('common.loading')}...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <style jsx>{`
        .svg-container svg {
          max-width: 100%;
          max-height: 100%;
          width: auto;
          height: auto;
        }
      `}</style>
      <Toaster position="top-right" />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('icons.title')}</h1>
        <div className="flex gap-2">
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
            id="import-input"
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById('import-input')?.click()}
          >
            <Upload className="w-4 h-4" />
          </Button>
          <Button onClick={handleAddIcon}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Category Filter and View Toggle */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48 mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.length > 0 && categoryOptions.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.id === 'all' ? t('icons.allCategories') : category.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Icons Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-4">
          {filteredIcons.map((icon) => (
            <Card key={icon.id} className="relative group hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleEdit(icon)}>
              <CardContent className="py-3 px-0">
                <div className="flex flex-col items-center space-y-2 relative">
                  <div className="w-16 h-16 flex items-center justify-center border rounded-lg bg-gray-50 overflow-hidden">
                    {renderSvgIcon(icon.svgContent, icon.builtIn)}
                  </div>
                  <div className="absolute -top-3 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(icon.id);
                      }}
                      className="h-6 w-6 p-0 bg-red-50 hover:bg-red-100"
                    >
                      <Trash2 className="w-3 h-3 text-red-600" />
                    </Button>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="font-medium text-sm text-gray-900 truncate w-full">{icon.name}</div>
                    <div className="text-xs text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                        {icon.categoryName}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredIcons.map((icon) => (
            <Card key={icon.id} className="relative group hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleEdit(icon)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-12 h-12 flex items-center justify-center border rounded-lg bg-gray-50 flex-shrink-0 overflow-hidden">
                        {renderSvgIcon(icon.svgContent, icon.builtIn)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900">{icon.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-600">
                          {icon.categoryName}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(icon.id);
                      }}
                      className="h-6 w-6 p-0 bg-red-50 hover:bg-red-100"
                    >
                      <Trash2 className="w-3 h-3 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredIcons.length === 0 && (
        <div className="text-center py-12">
          {customIcons.length === 0 ? (
            <>
              <p className="text-gray-500 mb-4">{t('icons.noCustomIcons')}</p>
              <Button onClick={handleAddIcon}>
                <Plus className="w-4 h-4 mr-2" />
                {t('icons.createFirstIcon')}
              </Button>
            </>
          ) : (
            <p className="text-gray-500">{t('icons.noIconsInCategory')}</p>
          )}
        </div>
      )}

      {/* Add/Edit Icon Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl p-6">
          <DialogHeader>
            <DialogTitle>
              {t('icons.editIcon')}
            </DialogTitle>
          </DialogHeader>
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
                            {(category.displayName || category.name).charAt(0).toUpperCase() + (category.displayName || category.name).slice(1)}
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
                    {renderSvgPreview(form.watch('svgContent'))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
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
        </DialogContent>
      </Dialog>
    </div>
  );
}